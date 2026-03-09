# AI Agent System

The AI Agent System revolves around multiple specialized entities communicating through a robust message queue (BullMQ + Redis).

## Agent Roles

### 1. Dev Agent (`DEV`)
- **Input**: Human language requirements or bug descriptions from the loop.
- **Process**: Analyzes requirements against Monorepo architecture and specific rules (`ai-config.yaml`). Uses LLMs to generate standard code, tests (Vitest/Playwright), and types.
- **Output**: Generates actual code changes, determines target file paths, and forwards the payload to QA.

### 2. QA Agent (`QA`)
- **Input**: The code and file paths produced by the Dev Agent.
- **Process**: 
  - Creates an isolated ephemeral Docker container (`devops/sandbox`).
  - Synchronizes the current Monorepo code.
  - Injects the AI-generated code.
  - Installs dependencies and runs `pnpm build` & `pnpm test`.
- **Output**: If the pipeline passes, tests succeed. Code is sent to PR Agent. If tests fail, it extracts the stderr stack traces and routes a "fix" task back to the Dev Agent.

### 3. Refactor Agent (`REFACTOR`)
- **Process**: Identifies code smells, applies design patterns, and improves maintainability without altering functionality. Generates refactored code and routes it through QA.

### 4. PR Agent (`PR`)
- **Input**: QA-verified code.
- **Process**: Generates commit messages based on diff analysis, creates branches, pushes to Git, and opens a Pull Request using GitHub Actions.

### 5. Doc Agent (`DOC`)
- **Input**: Successfully created Pull Requests.
- **Process**: Scans the PR diffs, updates inline comments (JSDoc), adjusts system architecture documents, and adds entries to the changelog.

## The Queue Implementation
Agents do not call each other sequentially in memory. Instead, they emit events (e.g., `await this.emitTask({ type: 'QA', ... })`) to a Redis-backed BullMQ queue. This ensures asynchronous fault tolerance and scalability.
