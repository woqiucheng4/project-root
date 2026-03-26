import { NextResponse } from "next/server";
import { getOpenIdByCode } from "@/services/wechat";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state') || '/'; // 恢复的回调路径

  const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";
  const redirectUrl = new URL(decodeURIComponent(state), DOMAIN);

  if (!code) {
    return NextResponse.json({ error: "Missing WeChat auth code" }, { status: 400 });
  }

  try {
    let openId = "mock_openid_" + Date.now();
    
    // 如果是真实的 code 才去调用换取
    if (code !== 'mock_code_123' && process.env.WX_APP_ID) {
      openId = await getOpenIdByCode(code);
    }

    // ============================================
    // 此处实际业务应该是：
    // 1. db.user.upsert({ where: { openId }, ... })
    // 2. 将当前生成的报告或订阅记录挂载到这个用户头上
    // ============================================

    // 作为前端态，我们将 OpenID 种入客户端的 Cookie 中作为长期会话态凭证
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set({
      name: 'wx_session_id',
      value: openId,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30天免密登录
    });

    // 可以在回调参数中也带上一个标记，让前端弹窗提示“订阅成功”
    redirectUrl.searchParams.set('subscribed', 'success');
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error("微信登录流异常:", error);
    return NextResponse.redirect(new URL("/?error=wx_auth_failed", DOMAIN));
  }
}
