---
description: An autonomous agentic coding loop that constantly writes code, generates tests, runs tests, reads errors, and fixes code until it passes perfectly.
---

# Autonomous Coding Loop (Antigravity Chat-based)

This workflow instructs me (Antigravity) to act as a self-sufficient coding loop right inside the chat window. I will NOT ask for human intervention until all test cases pass perfectly. The execution of terminal commands is marked `// turbo-all`, which permits me to auto-run background terminal scripts safely without bothering the user.

// turbo-all

## Step-by-step Instructions for Antigravity (Me)

1. **Understand Task & Scope**: First, read the user's objective or feature request. Think about the clean architecture and identify what files in `packages/core-services/`, `packages/database/`, or `apps/web/` need modification.
2. **Implement Core Logic**: Use `write_to_file` or `replace_file_content` to implement the requested feature. Do not skip edge cases. 
3. **Mandatory Test Generation**: Immediately write complementary tests. If modifying a service, write a `service.test.ts` using Vitest in the same directory. If modifying the web app, write a `.spec.ts` in `apps/web/tests/e2e` for Playwright.
4. **Run Verification (The Loop Start)**: Execute the test command for the context. For backend: run `pnpm -F @repo/core-services test`. For UI: run `pnpm -F web run build` (or test:e2e). Wait for the background command to finish.
5. **Self-Healing Process (Analyze & Fix)**:
   - If the system returns an error (`Exit code: 1` or similar), deeply analyze the CLI output.
   - You MUST automatically fix the issue using code editing tools.
   - After editing, you MUST repeat Step 4 (Run Verification) over and over until the terminal output is uniformly successful.
   - Do NOT ask the user for help unless you are genuinely stuck in an unresolvable loop after 5 automated attempts.
6. **Deploy / Finalize**: Once all tests report success, tell the user the code is fully implemented and tested, and write a summary. Ask if they'd like you to PR or commit to Git.
