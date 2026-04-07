import { BaseAgent } from '../lib/agent';
import { AgentTask } from '../lib/queue';
import { logger } from '../lib/logger';
import { generateWithFallback } from '../lib/llm';
import fs from 'fs/promises';
import path from 'path';

export class PMAgent extends BaseAgent {
  constructor() {
    super('PM');
  }

  async execute(task: AgentTask): Promise<void> {
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
          { role: 'user', content: userPrompt }
        ]
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

      // Write to docs
      const repoRootDir = path.resolve(__dirname, '../../../../../');
      const fullPath = path.join(repoRootDir, prdTargetFile);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, 'utf-8');

      logger.info('[PMAgent] PRD generated successfully, saved to', { prdTargetFile });
      
      // Emit job to Architect pipeline
      await this.emitTask({
        id: `architect-${Date.now()}`,
        type: 'ARCHITECT',
        payload: {
          requirements,
          prd: content,
          prdTargetFile,
          parentTaskId: task.id
        }
      });
    } catch (error: any) {
      logger.error('[PMAgent] PRD generation failed', { error: error.message });
      throw error;
    }
  }
}
