import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'raeburnai-proposal-generator',
      timestamp: new Date().toISOString(),
      version: '0.2.0',
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
