import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fallbackProposal, generateProposal, proposalFromModelText } from './generateProposal';

const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }));

vi.mock('openai', () => ({
  default: class {
    chat = { completions: { create: createMock } };
  }
}));

const originalOpenAiApiKey = process.env.OPENAI_API_KEY;

beforeEach(() => {
  createMock.mockReset();
  delete process.env.OPENAI_API_KEY;
});

afterEach(() => {
  vi.useRealTimers();
  if (originalOpenAiApiKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = originalOpenAiApiKey;
});

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
    expect(proposal.pricing.length).toBe(4);
    expect(proposal.pricing[0].price).toBe(750);
    expect(proposal.pricing[2].price).toBe(10000);
    expect(proposal.roiEstimate.monthlySavingsLow).toBeGreaterThan(0);
    expect(proposal.keyOperationalChallenges.length).toBeGreaterThan(0);
    expect(proposal.prioritisedOpportunities.length).toBeGreaterThan(0);
    expect(proposal.governance.length).toBeGreaterThan(0);
    expect(proposal.responsibleAiConsiderations.length).toBeGreaterThan(0);
    expect(proposal.nextSteps.length).toBeGreaterThan(0);
    expect(proposal.executivePresentation.length).toBe(5);
    expect(proposal.dependencies.length).toBeGreaterThan(0);
  });

  it('fallbackProposal populates default sector and pain points if omitted', () => {
    const proposal = fallbackProposal({ clientName: 'Minimal Client' });
    expect(proposal.executiveSummary).toContain('Minimal Client');
    expect(proposal.keyOperationalChallenges).toContain(
      'High manual operational effort in core workflows'
    );
    expect(proposal.roiEstimate.monthlySavingsLow).toBe(0);
    expect(proposal.roiEstimate.narrative).toContain('not yet calculable');
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

  it('uses deterministic fallback when the provider rejects an invalid key', async () => {
    process.env.OPENAI_API_KEY = 'invalid-test-key';
    createMock.mockRejectedValueOnce(new Error('401 invalid_api_key: sensitive provider detail'));

    const proposal = await generateProposal({ clientName: 'Invalid Key Client' });

    expect(proposal.generationMode).toBe('deterministic-fallback');
    expect(proposal.executiveSummary).toContain('Invalid Key Client');
  });

  it('aborts provider generation after the 25-second application timeout', async () => {
    vi.useFakeTimers();
    process.env.OPENAI_API_KEY = 'timeout-test-key';
    createMock.mockImplementationOnce(
      (_request, options: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          options.signal.addEventListener('abort', () => reject(new Error('aborted')));
        })
    );

    const pending = generateProposal({ clientName: 'Timeout Client' });
    await vi.advanceTimersByTimeAsync(24_999);
    expect(createMock).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(1);

    await expect(pending).resolves.toMatchObject({
      generationMode: 'deterministic-fallback',
      status: 'DRAFT_REQUIRES_HUMAN_REVIEW'
    });
  });
});
