import { NextResponse } from 'next/server';
import { AuthService } from '@repo/core-services';

const authService = new AuthService();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const user = await authService.getUserById(userId);
  return NextResponse.json(user);
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await authService.createUser(body);
  return NextResponse.json(user);
}
