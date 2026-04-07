import { BaseAgent } from '../lib/agent';
import { AgentTask } from '../lib/queue';
import { logger } from '../lib/logger';
import { generateWithFallback } from '../lib/llm';
import fs from 'fs/promises';
import path from 'path';
import { findMonorepoRoot } from '../lib/repoRoot';
import type { ArchitectTodoItem } from '../architect-agent';

export class DevAgent extends BaseAgent {
  constructor() {
    super('DEV');
  }

  async execute(task: AgentTask): Promise<unknown> {
    logger.info('[DevAgent] Started code generation', { taskId: task.id });
    const { requirements, prd, architectureSpec, context, todos, todoIndex } = task.payload as {
      requirements: string;
      prd?: string;
      architectureSpec?: string;
      context?: Record<string, unknown>;
      todos?: ArchitectTodoItem[];
      todoIndex?: number;
    };

    const idx = typeof todoIndex === 'number' ? todoIndex : 0;
    const todoList = Array.isArray(todos) ? todos : [];
    const activeTodo = todoList[idx];

    let taskFocus = requirements;
    if (activeTodo) {
      taskFocus = `Workflow task ${idx + 1}/${todoList.length} — ${activeTodo.title}

Description:
${activeTodo.description}

Acceptance criteria:
${activeTodo.acceptanceCriteria}

Overall requirements context:
${requirements}`;
    }

    try {
      logger.info(`[DevAgent] Generating code for: ${taskFocus.substring(0, 80)}...`);

      const repoRootDir = findMonorepoRoot();
      let configContent = '';
      try {
        const configPath = path.join(repoRootDir, 'ai-config.yaml');
        configContent = await fs.readFile(configPath, 'utf-8');
      } catch {
        logger.warn('[DevAgent] Could not read ai-config.yaml. Using fallback rules.');
      }

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

Task (implement this now):
${taskFocus}

Additional Error/Context:
${JSON.stringify(context || {}, null, 2)}
`;

      const responseContent = await generateWithFallback({
        temperature: 0.2,
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
      const generatedTargetFile = parsedOutput.targetFile;
      const generatedCode = parsedOutput.code;

      if (!generatedTargetFile || !generatedCode) {
        throw new Error('LLM JSON output did not contain valid targetFile or code keys.');
      }

      logger.info('[DevAgent] Code synthesis successful, delegating to QAAgent', {
        taskId: task.id,
        targetFile: generatedTargetFile,
        todoStep: idx + 1,
      });

      await this.emitTask({
        id: `qa-${Date.now()}`,
        type: 'QA',
        payload: {
          code: generatedCode,
          targetFile: generatedTargetFile,
          originalRequirements: taskFocus,
          parentTaskId: task.id,
          workflowId: task.payload?.workflowId,
          todoIndex: idx,
          todos: todoList,
          requirements,
          prd,
          architectureSpec,
        },
      });
    } catch (error: any) {
      logger.error('[DevAgent] Code generation failed', { error: error.message });
      throw error;
    }
    return undefined;
  }
}
