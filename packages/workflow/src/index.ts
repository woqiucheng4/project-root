import { randomUUID } from 'crypto';
import {
  prisma,
  WorkflowStatus,
  type Workflow,
  type WorkflowMessage,
} from '@repo/database';
import { taskQueue, type AgentTask } from '@repo/ai-agents';
import type { PmExecuteResult } from '@repo/ai-agents';
import type { ArchitectExecuteResult } from '@repo/ai-agents';

export { WorkflowStatus };
export type { Workflow, WorkflowMessage };

export async function createWorkflow(title: string | null, requirementsText: string) {
  return prisma.workflow.create({
    data: {
      title: title || null,
      requirementsText,
      status: WorkflowStatus.DRAFT,
    },
  });
}

export async function listWorkflows(limit = 50) {
  return prisma.workflow.findMany({
    orderBy: { updatedAt: 'desc' },
    take: limit,
  });
}

export async function getWorkflow(id: string) {
  return prisma.workflow.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: 'asc' }, take: 500 } },
  });
}

export async function appendWorkflowMessage(workflowId: string, role: string, content: string) {
  return prisma.workflowMessage.create({
    data: { workflowId, role, content },
  });
}

/** Queue PM to generate PRD (after user starts pipeline). */
export async function enqueuePmPrdJob(workflowId: string, requirements: string, context: Record<string, unknown>) {
  const task: AgentTask = {
    id: randomUUID(),
    type: 'PM',
    payload: {
      requirements,
      context,
      workflowId,
      pauseAfterPrd: true,
    },
  };
  await prisma.workflow.update({
    where: { id: workflowId },
    data: { status: WorkflowStatus.PM_RUNNING, failReason: null },
  });
  await taskQueue.add('PM', task);
}

/** PM discussion turn (LLM reply, no PRD file change). */
export async function enqueuePmReplyJob(workflowId: string) {
  const wf = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: { messages: true },
  });
  if (!wf) throw new Error('Workflow not found');
  const messages = wf.messages.map((m: { role: string; content: string }) => ({
    role: m.role,
    content: m.content,
  }));
  const task: AgentTask = {
    id: randomUUID(),
    type: 'PM',
    payload: {
      mode: 'PM_REPLY',
      workflowId,
      messages,
    },
  };
  await prisma.workflow.update({
    where: { id: workflowId },
    data: { status: WorkflowStatus.PM_RUNNING },
  });
  await taskQueue.add('PM', task);
}

export async function mergeSupplementAndEnqueuePm(workflowId: string, supplement: string) {
  const wf = await prisma.workflow.findUnique({ where: { id: workflowId } });
  if (!wf) throw new Error('Workflow not found');
  const merged = `${wf.requirementsText}\n\n--- 用户补充 ---\n${supplement}`;
  await prisma.workflow.update({
    where: { id: workflowId },
    data: { requirementsText: merged },
  });
  await appendWorkflowMessage(workflowId, 'USER', supplement);
  await enqueuePmPrdJob(workflowId, merged, { previousPrdPath: wf.prdFilePath });
}

export async function completePmPrdFromWorker(workflowId: string, result: PmExecuteResult) {
  if (!('prdTargetFile' in result)) return;
  await prisma.workflow.update({
    where: { id: workflowId },
    data: {
      status: WorkflowStatus.PRD_REVIEW,
      prdMarkdown: result.content,
      prdFilePath: result.prdTargetFile,
      failReason: null,
    },
  });
}

export async function completePmReplyFromWorker(workflowId: string, pmReply: string) {
  await prisma.workflowMessage.create({
    data: { workflowId, role: 'PM', content: pmReply },
  });
  await prisma.workflow.update({
    where: { id: workflowId },
    data: { status: WorkflowStatus.PRD_REVIEW },
  });
}

export async function markWorkflowFailed(workflowId: string, reason: string) {
  await prisma.workflow.update({
    where: { id: workflowId },
    data: { status: WorkflowStatus.FAILED, failReason: reason.slice(0, 8000) },
  });
}

export async function enqueueArchitectJob(workflowId: string) {
  const wf = await prisma.workflow.findUnique({ where: { id: workflowId } });
  if (!wf?.prdMarkdown) throw new Error('PRD missing');
  const task: AgentTask = {
    id: randomUUID(),
    type: 'ARCHITECT',
    payload: {
      workflowId,
      pauseAfterSpec: true,
      requirements: wf.requirementsText,
      prd: wf.prdMarkdown,
      prdTargetFile: wf.prdFilePath || 'docs/prd/unknown.md',
      parentTaskId: workflowId,
    },
  };
  await prisma.workflow.update({
    where: { id: workflowId },
    data: { status: WorkflowStatus.ARCHITECT_RUNNING, failReason: null },
  });
  await taskQueue.add('ARCHITECT', task);
}

export async function completeArchitectFromWorker(workflowId: string, result: ArchitectExecuteResult) {
  await prisma.workflow.update({
    where: { id: workflowId },
    data: {
      status: WorkflowStatus.SPEC_REVIEW,
      architectureMarkdown: result.content,
      architectureFilePath: result.specTargetFile,
      todosJson: JSON.stringify(result.todos),
      currentTodoIndex: 0,
      failReason: null,
    },
  });
}

export async function enqueueDevelopmentFromApprovedSpec(workflowId: string) {
  const wf = await prisma.workflow.findUnique({ where: { id: workflowId } });
  if (!wf?.architectureMarkdown || !wf.prdMarkdown) throw new Error('Architecture or PRD missing');
  let todos = JSON.parse(wf.todosJson || '[]') as Array<{
    id: string;
    title: string;
    description: string;
    acceptanceCriteria: string;
  }>;
  if (!Array.isArray(todos) || todos.length === 0) {
    todos = [
      {
        id: 'all',
        title: '完整实现',
        description: wf.architectureMarkdown.slice(0, 4000),
        acceptanceCriteria: '满足 PRD 验收标准并通过自动化测试',
      },
    ];
  }
  const task: AgentTask = {
    id: randomUUID(),
    type: 'DEV',
    payload: {
      workflowId,
      todoIndex: 0,
      todos,
      requirements: wf.requirementsText,
      prd: wf.prdMarkdown,
      architectureSpec: wf.architectureMarkdown,
      context: {},
    },
  };
  await prisma.workflow.update({
    where: { id: workflowId },
    data: {
      status: WorkflowStatus.DEVELOPMENT,
      todosJson: JSON.stringify(todos),
      currentTodoIndex: 0,
    },
  });
  await taskQueue.add('DEV', task);
}

export async function applyWorkflowSignal(payload: {
  workflowId: string;
  signal: string;
  previewHint?: string;
}) {
  const { workflowId, signal, previewHint } = payload;
  if (signal === 'UAT_REVIEW') {
    await prisma.workflow.update({
      where: { id: workflowId },
      data: {
        status: WorkflowStatus.UAT_REVIEW,
        uatPreviewHint: previewHint ?? null,
      },
    });
  } else if (signal === 'QA_FIXING') {
    await prisma.workflow.update({
      where: { id: workflowId },
      data: { status: WorkflowStatus.QA_FIXING },
    });
  }
}

export async function confirmUat(workflowId: string) {
  await prisma.workflow.update({
    where: { id: workflowId },
    data: { status: WorkflowStatus.COMPLETED },
  });
}
