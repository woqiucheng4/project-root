import { NextResponse } from "next/server";
import { getWorkflow, mergeSupplementAndEnqueuePm, WorkflowStatus } from "@repo/workflow";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const wf = await getWorkflow(id);
    if (!wf) {
      return NextResponse.json({ error: "未找到工作流" }, { status: 404 });
    }
    if (wf.status === WorkflowStatus.PM_RUNNING) {
      return NextResponse.json({ error: "PM 任务执行中" }, { status: 409 });
    }
    const body = await req.json();
    const supplement = typeof body.supplement === "string" ? body.supplement : "";
    if (!supplement.trim()) {
      return NextResponse.json({ error: "supplement 必填" }, { status: 400 });
    }
    await mergeSupplementAndEnqueuePm(id, supplement.trim());
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
