import { AutonomousCodingEngine } from './engine';

async function bootstrap() {
  const engine = new AutonomousCodingEngine();

  // Start the continuous autonomous loop:
  // - Starts background workers parsing BullMQ
  // - Reassigns jobs between AI agents (DEV -> QA -> PR -> DOC)
  // - Runs analysis and generation continually
  await engine.start();

  if (process.env.RUN_LEGACY_DEV_SEED === '1') {
    console.log('\n[Main] RUN_LEGACY_DEV_SEED=1 — injecting legacy DEV task...');
    await engine.submitTask('Implement a dark mode toggle for the auth module');
  } else {
    console.log(
      '\n[Main] Engine ready. Use Web 控制台创建工作流并启动 PM，或设置 RUN_LEGACY_DEV_SEED=1 走旧版直 DEV 演示。'
    );
  }
}

// Start when executed directly
if (require.main === module) {
  bootstrap().catch(err => {
    console.error('Fatal runtime error:', err);
    process.exit(1);
  });
}
