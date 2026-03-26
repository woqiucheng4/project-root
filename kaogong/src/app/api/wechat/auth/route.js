import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const redirectPath = searchParams.get('redirect') || '/';
  
  const APP_ID = process.env.WX_APP_ID || "PLACEHOLDER_APP_ID";
  // 设置我们的完整回调域名，线上环境需替换为真正的域名如 https://kaogong.pro
  const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";
  const callbackUrl = encodeURIComponent(`${DOMAIN}/api/wechat/callback`);
  
  // 组装微信静默授权登录跳转链接 (snsapi_base 只获取 openid，不需用户手动同意)
  const wxOAuthUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${APP_ID}&redirect_uri=${callbackUrl}&response_type=code&scope=snsapi_base&state=${encodeURIComponent(redirectPath)}#wechat_redirect`;

  // 临时开发模式拦截：如果没有配置真实的 APP_ID，直接模拟回调成功以防阻断体验
  if (APP_ID === 'PLACEHOLDER_APP_ID') {
    return NextResponse.redirect(`${DOMAIN}/api/wechat/callback?code=mock_code_123&state=${encodeURIComponent(redirectPath)}`);
  }

  return NextResponse.redirect(wxOAuthUrl);
}
