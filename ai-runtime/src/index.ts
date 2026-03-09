import { AutonomousCodingEngine } from './engine';

async function bootstrap() {
  const engine = new AutonomousCodingEngine();

  // Start the continuous autonomous loop:
  // - Starts background workers parsing BullMQ
  // - Reassigns jobs between AI agents (DEV -> QA -> PR -> DOC)
  // - Runs analysis and generation continually
  await engine.start();

  // Example entrypoint for a task:
  console.log('\n[Main] Injecting initial seed task into the autonomous loop...');
  await engine.submitTask('Implement a dark mode toggle for the auth module');
}

// Start when executed directly
if (require.main === module) {
  bootstrap().catch(err => {
    console.error('Fatal runtime error:', err);
    process.exit(1);
  });
}
