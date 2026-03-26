import { NextResponse } from "next/server";

export function middleware(request) {
  const response = NextResponse.next();
  
  // 允许小程序跨域访问后端 API
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理预检请求
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
