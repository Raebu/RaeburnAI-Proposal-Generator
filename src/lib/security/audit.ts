type AuditEvent = {
  action: string;
  actor: string;
  outcome: 'allowed' | 'blocked' | 'failed' | 'succeeded';
  metadata?: Record<string, string | number | boolean>;
};

function sanitizeMetadata(metadata?: Record<string, string | number | boolean>) {
  if (!metadata) return undefined;
  const sanitized: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (/key|secret|token|password|auth|credit|ssn/i.test(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string' && value.length > 500) {
      sanitized[key] = `${value.substring(0, 500)}...[TRUNCATED]`;
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function auditLog(event: AuditEvent) {
  const entry = {
    timestamp: new Date().toISOString(),
    service: 'raeburnai-proposal-generator',
    ...event,
    metadata: sanitizeMetadata(event.metadata)
  };

  console.warn(JSON.stringify(entry));
}
