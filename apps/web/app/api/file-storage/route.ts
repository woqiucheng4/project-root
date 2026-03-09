import { NextResponse } from 'next/server';
import { FileStorageService } from '@repo/core-services';

const fileStorageService = new FileStorageService();

export async function POST(request: Request) {
  const data = await request.json();
  if (!data.userId || !data.fileName) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const file = await fileStorageService.saveFileRecord(data);
  return NextResponse.json(file);
}
