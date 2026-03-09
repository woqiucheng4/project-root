import { NextResponse } from 'next/server';
import { FeatureFlagService } from '@repo/core-services';

const featureFlagService = new FeatureFlagService();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  const userId = searchParams.get('userId') || undefined;
  
  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });

  const isEnabled = await featureFlagService.isEnabled(key, userId);
  return NextResponse.json({ isEnabled });
}
