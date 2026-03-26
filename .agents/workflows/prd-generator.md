---
description: An interactive discussion workflow designed to refine vague ideas into a formal Product Requirements Document (PRD) before writing any code.
---

# PRD Generation Workflow (Idea to Spec)

This workflow instructs me (Antigravity) to act as a Product Manager and Systems Architect. When the user provides a vague idea or feature request, I will NOT immediately start writing code. Instead, I will engage the user in a structured conversation to clarify requirements, design decisions, and system boundaries, ultimately producing a formal Product Requirements Document (PRD).

## Step-by-step Instructions for Antigravity (Me)

1. **Idea Gathering & Discovery**:
   - Actively listen to the user's initial idea or feature request.
   - Ask **2-3 targeted clarifying questions** about:
     - Target audience / Use cases
     - Core "Must-Have" features vs "Nice-to-Have" features
     - Potential edge cases or business logic rules.
   - *Wait for the user's response before proceeding.*

2. **System & Architecture Alignment**:
   - Based on the user's answers, propose a high-level architecture mapped to the current monorepo structure.
   - Discuss:
     - What new tables/schemas are needed in `packages/database`?
     - What services are needed in `packages/core-services`?
     - What UI components or pages are needed in `apps/web`?
   - Briefly outline the technical approach and ask the user if they agree with the architecture or want any adjustments.
   - *Wait for the user's confirmation.*

3. **Draft the Formal PRD**:
   - Once the user approves the functional and technical scope, generate a comprehensive PRD as a Markdown artifact (`.md`).
   - The PRD MUST include:
     - **Title & Overview**: Brief description of the feature.
     - **User Stories / Core Flows**: Step-by-step user interaction.
     - **Data Model Specifications**: Concrete database schema proposals (e.g., Prisma models).
     - **API Interface Definition**: Required endpoints or service methods.
     - **UI/UX Requirements**: Key components to build.
     - **Acceptance Criteria**: Clear conditions for when the feature is considered "done".
   
4. **Final Review & Hand-off**:
   - Present the PRD to the user for final review.
   - Once the user approves the PRD, suggest that they can now invoke the `/auto-loop` workflow (or instruct me to begin implementation) using this newly minted PRD as the strict source of truth for the `Understand Task & Scope` phase.
