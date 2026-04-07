import { BaseAgent } from '../lib/agent';
import { AgentTask } from '../lib/queue';
import { logger } from '../lib/logger';
import { generateWithFallback } from '../lib/llm';
import fs from 'fs/promises';
import path from 'path';
import { findMonorepoRoot } from '../lib/repoRoot';

export type PmExecuteResult =
  | { prdTargetFile: string; content: string }
  | { pmReply: string };

export class PMAgent extends BaseAgent {
  constructor() {
    super('PM');
  }

  async execute(task: AgentTask): Promise<PmExecuteResult | void> {
    const mode = task.payload?.mode as string | undefined;

    if (mode === 'PM_REPLY') {
      return this.executePmReply(task);
    }

    return this.executePrdGeneration(task);
  }

  private async executePmReply(task: AgentTask): Promise<{ pmReply: string }> {
    logger.info('[PMAgent] PM discussion reply', { taskId: task.id });
    const messages = (task.payload?.messages || []) as Array<{ role: string; content: string }>;
    const transcript = messages.map((m) => `${m.role}: ${m.content}`).join('\n\n');

    const systemPrompt = `You are a senior product manager helping refine software requirements before a PRD is finalized.
Respond in the same language as the user when possible. Be concise, ask clarifying questions if needed, and summarize agreements.
Do not output JSON; write plain Markdown for the product conversation turn.`;

    const userPrompt = `Conversation so far:\n${transcript}\n\nWrite your next message as the PM.`;

    const pmReply = await generateWithFallback({
      temperature: 0.4,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    if (!pmReply?.trim()) {
      throw new Error('PM reply generation returned empty content.');
    }

    return { pmReply: pmReply.trim() };
  }

  private async executePrdGeneration(task: AgentTask): Promise<{ prdTargetFile: string; content: string }> {
    logger.info('[PMAgent] Started PRD generation', { taskId: task.id });
    const { requirements, context } = task.payload;

    try {
      logger.info(`[PMAgent] Analyzing vague requirements and structuring PRD...`);

      const systemPrompt = `You are an elite Product Manager Agent (PMAgent) following the BMad Method in an automated coding loop.
Your task is to take vague user requirements and output a formal Product Requirements Document (PRD) in Markdown format.

OUTPUT FORMAT:
Return a valid JSON object matching this interface (DO NOT wrap in Markdown code blocks):
{
  "prdTargetFile": "docs/prd/filename.md",
  "content": "# Product Requirements Document... (the full markdown string)"
}

The prdTargetFile MUST be under docs/prd/ and use a descriptive kebab-case filename ending in .md.

The PRD MUST INCLUDE:
1. Goal Description
2. User Stories
3. Feature Scope
4. Out of Scope
5. Acceptance Criteria
`;

      const userPrompt = `Requirements to analyze:
${requirements}

Additional Context:
${JSON.stringify(context || {}, null, 2)}
`;

      const responseContent = await generateWithFallback({
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      if (!responseContent) {
        throw new Error('LLM returned an empty response.');
      }

      const parsedOutput = JSON.parse(responseContent);
      const prdTargetFile = parsedOutput.prdTargetFile;
      const content = parsedOutput.content;

      if (!prdTargetFile || !content) {
        throw new Error('LLM JSON output did not contain valid prdTargetFile or content keys.');
      }

      const repoRootDir = findMonorepoRoot();
      const fullPath = path.join(repoRootDir, prdTargetFile);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, 'utf-8');

      logger.info('[PMAgent] PRD generated successfully, saved to', { prdTargetFile });

      const pauseAfterPrd = task.payload?.pauseAfterPrd === true;
      if (!pauseAfterPrd) {
        await this.emitTask({
          id: `architect-${Date.now()}`,
          type: 'ARCHITECT',
          payload: {
            requirements,
            prd: content,
            prdTargetFile,
            parentTaskId: task.id,
            workflowId: task.payload?.workflowId,
            pauseAfterSpec: task.payload?.pauseAfterSpec,
          },
        });
      }

      return { prdTargetFile, content };
    } catch (error: any) {
      logger.error('[PMAgent] PRD generation failed', { error: error.message });
      throw error;
    }
  }
}
