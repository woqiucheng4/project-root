import { NextResponse } from 'next/server';
import { TestModuleService } from '@repo/core-services';

const testModuleService = new TestModuleService();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const items = await testModuleService.getItems(userId);
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const { userId, name } = await request.json();
  
  if (!userId || !name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const item = await testModuleService.createItem(userId, name);
  return NextResponse.json(item);
}
