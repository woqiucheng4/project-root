import { Queue, Worker, Job } from 'bullmq';
import { logger } from './logger';

export interface AgentTask {
  id: string;
  type: 'PM' | 'ARCHITECT' | 'DEV' | 'QA' | 'REFACTOR' | 'PR' | 'DOC' | 'WORKFLOW_SIGNAL';
  payload: any;
}

const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

let queueSingleton: Queue<AgentTask> | null = null;

/** Lazy queue so importing this module (e.g. during Next.js build) does not open Redis. */
export function getTaskQueue(): Queue<AgentTask> {
  if (!queueSingleton) {
    queueSingleton = new Queue<AgentTask>('agent-tasks', { connection: redisOptions });
  }
  return queueSingleton;
}

export const taskQueue = {
  add: (name: string, data: AgentTask, opts?: Parameters<Queue<AgentTask>['add']>[2]) =>
    getTaskQueue().add(name, data, opts),
};

export function createWorker(name: string, processor: (job: Job<AgentTask>) => Promise<any>) {
  const worker = new Worker<AgentTask>(
    'agent-tasks',
    async (job) => {
      logger.info(`[${name}] Processing job ${job.id}`, { type: job.data.type });
      if (job.name === name || job.data.type === name) {
        return processor(job);
      }
      logger.warn(`[${name}] Skipping job ${job.id} - unmatched type ${job.data.type}`);
    },
    { connection: redisOptions }
  );

  worker.on('completed', (job) => {
    logger.info(`[${name}] Job ${job.id} completed successfully.`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[${name}] Job ${job?.id} failed with error: ${err.message}`);
  });

  return worker;
}
