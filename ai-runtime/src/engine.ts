import {
  DevAgent,
  QAAgent,
  RefactorAgent,
  PRAgent,
  DocAgent,
  PMAgent,
  ArchitectAgent,
  logger,
  taskQueue,
  createWorker,
  type AgentTask,
  type ArchitectExecuteResult,
  type PmExecuteResult,
} from '@repo/ai-agents';
import type { Job } from 'bullmq';
import {
  completePmPrdFromWorker,
  completePmReplyFromWorker,
  completeArchitectFromWorker,
  applyWorkflowSignal,
  markWorkflowFailed,
} from '@repo/workflow';

export class AutonomousCodingEngine {
  private isRunning = false;
  private devAgent = new DevAgent();
  private qaAgent = new QAAgent();
  private refactorAgent = new RefactorAgent();
  private prAgent = new PRAgent();
  private docAgent = new DocAgent();

  /**
   * Starts all agent workers. PM / ARCHITECT / WORKFLOW_SIGNAL use DB-aware wrappers.
   */
  public async start() {
    if (this.isRunning) {
      logger.warn('[Engine] Engine is already running.');
      return;
    }

    logger.info('[Engine] Starting Autonomous Coding Environment Loop...');

    try {
      createWorker('PM', async (job: Job<AgentTask>) => this.processPmJob(job));
      createWorker('ARCHITECT', async (job: Job<AgentTask>) => this.processArchitectJob(job));
      createWorker('WORKFLOW_SIGNAL', async (job: Job<AgentTask>) => {
        await applyWorkflowSignal(job.data.payload);
      });

      this.devAgent.startWorker();
      this.qaAgent.startWorker();
      this.refactorAgent.startWorker();
      this.prAgent.startWorker();
      this.docAgent.startWorker();

      this.isRunning = true;
      logger.info('[Engine] All autonomous agents are online and listening to the queue.');

      process.on('SIGINT', () => this.shutdown());
      process.on('SIGTERM', () => this.shutdown());
    } catch (error: any) {
      logger.error(`[Engine] Failed to start engine: ${error.message}`);
      throw error;
    }
  }

  private async processPmJob(job: Job<AgentTask>) {
    const wfId = job.data.payload?.workflowId as string | undefined;
    try {
      const pm = new PMAgent();
      const out = await pm.execute(job.data);
      if (!wfId) return out;

      if (job.data.payload?.mode === 'PM_REPLY') {
        const reply = out as { pmReply?: string };
        if (reply?.pmReply) {
          await completePmReplyFromWorker(wfId, reply.pmReply);
        }
        return out;
      }

      const prd = out as PmExecuteResult | void;
      if (prd && 'content' in prd && 'prdTargetFile' in prd) {
        await completePmPrdFromWorker(wfId, prd);
      }
      return out;
    } catch (e: any) {
      if (wfId) {
        await markWorkflowFailed(wfId, e?.message || 'PM job failed');
      }
      throw e;
    }
  }

  private async processArchitectJob(job: Job<AgentTask>) {
    const wfId = job.data.payload?.workflowId as string | undefined;
    try {
      const arch = new ArchitectAgent();
      const out = await arch.execute(job.data);
      if (wfId && out && typeof out === 'object' && 'content' in out) {
        await completeArchitectFromWorker(wfId, out as ArchitectExecuteResult);
      }
      return out;
    } catch (e: any) {
      if (wfId) {
        await markWorkflowFailed(wfId, e?.message || 'Architect job failed');
      }
      throw e;
    }
  }

  /**
   * Legacy: direct DEV queue (skips PM / PRD / architecture gates).
   */
  public async submitTask(requirements: string, context?: any): Promise<string> {
    const taskId = `task-${Date.now()}`;
    const initialJob: AgentTask = {
      id: taskId,
      type: 'DEV',
      payload: {
        requirements,
        context: context || {},
      },
    };

    logger.info(`[Engine] Incoming legacy DEV task: ${taskId}`);
    await taskQueue.add('DEV', initialJob);

    return taskId;
  }

  public async shutdown() {
    logger.info('[Engine] Gracefully shutting down the autonomous coding loop...');
    this.isRunning = false;
    process.exit(0);
  }
}
