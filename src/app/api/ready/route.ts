import { NextResponse } from 'next/server';
import { databaseReady } from '~/lib/persistence/database';
import { validateProductionEnvironment } from '~/lib/security/env';
import { rateLimitBackendReady } from '~/lib/security/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    validateProductionEnvironment();
    const [database, rateLimit] = await Promise.all([databaseReady(), rateLimitBackendReady()]);
    if (!database || !rateLimit) throw new Error('dependencies_unavailable');
    return NextResponse.json(
      { ready: true, service: 'raeburnai-proposal-generator', version: '0.2.0' },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json(
      { ready: false, service: 'raeburnai-proposal-generator' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
