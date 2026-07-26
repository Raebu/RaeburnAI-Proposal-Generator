import { describe, expect, it } from 'vitest';
import { fallbackProposal } from '~/lib/ai/generateProposal';
import { proposalOutputSchema } from './outputSchema';
import { proposalInputSchema } from './schema';

describe('proposalInputSchema', () => {
  it('trims valid input and rejects unknown fields', () => {
    const parsed = proposalInputSchema.parse({
      clientName: ' Example Ltd ',
      currentPain: ' Manual proposal preparation takes too long. ',
    });
    expect(parsed.clientName).toBe('Example Ltd');
    expect(parsed.currentPain).toBe('Manual proposal preparation takes too long.');

    expect(
      proposalInputSchema.safeParse({
        clientName: 'Example Ltd',
        currentPain: 'Manual proposal preparation takes too long.',
        autoSend: true,
      }).success,
    ).toBe(false);
  });

  it('requires meaningful context and enforces bounds', () => {
    expect(proposalInputSchema.safeParse({ clientName: 'Example Ltd' }).success).toBe(false);
    expect(
      proposalInputSchema.safeParse({
        clientName: 'Example Ltd',
        currentPain: 'x'.repeat(4001),
      }).success,
    ).toBe(false);
  });
});

describe('proposalOutputSchema', () => {
  it('accepts the deterministic proposal and validates commercial ranges', () => {
    const input = proposalInputSchema.parse({
      clientName: 'Example Ltd',
      currentPain: 'Manual proposal preparation takes too long.',
    });
    const proposal = fallbackProposal(input);
    expect(proposalOutputSchema.safeParse(proposal).success).toBe(true);
  });

  it('rejects malformed or internally inconsistent provider output', () => {
    const input = proposalInputSchema.parse({
      clientName: 'Example Ltd',
      currentPain: 'Manual proposal preparation takes too long.',
    });
    const proposal = fallbackProposal(input);
    expect(
      proposalOutputSchema.safeParse({
        ...proposal,
        roiEstimate: {
          ...proposal.roiEstimate,
          monthlySavingsLow: 1000,
          monthlySavingsHigh: 500,
        },
      }).success,
    ).toBe(false);
  });
});
