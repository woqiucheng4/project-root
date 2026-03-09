# Autonomous Coding Loop

The Autonomous Coding Loop Engine is the brain of the platform. Once initiated, it provides continuous, unassisted code evolution inside the Monorepo.

## Loop Lifecycle

1. **Task Ingestion**: 
   - Initiated via GitHub Action issues or manual CLI commands (`engine.submitTask()`).
   - Translates business goals into actionable tickets for the queue.

2. **The Infinite Cycle**:
   - `Dev Agent` translates natural language into TypeScript code and Vitest suites.
   - `QA Agent` attempts to prove that the generated code works using an isolated Sandbox environment (`docker-compose / node:20-slim`).
   - **Feedback Mechanism**: If QA test assertions break, a retry is pushed directly into the Dev queue with the compiler error context appended. This forces the LLM to patch the logic until the test passes.

3. **Termination Conditions**:
   - The loop for a specific task ends only when a validated Git Pull Request is submitted and documentation is updated.
   - The engine as a service runs perpetually, listening to Redis connections.

## Configuration & Metarules
The behavior of the loop is governed by `ai-config.yaml` located at the root of the repository. This configuration forces the agents to respect constraints such as Clean Architecture patterns and mandatory Vitest/Playwright tests before QA approval.

## Running the Engine
```bash
# In the repository root
pnpm -F @repo/ai-runtime dev
```
This boots up all the AI workers and attaches them to the Redis queue, waiting for tasks.
