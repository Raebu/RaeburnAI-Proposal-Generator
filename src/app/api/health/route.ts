import { NextResponse } from 'next/server';
import packageJson from '../../../../package.json';

export async function GET() {
  const hasAiProviderKey = Boolean(process.env.OPENAI_API_KEY);
  const mode = hasAiProviderKey ? 'provider-backed' : 'deterministic-fallback';

  return NextResponse.json({
    status: 'ok',
    service: 'raeburnai-proposal-generator',
    timestamp: new Date().toISOString(),
    version: packageJson.version,
    mode,
    checks: {
      process: 'alive',
      application: 'healthy',
      aiProviderConfigured: hasAiProviderKey
    }
  });
}
