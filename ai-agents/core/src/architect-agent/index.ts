import { BaseAgent } from '../lib/agent';
import { AgentTask } from '../lib/queue';
import { logger } from '../lib/logger';
import { generateWithFallback } from '../lib/llm';
import fs from 'fs/promises';
import path from 'path';

export class ArchitectAgent extends BaseAgent {
  constructor() {
    super('ARCHITECT');
  }

  async execute(task: AgentTask): Promise<void> {
    logger.info('[ArchitectAgent] Started Architecture Spec generation', { taskId: task.id });
    const { requirements, prd, prdTargetFile, parentTaskId } = task.payload;

    try {
      logger.info(`[ArchitectAgent] Analyzing PRD and creating Architecture Spec...`);

      const systemPrompt = `You are an elite System Architect Agent following the BMad Method in an automated coding loop.
Your task is to take a Product Requirements Document (PRD) and output a formal Architecture Design Document (ADD) in Markdown format.

OUTPUT FORMAT:
Return a valid JSON object matching this interface (DO NOT wrap in Markdown code blocks):
{
  "specTargetFile": "docs/architecture/filename.md",
  "content": "# Architecture Design Document... (the full markdown string)"
}

The ADD MUST INCLUDE:
1. System Component Diagram (Mermaid)
2. API Interface Contracts
3. Database Models / ER Diagrams
4. Directory Structure changes
5. Technical Considerations
`;

      const userPrompt = `Analyzed PRD:
${prd}

Original requirements (for reference):
${requirements}
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
      const specTargetFile = parsedOutput.specTargetFile;
      const content = parsedOutput.content;

      if (!specTargetFile || !content) {
        throw new Error('LLM JSON output did not contain valid specTargetFile or content keys.');
      }

      // Write to docs
      const repoRootDir = path.resolve(__dirname, '../../../../../');
      const fullPath = path.join(repoRootDir, specTargetFile);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, 'utf-8');

      logger.info('[ArchitectAgent] Architecture Spec generated successfully, saved to', { specTargetFile });
      
      // Emit job to DEV pipeline
      await this.emitTask({
        id: `dev-${Date.now()}`,
        type: 'DEV',
        payload: {
          requirements, // keep original requirements just in case
          prd,
          architectureSpec: content,
          parentTaskId: parentTaskId || task.id
        }
      });
    } catch (error: any) {
      logger.error('[ArchitectAgent] Architecture Spec generation failed', { error: error.message });
      throw error;
    }
  }
}
