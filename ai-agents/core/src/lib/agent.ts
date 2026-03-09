import { Job } from 'bullmq';
import { AgentTask, taskQueue, createWorker } from './queue';
import { logger } from './logger';

export abstract class BaseAgent {
  constructor(public name: string) {}

  abstract execute(task: AgentTask): Promise<void>;

  public startWorker() {
    createWorker(this.name, async (job: Job<AgentTask>) => {
      await this.execute(job.data);
    });
    logger.info(`${this.name} worker started.`);
  }

  public async emitTask(task: AgentTask) {
    logger.info(`Emitting task to queue from ${this.name}`, { taskId: task.id, target: task.type });
    await taskQueue.add(task.type, task);
  }
}
