import { NextResponse } from 'next/server';

export async function GET() {
  const accessProtected = process.env.TRUST_CLOUDFLARE_ACCESS === 'true';
  const missing = [
    !accessProtected && !process.env.PROPOSAL_API_KEY && 'PROPOSAL_API_KEY_OR_CLOUDFLARE_ACCESS'
  ].filter(Boolean);
  return NextResponse.json(
    {
      status: missing.length ? 'not_ready' : 'ready',
      service: 'raeburnai-proposal-generator',
      mode: process.env.OPENAI_API_KEY ? 'provider-backed' : 'deterministic-fallback',
      missing
    },
    { status: missing.length ? 503 : 200 }
  );
}
