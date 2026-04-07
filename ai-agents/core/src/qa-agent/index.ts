import { BaseAgent } from '../lib/agent';
import { AgentTask } from '../lib/queue';
import { logger } from '../lib/logger';
import { AISandbox } from '../lib/sandbox';
import * as path from 'path';
import { findMonorepoRoot } from '../lib/repoRoot';
import type { ArchitectTodoItem } from '../architect-agent';

export class QAAgent extends BaseAgent {
  constructor() {
    super('QA');
  }

  async execute(task: AgentTask): Promise<unknown> {
    logger.info('[QAAgent] Started quality assurance checks in Docker Sandbox', { taskId: task.id });
    const {
      code,
      originalRequirements,
      targetFile,
      workflowId,
      todoIndex,
      todos,
      requirements,
      prd,
      architectureSpec,
    } = task.payload as {
      code: string;
      originalRequirements: string;
      targetFile: string;
      workflowId?: string;
      todoIndex?: number;
      todos?: ArchitectTodoItem[];
      requirements?: string;
      prd?: string;
      architectureSpec?: string;
    };

    const repoRootDir = findMonorepoRoot();
    const sandbox = new AISandbox(repoRootDir);

    const wfTodos = Array.isArray(todos) ? todos : [];
    const idx = typeof todoIndex === 'number' ? todoIndex : 0;
    const hasWorkflow = Boolean(workflowId) && wfTodos.length > 0;

    const devRetryPayload = {
      requirements: requirements || originalRequirements,
      prd,
      architectureSpec,
      context: {} as Record<string, unknown>,
      workflowId,
      todoIndex: idx,
      todos: wfTodos,
    };

    try {
      await sandbox.setup();

      if (targetFile && code) {
        await sandbox.injectFilePath(targetFile, code);
      }

      logger.info(`[QAAgent] Installing sandbox dependencies...`);
      const installRes = await sandbox.executeAction('install');
      if (!installRes.success) {
        throw new Error(`Sandbox installation failed:\n${installRes.stderr}`);
      }

      logger.info(`[QAAgent] Running test suites in Sandbox...`);
      const testRes = await sandbox.executeAction('test');

      if (testRes.success) {
        logger.info('[QAAgent] QA passed in Sandbox', { taskId: task.id });

        if (hasWorkflow && idx + 1 < wfTodos.length) {
          await this.emitTask({
            id: `dev-next-${Date.now()}`,
            type: 'DEV',
            payload: {
              ...devRetryPayload,
              todoIndex: idx + 1,
              context: {},
            },
          });
          return;
        }

        await this.emitTask({
          id: `pr-${Date.now()}`,
          type: 'PR',
          payload: {
            approvedCode: code,
            targetFile,
            parentTaskId: task.payload.parentTaskId,
          },
        });

        if (hasWorkflow) {
          await this.emitTask({
            id: `wf-uat-${Date.now()}`,
            type: 'WORKFLOW_SIGNAL',
            payload: {
              workflowId,
              signal: 'UAT_REVIEW',
              previewHint:
                '在 monorepo 根目录执行: pnpm install && pnpm build && pnpm --filter web dev，浏览器打开 http://localhost:3000 验收。',
            },
          });
        }
      } else {
        logger.warn('[QAAgent] QA failures — routing back to DevAgent', { taskId: task.id });
        devRetryPayload.context = {
          previousCode: code,
          failedLogs: testRes.stderr,
          failedStdOut: testRes.stdout,
        };
        await this.emitTask({
          id: `dev-fix-${Date.now()}`,
          type: 'DEV',
          payload: devRetryPayload,
        });

        if (hasWorkflow) {
          await this.emitTask({
            id: `wf-qafix-${Date.now()}`,
            type: 'WORKFLOW_SIGNAL',
            payload: {
              workflowId,
              signal: 'QA_FIXING',
            },
          });
        }
      }
    } catch (error: any) {
      logger.error(`[QAAgent] QA process critical failure: ${error.message}`);
      throw error;
    } finally {
      await sandbox.cleanup();
    }
    return undefined;
  }
}
