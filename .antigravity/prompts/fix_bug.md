Goal:
Fix a bug systematically with root cause analysis.

Bug description:
{BUG}

Relevant code or error:
{CODE}

Process:

Step 1 — Root Cause Analysis
- Identify the exact line(s) causing the bug.
- Explain WHY it fails (not just what fails).
- Identify whether this is: logic error / type error / async issue / missing validation / race condition / etc.

Step 2 — Impact Assessment
- Is this bug isolated or could the same pattern exist elsewhere in the codebase?
- Does fixing it require schema changes, API changes, or UI changes?
- Are there tests that should have caught this? If so, why didn't they?

Step 3 — Fix Strategy
- Describe the fix approach before writing code.
- If multiple approaches exist, list trade-offs and recommend one.

Step 4 — Code Patch
- Show the minimal diff needed to fix the bug.
- Do NOT refactor unrelated code in the same PR.
- Add or update tests to prevent regression.

Step 5 — Verification
- Describe how to verify the fix is correct.
- List the test commands to run.

Constraints:
- Do not change public API signatures unless necessary.
- Do not change database schema unless the bug is a data model issue.
- The fix must not break TypeScript strict mode.
