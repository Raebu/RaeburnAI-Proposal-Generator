import { z } from 'zod';

const productionSchema = z.object({
  NODE_ENV: z.literal('production'),
  APP_BASE_URL: z.string().url().startsWith('https://'),
  DATABASE_URL: z.string().startsWith('postgresql://'),
  REDIS_URL: z.string().refine((value) => value.startsWith('redis://') || value.startsWith('rediss://')),
  PROPOSAL_API_KEY: z.string().min(32),
  PROPOSAL_WORKSPACE_ID: z.string().min(3).max(255).regex(/^[A-Za-z0-9._:-]+$/),
  TRUST_PROXY_HEADERS: z.literal('true'),
  HUMAN_APPROVAL_REQUIRED: z.literal('true'),
  GENERATION_MODE: z.enum(['deterministic', 'openai']),
  RATE_LIMIT_REQUESTS_PER_MINUTE: z.coerce.number().int().min(1).max(10_000),
  OPENAI_TIMEOUT_MS: z.coerce.number().int().min(1000).max(120_000),
  OPENAI_MAX_RETRIES: z.coerce.number().int().min(0).max(5),
}).passthrough();

let validated = false;

export function validateProductionEnvironment(): void {
  if (validated || process.env.NODE_ENV !== 'production') return;
  const parsed = productionSchema.safeParse(process.env);
  if (!parsed.success) throw new Error('unsafe_production_environment');
  if (parsed.data.PROPOSAL_API_KEY.includes('replace') || parsed.data.PROPOSAL_API_KEY.includes('change-me')) {
    throw new Error('unsafe_production_environment');
  }
  if (parsed.data.GENERATION_MODE === 'openai' && !process.env.OPENAI_API_KEY) {
    throw new Error('generation_provider_not_configured');
  }
  validated = true;
}
