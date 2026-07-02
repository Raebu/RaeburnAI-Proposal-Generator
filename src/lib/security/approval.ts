export function requiresHumanReview(action: string) {
  const required = process.env.HUMAN_APPROVAL_REQUIRED !== 'false';
  return {
    action,
    required,
    reason: required
      ? 'Human review is required before generated proposal content is used externally.'
      : 'Human review has been disabled by runtime configuration.'
  };
}
