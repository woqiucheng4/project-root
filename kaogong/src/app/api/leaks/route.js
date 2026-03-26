import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const leakFile = path.join(process.cwd(), 'data', 'daily-leak-jobs.json');
    if (fs.existsSync(leakFile)) {
      const data = JSON.parse(fs.readFileSync(leakFile, 'utf-8'));
      return NextResponse.json(data);
    }
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to read leak jobs" }, { status: 500 });
  }
}
