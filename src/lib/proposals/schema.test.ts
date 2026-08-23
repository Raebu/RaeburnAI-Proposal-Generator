import { describe, expect, it } from 'vitest';
import { proposalInputSchema, proposalOutputSchema } from './schema';
import { fallbackProposal } from '~/lib/ai/generateProposal';

describe('proposal schemas', () => {
  describe('proposalInputSchema', () => {
    it('accepts a valid minimum payload without inventing ROI assumptions', () => {
      const result = proposalInputSchema.parse({ clientName: 'Example Client' });
      expect(result.clientName).toBe('Example Client');
      expect(result.contractVersion).toBe('1.0');
      expect(result.roiInputs).toBeUndefined();
    });

    it('accepts a full payload with extended ROI inputs and context arrays', () => {
      const payload = {
        contractVersion: '1.0' as const,
        clientName: 'Acme Corp',
        sector: 'Retail',
        companySize: '500 staff',
        currentWorkflows: ['Order processing', 'Customer support'],
        roiInputs: {
          people: 50,
          hoursSavedPerPersonPerWeek: 5,
          hourlyCost: 50,
          recoveryConfidencePercent: 90,
          investment: 25000
        }
      };

      const result = proposalInputSchema.parse(payload);
      expect(result.clientName).toBe('Acme Corp');
      expect(result.roiInputs?.people).toBe(50);
      expect(result.currentWorkflows).toHaveLength(2);
    });

    it('rejects a missing or overly short client name', () => {
      const result = proposalInputSchema.safeParse({ clientName: 'A' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email in decisionMaker', () => {
      const result = proposalInputSchema.safeParse({
        clientName: 'Valid Client',
        decisionMaker: { name: 'John Doe', email: 'not-an-email' }
      });
      expect(result.success).toBe(false);
    });
  });

  describe('proposalOutputSchema', () => {
    it('validates a complete proposal output structure', () => {
      const fallback = fallbackProposal({ clientName: 'Schema Test Client' });
      const parseResult = proposalOutputSchema.safeParse(fallback);

      expect(parseResult.success).toBe(true);
      if (parseResult.success) {
        expect(parseResult.data.contractVersion).toBe('1.0');
        expect(parseResult.data.status).toBe('DRAFT_REQUIRES_HUMAN_REVIEW');
        expect(parseResult.data.pricing).toHaveLength(4);
        expect(parseResult.data.dependencies.length).toBeGreaterThan(0);
        expect(parseResult.data.roadmap.length).toBeGreaterThan(0);
      }
    });

    it('rejects an output payload with missing required sections', () => {
      const incomplete = {
        contractVersion: '1.0',
        executiveSummary: 'Short summary'
      };

      const parseResult = proposalOutputSchema.safeParse(incomplete);
      expect(parseResult.success).toBe(false);
    });
  });
});
