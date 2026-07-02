import { describe, expect, it } from 'vitest';
import { fallbackProposal } from './generateProposal';

describe('fallbackProposal', () => {
  it('generates a complete proposal structure without provider credentials', () => {
    const proposal = fallbackProposal({ clientName: 'Example Client' });

    expect(proposal.executiveSummary).toContain('Example Client');
    expect(proposal.roadmap.length).toBeGreaterThan(0);
    expect(proposal.pricing.length).toBe(3);
    expect(proposal.roiEstimate.monthlySavingsLow).toBeGreaterThan(0);
    expect(proposal.executivePresentation.length).toBeGreaterThan(0);
  });
});
