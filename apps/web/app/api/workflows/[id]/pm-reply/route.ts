import { NextResponse } from "next/server";
import { enqueuePmReplyJob, getWorkflow, WorkflowStatus } from "@repo/workflow";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const wf = await getWorkflow(id);
    if (!wf) {
      return NextResponse.json({ error: "未找到工作流" }, { status: 404 });
    }
    if (wf.status === WorkflowStatus.PM_RUNNING) {
      return NextResponse.json({ error: "PM 正在回复中" }, { status: 409 });
    }
    if (wf.messages.length === 0) {
      return NextResponse.json({ error: "请先发送至少一条用户消息" }, { status: 400 });
    }
    await enqueuePmReplyJob(id);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
