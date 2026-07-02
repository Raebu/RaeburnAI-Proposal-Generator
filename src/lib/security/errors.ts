export function toSafeError(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      type: error.name
    };
  }

  return {
    message: 'Unexpected server error',
    type: 'UnknownError'
  };
}
