import { ZodError } from 'zod';

export type SafeError = {
  message: string;
  type: 'validation_error' | 'configuration_error' | 'provider_error' | 'internal_error';
  status: number;
};

export function toSafeError(error: unknown): SafeError {
  if (error instanceof ZodError) {
    return { message: 'The request or generated output failed validation.', type: 'validation_error', status: 400 };
  }
  if (error instanceof Error) {
    if (error.message === 'generation_provider_not_configured' || error.message === 'unsupported_generation_mode') {
      return { message: 'Proposal generation is not configured.', type: 'configuration_error', status: 503 };
    }
    if (error.message.startsWith('generation_provider_')) {
      return { message: 'The proposal provider returned an unusable response.', type: 'provider_error', status: 502 };
    }
  }
  return { message: 'Unexpected server error.', type: 'internal_error', status: 500 };
}
