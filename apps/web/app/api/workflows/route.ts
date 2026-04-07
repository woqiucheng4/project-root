import { NextResponse } from "next/server";
import { createWorkflow, listWorkflows } from "@repo/workflow";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await listWorkflows(100);
    return NextResponse.json({ workflows: rows });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = typeof body.title === "string" ? body.title : null;
    const requirementsText =
      typeof body.requirementsText === "string" ? body.requirementsText : "";
    if (!requirementsText.trim()) {
      return NextResponse.json({ error: "requirementsText 必填" }, { status: 400 });
    }
    const wf = await createWorkflow(title, requirementsText.trim());
    return NextResponse.json({ workflow: wf });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
