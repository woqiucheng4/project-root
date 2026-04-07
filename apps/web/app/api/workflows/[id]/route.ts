import { NextResponse } from "next/server";
import { getWorkflow } from "@repo/workflow";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const wf = await getWorkflow(id);
    if (!wf) {
      return NextResponse.json({ error: "未找到工作流" }, { status: 404 });
    }
    return NextResponse.json({ workflow: wf });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
