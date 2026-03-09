import { NextResponse } from 'next/server';
import { AnalyticsService } from '@repo/core-services';

const analyticsService = new AnalyticsService();

export async function POST(request: Request) {
  const { eventName, userId, payload } = await request.json();
  if (!eventName) return NextResponse.json({ error: 'Missing eventName' }, { status: 400 });

  const event = await analyticsService.trackEvent(eventName, userId, payload);
  return NextResponse.json(event);
}
