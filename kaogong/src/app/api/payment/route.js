import { NextResponse } from "next/server";
import { getReport, markReportAsPaid } from "@/utils/storage";

export async function POST(request) {
  try {
    const { reportId } = await request.json();
    
    if (!reportId) {
      return NextResponse.json({ error: "缺少流水号" }, { status: 400 });
    }

    const report = getReport(reportId);
    if (!report) {
      return NextResponse.json({ error: "报告不存在或已过期退还给系统" }, { status: 404 });
    }

    // MVP 阶段：由于是沙盒演示，我们直接将内存状态转换为“已支付”并透全量对象
    // V2 正式阶段升级警告：
    // 1. 调用微信/支付宝V3 SDK生成JSAPI参数链接下发
    // 2. 将 markReportAsPaid(reportId) 这个函数完全挪出，并放到另外的 /api/webhook 回调内，由微信服务端反向通知并加上RSA安全签名校验后再处理！！！
    const success = markReportAsPaid(reportId);
    
    if (success) {
      return NextResponse.json({ success: true, message: "支付成功，报告已解锁", reportId });
    } else {
      return NextResponse.json({ error: "状态一致性更新失败" }, { status: 500 });
    }

  } catch (error) {
    console.error("Payment Module Error:", error);
    return NextResponse.json({ error: "支付模块内部异常熔断" }, { status: 500 });
  }
}
