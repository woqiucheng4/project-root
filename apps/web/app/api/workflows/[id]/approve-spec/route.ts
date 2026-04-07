import { NextResponse } from "next/server";
import { enqueueDevelopmentFromApprovedSpec, getWorkflow, WorkflowStatus } from "@repo/workflow";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const wf = await getWorkflow(id);
    if (!wf) {
      return NextResponse.json({ error: "未找到工作流" }, { status: 404 });
    }
    if (wf.status !== WorkflowStatus.SPEC_REVIEW) {
      return NextResponse.json(
        { error: "当前状态不可开始开发（需处于 SPEC_REVIEW）" },
        { status: 400 }
      );
    }
    await enqueueDevelopmentFromApprovedSpec(id);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
