import { NextResponse } from "next/server";
import { enqueuePmPrdJob, getWorkflow, WorkflowStatus } from "@repo/workflow";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const wf = await getWorkflow(id);
    if (!wf) {
      return NextResponse.json({ error: "未找到工作流" }, { status: 404 });
    }
    if (wf.status === WorkflowStatus.PM_RUNNING || wf.status === WorkflowStatus.ARCHITECT_RUNNING) {
      return NextResponse.json({ error: "已有任务执行中，请稍候" }, { status: 409 });
    }
    await enqueuePmPrdJob(id, wf.requirementsText, { workflowTitle: wf.title });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
