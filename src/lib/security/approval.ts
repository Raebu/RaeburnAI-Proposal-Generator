export function requiresHumanReview(action: string) {
  return {
    action,
    required: true,
    reason: 'Human review is required before generated proposal content is used externally.'
  };
}
