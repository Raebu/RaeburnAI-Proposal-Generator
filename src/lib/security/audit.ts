type AuditEvent = {
  action: string;
  actor: string;
  outcome: 'allowed' | 'blocked' | 'failed' | 'succeeded';
  metadata?: Record<string, string | number | boolean>;
};

export function auditLog(event: AuditEvent) {
  const entry = {
    timestamp: new Date().toISOString(),
    service: 'raeburnai-proposal-generator',
    ...event
  };

  console.warn(JSON.stringify(entry));
}
