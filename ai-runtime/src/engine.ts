import { DevAgent, QAAgent, RefactorAgent, PRAgent, DocAgent, logger, taskQueue, AgentTask } from '@repo/ai-agents';

export class AutonomousCodingEngine {
  private isRunning = false;
  private devAgent = new DevAgent();
  private qaAgent = new QAAgent();
  private refactorAgent = new RefactorAgent();
  private prAgent = new PRAgent();
  private docAgent = new DocAgent();

  /**
   * Starts all agent workers. They will continuously poll the queue
   * and process tasks until terminated.
   */
  public async start() {
    if (this.isRunning) {
      logger.warn('[Engine] Engine is already running.');
      return;
    }

    logger.info('[Engine] Starting Autonomous Coding Environment Loop...');

    try {
      // 1. Start all workers to read tasks from the queue continuously
      this.devAgent.startWorker();
      this.qaAgent.startWorker();
      this.refactorAgent.startWorker();
      this.prAgent.startWorker();
      this.docAgent.startWorker();

      this.isRunning = true;
      logger.info('[Engine] All autonomous agents are online and listening to the queue.');

      // Setup a grace shutdown
      process.on('SIGINT', () => this.shutdown());
      process.on('SIGTERM', () => this.shutdown());
    } catch (error: any) {
      logger.error(`[Engine] Failed to start engine: ${error.message}`);
      throw error;
    }
  }

  /**
   * Submit a new coding requirement directly into the autonomous loop.
   */
  public async submitTask(requirements: string, context?: any): Promise<string> {
    const taskId = `task-${Date.now()}`;
    const initialJob: AgentTask = {
      id: taskId,
      type: 'DEV',
      payload: {
        requirements,
        context: context || {}
      }
    };

    logger.info(`[Engine] Incoming user task: ${taskId}`);
    await taskQueue.add('DEV', initialJob);
    
    return taskId;
  }

  /**
   * Gracefully shutdown the engine
   */
  public async shutdown() {
    logger.info('[Engine] Gracefully shutting down the autonomous coding loop...');
    this.isRunning = false;
    // For a real production app we would close connections, pause the queue, etc.
    process.exit(0);
  }
}
