import { describe, expect, it } from 'vitest';
import { proposalInputSchema } from './schema';

describe('proposalInputSchema', () => {
  it('accepts a valid minimum payload', () => {
    const result = proposalInputSchema.parse({ clientName: 'Example Client' });
    expect(result.clientName).toBe('Example Client');
  });

  it('rejects a missing client name', () => {
    const result = proposalInputSchema.safeParse({ currentPain: 'Manual proposal writing' });
    expect(result.success).toBe(false);
  });
});
