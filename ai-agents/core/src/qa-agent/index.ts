import { BaseAgent } from '../lib/agent';
import { AgentTask } from '../lib/queue';
import { logger } from '../lib/logger';
import { AISandbox } from '../lib/sandbox';
import * as path from 'path';

export class QAAgent extends BaseAgent {
  constructor() {
    super('QA');
  }

  async execute(task: AgentTask): Promise<void> {
    logger.info('[QAAgent] Started quality assurance checks in Docker Sandbox', { taskId: task.id });
    const { code, originalRequirements, targetFile } = task.payload;

    // Resolve the Monorepo root to copy to Sandbox
    const repoRootDir = path.resolve(__dirname, '../../../../../');
    const sandbox = new AISandbox(repoRootDir);

    try {
      // 1. Setup isolated executing environment
      await sandbox.setup();

      // 2. Inject the newly generated AI code
      if (targetFile && code) {
        await sandbox.injectFilePath(targetFile, code);
      }

      // 3. Run installation
      logger.info(`[QAAgent] Installing sandbox dependencies...`);
      const installRes = await sandbox.executeAction('install');
      if (!installRes.success) {
        throw new Error(`Sandbox installation failed:\\n${installRes.stderr}`);
      }

      // 4. Run tests in sandbox to prove code executes
      logger.info(`[QAAgent] Running test suites in Sandbox...`);
      const testRes = await sandbox.executeAction('test');
      
      if (testRes.success) {
        logger.info('[QAAgent] QA passed in Sandbox, sending to PR Agent', { taskId: task.id });
        await this.emitTask({
          id: `pr-${Date.now()}`,
          type: 'PR',
          payload: {
            approvedCode: code,
            targetFile,
            parentTaskId: task.payload.parentTaskId
          }
        });
      } else {
        logger.warn('[QAAgent] QA failures detected! Analyzing and routing for fixes.', { taskId: task.id });
        // Code did not pass tests. Sending feedback to DevAgent to fix the bug
        await this.emitTask({
          id: `dev-fix-${Date.now()}`,
          type: 'DEV',
          payload: {
            requirements: `Fix the following test failures based on original requirement: "${originalRequirements}". \\n\\nFailures:\\n${testRes.stderr}`,
            context: {
              previousCode: code,
              failedLogs: testRes.stderr,
              failedStdOut: testRes.stdout
            }
          }
        });
      }
    } catch (error: any) {
      logger.error(`[QAAgent] QA process critical failure: ${error.message}`);
      throw error;
    } finally {
      await sandbox.cleanup();
    }
  }
}
