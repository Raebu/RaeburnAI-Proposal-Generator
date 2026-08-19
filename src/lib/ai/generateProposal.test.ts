import { describe, expect, it } from 'vitest';
import { fallbackProposal, generateProposal, proposalFromModelText } from './generateProposal';

describe('generateProposal & fallbackProposal', () => {
  it('generates a complete Contract 1.0 fallback proposal without AI API key', async () => {
    const proposal = await generateProposal({
      clientName: 'Test Client Ltd',
      sector: 'Healthcare',
      roiInputs: {
        people: 15,
        hoursSavedPerPersonPerWeek: 3,
        hourlyCost: 40,
        recoveryConfidencePercent: 85,
        investment: 10000
      }
    });

    expect(proposal.contractVersion).toBe('1.0');
    expect(proposal.status).toBe('DRAFT_REQUIRES_HUMAN_REVIEW');
    expect(proposal.generationMode).toBe('deterministic-fallback');
    expect(proposal.executiveSummary).toContain('Test Client Ltd');
    expect(proposal.executiveSummary).toContain('Healthcare');
    expect(proposal.roadmap.length).toBe(3);
    expect(proposal.pricing.length).toBe(3);
    expect(proposal.pricing[1].price).toBe(10000);
    expect(proposal.roiEstimate.monthlySavingsLow).toBeGreaterThan(0);
    expect(proposal.keyOperationalChallenges.length).toBeGreaterThan(0);
    expect(proposal.prioritisedOpportunities.length).toBeGreaterThan(0);
    expect(proposal.governance.length).toBeGreaterThan(0);
    expect(proposal.responsibleAiConsiderations.length).toBeGreaterThan(0);
    expect(proposal.nextSteps.length).toBeGreaterThan(0);
    expect(proposal.executivePresentation.length).toBe(5);
  });

  it('fallbackProposal populates default sector and pain points if omitted', () => {
    const proposal = fallbackProposal({ clientName: 'Minimal Client' });
    expect(proposal.executiveSummary).toContain('Minimal Client');
    expect(proposal.keyOperationalChallenges).toContain(
      'High manual operational effort in core workflows'
    );
  });

  it.each(['not json', '{"executiveSummary":"incomplete"}'])(
    'does not accept malformed or incomplete model output: %s',
    (modelOutput) => {
      const proposal = proposalFromModelText(modelOutput, { clientName: 'Safe Fallback Client' });
      expect(proposal.status).toBe('DRAFT_REQUIRES_HUMAN_REVIEW');
      expect(proposal.generationMode).toBe('deterministic-fallback');
      expect(proposal.executiveSummary).toContain('Safe Fallback Client');
    }
  );
});
