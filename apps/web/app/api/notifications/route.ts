import { NextResponse } from 'next/server';
import { NotificationsService } from '@repo/core-services';

const notificationsService = new NotificationsService();

export async function POST(request: Request) {
  const { userId, title, body } = await request.json();
  if (!userId || !title || !body) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const notification = await notificationsService.sendNotification(userId, title, body);
  return NextResponse.json(notification);
}
