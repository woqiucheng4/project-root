import { BaseAgent } from '../lib/agent';
import { AgentTask } from '../lib/queue';
import { logger } from '../lib/logger';
import { generateWithFallback } from '../lib/llm';
import fs from 'fs/promises';
import path from 'path';

export class DevAgent extends BaseAgent {
  constructor() {
    super('DEV');
  }

  async execute(task: AgentTask): Promise<void> {
    logger.info('[DevAgent] Started code generation', { taskId: task.id });
    const { requirements, prd, architectureSpec, context } = task.payload;

    try {
      logger.info(`[DevAgent] Analyzing and generating code via OpenAI for: ${requirements.substring(0, 50)}...`);
      logger.info(`[DevAgent] AI INSTRUCTION: "Must automatically generate Vitest unit/integration tests and Playwright E2E tests for all new features to ensure Sandbox QA runs successfully."`);

      // 1. Read the global AI rules
      const repoRootDir = path.resolve(__dirname, '../../../../../');
      let configContent = '';
      try {
        const configPath = path.join(repoRootDir, 'ai-config.yaml');
        configContent = await fs.readFile(configPath, 'utf-8');
      } catch (err) {
        logger.warn('[DevAgent] Could not read ai-config.yaml. Using fallback rules.');
      }

      // 2. Build prompts
      const systemPrompt = `You are an elite Autonomous Backend/Frontend Senior Developer Agent part of an automated coding loop.
Your task is to implement the exact code requested by the user, strictly following the provided Architecture Design Document and PRD.

GLOBAL REPOSITORY RULES:
${configContent}

OUTPUT FORMAT:
You MUST return your answer as a pure, valid JSON object (without any Markdown formatting, like \`\`\`json).
The response must exactly match this interface:
{
  "targetFile": "path/relative/to/monorepo/root/filename.ts",
  "code": "/* the fully completed raw source code to be injected */"
}
`;

      const userPrompt = `Architecture Design Specification:
${architectureSpec || 'Not Provided (Legacy Flow)'}

Product Requirements Document (PRD):
${prd || 'Not Provided (Legacy Flow)'}

Original Requirements / Task Description:
${requirements}

Additional Error/Context:
${JSON.stringify(context || {}, null, 2)}
`;

      // 3. Call Large Language Model using Fallback Wrapper
      const responseContent = await generateWithFallback({
        temperature: 0.2, // Low temperature for code consistency
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      });

      if (!responseContent) {
        throw new Error('LLM returned an empty response.');
      }

      // 4. Parse the LLM Generation
      const parsedOutput = JSON.parse(responseContent);
      const generatedTargetFile = parsedOutput.targetFile;
      const generatedCode = parsedOutput.code;

      if (!generatedTargetFile || !generatedCode) {
        throw new Error('LLM JSON output did not contain valid targetFile or code keys.');
      }

      logger.info('[DevAgent] Code synthesis successful, delegating to Docker Sandbox via QAAgent', { 
        taskId: task.id, 
        targetFile: generatedTargetFile 
      });
      
      // 5. Emit job to QA pipeline
      await this.emitTask({
        id: `qa-${Date.now()}`,
        type: 'QA',
        payload: {
          code: generatedCode,
          targetFile: generatedTargetFile,
          originalRequirements: requirements,
          parentTaskId: task.id
        }
      });
    } catch (error: any) {
      logger.error('[DevAgent] Code generation failed', { error: error.message });
      throw error;
    }
  }
}
