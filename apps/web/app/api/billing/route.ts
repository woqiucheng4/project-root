import { NextResponse } from 'next/server';
import { BillingService } from '@repo/core-services';

const billingService = new BillingService();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const subscription = await billingService.getSubscription(userId);
  return NextResponse.json(subscription);
}
