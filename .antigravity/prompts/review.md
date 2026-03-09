Goal:
Review the provided code thoroughly before it is merged or shipped.

Code to review:
{CODE}

Review dimensions:

## 1. Correctness
- Does the code do what it's supposed to do?
- Are there any logic errors, off-by-one errors, or incorrect assumptions?
- Are edge cases handled (empty arrays, null/undefined, zero, negative numbers)?

## 2. Security
- Is user input validated and sanitized before use?
- Are there any SQL injection, XSS, or injection risks?
- Are secrets or sensitive data exposed in logs, errors, or responses?
- Are protected routes properly guarded with auth middleware?

## 3. Performance
- Any unnecessary database queries inside loops (N+1 problem)?
- Any missing indexes implied by the query patterns?
- Any synchronous blocking operations that should be async?
- Any unnecessary re-renders or heavy computations in React components?

## 4. Code Quality
- Are functions short (< 50 lines) and single-purpose?
- Is there any code duplication that should be extracted?
- Are variable and function names clear and self-documenting?
- Is TypeScript strict mode respected? (no `any`, proper types)

## 5. Architecture Compliance
- Does the code follow the service-layer pattern (thin controllers)?
- Is reusable logic in `packages/` rather than duplicated across apps?
- Does it follow naming conventions (kebab-case files, PascalCase classes)?
- Are API responses in the standard format `{ data }` / `{ error, code }`?

## 6. Test Coverage
- Are tests included for new functionality?
- Do existing tests cover the changed code paths?
- Are there tests for error/edge cases, not just happy paths?

Output format:

### 🔴 Critical Issues (must fix before merging)
(Security vulnerabilities, crashes, data corruption risks)

### 🟡 Improvements (should fix)
(Logic errors, missing edge cases, performance issues)

### 🟢 Suggestions (nice to have)
(Code style, readability, minor improvements)

### ✅ Looks Good
(Acknowledge what was done well)
