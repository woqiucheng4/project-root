import { BaseAgent } from '../lib/agent';
import { AgentTask } from '../lib/queue';
import { logger } from '../lib/logger';
import { generateWithFallback } from '../lib/llm';
import fs from 'fs/promises';
import path from 'path';
import { findMonorepoRoot } from '../lib/repoRoot';

export interface ArchitectTodoItem {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string;
}

export type ArchitectExecuteResult = {
  specTargetFile: string;
  content: string;
  todos: ArchitectTodoItem[];
};

export class ArchitectAgent extends BaseAgent {
  constructor() {
    super('ARCHITECT');
  }

  async execute(task: AgentTask): Promise<ArchitectExecuteResult> {
    logger.info('[ArchitectAgent] Started Architecture Spec generation', { taskId: task.id });
    const { requirements, prd, prdTargetFile, parentTaskId } = task.payload;

    try {
      logger.info(`[ArchitectAgent] Analyzing PRD and creating Architecture Spec + TODO list...`);

      const systemPrompt = `You are an elite System Architect Agent following the BMad Method in an automated coding loop.
Your task is to take a Product Requirements Document (PRD) and output:
1) A formal Architecture Design Document (ADD) in Markdown
2) A structured implementation TODO list for developers (ordered, each item independently testable when possible)

OUTPUT FORMAT:
Return a valid JSON object (DO NOT wrap in Markdown code blocks):
{
  "specTargetFile": "docs/architecture/filename.md",
  "content": "# Architecture Design Document...",
  "todos": [
    {
      "id": "t1",
      "title": "Short title",
      "description": "What to build / which modules",
      "acceptanceCriteria": "How we know it is done"
    }
  ]
}

The specTargetFile MUST be under docs/architecture/ and use kebab-case .md.

The ADD MUST INCLUDE:
1. System Component Diagram (Mermaid)
2. API Interface Contracts (if any)
3. Data / persistence notes
4. Directory / module layout in this monorepo
5. Technical risks and mitigations

The todos array MUST have at least one item. Each item must map to concrete work in this repository (apps/web, packages/*, ai-runtime, etc.).`;

      const userPrompt = `Analyzed PRD:
${prd}

Original requirements (for reference):
${requirements}
`;

      const responseContent = await generateWithFallback({
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      if (!responseContent) {
        throw new Error('LLM returned an empty response.');
      }

      const parsedOutput = JSON.parse(responseContent);
      const specTargetFile = parsedOutput.specTargetFile;
      const content = parsedOutput.content;
      let todos: ArchitectTodoItem[] = parsedOutput.todos || [];

      if (!specTargetFile || !content) {
        throw new Error('LLM JSON output did not contain valid specTargetFile or content keys.');
      }

      if (!Array.isArray(todos) || todos.length === 0) {
        todos = [
          {
            id: 't-all',
            title: 'Implement full architecture',
            description: content.slice(0, 4000),
            acceptanceCriteria: 'Satisfies PRD acceptance criteria and passes automated tests.',
          },
        ];
      }

      const repoRootDir = findMonorepoRoot();
      const fullPath = path.join(repoRootDir, specTargetFile);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, 'utf-8');

      const todosPath = fullPath.replace(/\.md$/i, '.todos.json');
      await fs.writeFile(todosPath, JSON.stringify(todos, null, 2), 'utf-8');

      logger.info('[ArchitectAgent] Architecture Spec generated successfully', { specTargetFile, todoCount: todos.length });

      const pauseAfterSpec = task.payload?.pauseAfterSpec === true;
      if (!pauseAfterSpec) {
        await this.emitTask({
          id: `dev-${Date.now()}`,
          type: 'DEV',
          payload: {
            requirements,
            prd,
            architectureSpec: content,
            parentTaskId: parentTaskId || task.id,
            workflowId: task.payload?.workflowId,
            todoIndex: 0,
            todos,
          },
        });
      }

      return { specTargetFile, content, todos };
    } catch (error: any) {
      logger.error('[ArchitectAgent] Architecture Spec generation failed', { error: error.message });
      throw error;
    }
  }
}
