import { ZodError } from 'zod';

export function toSafeError(error: unknown) {
  if (error instanceof ZodError) {
    const details = error.issues
      .map((issue) => `${issue.path.join('.') || 'payload'}: ${issue.message}`)
      .join('; ');
    return {
      message: `Invalid input data (${details})`,
      type: 'ValidationError'
    };
  }

  if (error instanceof SyntaxError) {
    return {
      message: 'Invalid JSON request body.',
      type: 'ValidationError'
    };
  }

  if (error instanceof Error) {
    return {
      message: 'The proposal could not be processed. Check the submitted data and try again.',
      type: error.name || 'ApplicationError'
    };
  }

  return {
    message: 'An unexpected error occurred while processing your request.',
    type: 'UnknownError'
  };
}
