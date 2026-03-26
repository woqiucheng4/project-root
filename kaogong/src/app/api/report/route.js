import { NextResponse } from "next/server";
import { getReport } from "@/utils/storage";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: "缺少报告ID" }, { status: 400 });
  }

  const report = getReport(id);

  if (!report) {
    return NextResponse.json({ error: "报告不存在或已过期退回系统" }, { status: 404 });
  }

  // 根据当前是否是已支付VIP客户，做严格分层映射
  if (report.isPaid) {
    return NextResponse.json(report);
  } else {
    // 坚决掐断未支付的付费部分返回
    return NextResponse.json({
      reportId: report.reportId,
      createdAt: report.createdAt,
      isPaid: false,
      free: report.free
    });
  }
}
