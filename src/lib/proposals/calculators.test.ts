import { describe, expect, it } from 'vitest';
import { buildPricingOptions, estimateRoi } from './calculators';

describe('proposal calculators', () => {
  it('creates pricing options based on base investment', () => {
    const options = buildPricingOptions(20000);
    expect(options.length).toBe(3);
    expect(options[0].name).toBe('Diagnostic Sprint');
    expect(options[0].price).toBe(9000);
    expect(options[1].price).toBe(20000);
    expect(options[2].price).toBe(50000);
  });

  it('handles negative or invalid base price gracefully', () => {
    const options = buildPricingOptions(-5000);
    expect(options[1].price).toBe(12000); // defaults to safe base 12000
  });

  it('estimates commercial value with confidence factor and custom inputs', () => {
    const roi = estimateRoi({
      people: 30,
      hoursSavedPerPersonPerWeek: 4,
      hourlyCost: 50,
      recoveryConfidencePercent: 80,
      investment: 15000
    });

    expect(roi.monthlySavingsLow).toBeGreaterThan(0);
    expect(roi.monthlySavingsHigh).toBeGreaterThan(roi.monthlySavingsLow);
    expect(roi.annualSavingsLow).toBe(roi.monthlySavingsLow * 12);
    expect(roi.annualSavingsHigh).toBe(roi.monthlySavingsHigh * 12);
    expect(roi.firstYearRoiPercentLow).toBe(
      Math.round(((roi.annualSavingsLow - 15000) / 15000) * 100)
    );
    expect(roi.paybackMonthsLow).toBeGreaterThan(0);
    expect(roi.paybackMonthsHigh).toBeGreaterThanOrEqual(roi.paybackMonthsLow);
    expect(roi.assumptions).toContain('30 process participants / affected team members');
    expect(roi.narrative).toContain('Estimated gross monthly capacity value ranges from');
  });

  it('keeps decimal and unusually large valid inputs finite and internally consistent', () => {
    const roi = estimateRoi({
      people: 10000,
      hoursSavedPerPersonPerWeek: 0.1,
      hourlyCost: 5000,
      recoveryConfidencePercent: 1.5,
      investment: 10000000
    });
    expect(Number.isFinite(roi.monthlySavingsHigh)).toBe(true);
    expect(roi.monthlySavingsLow).toBeLessThanOrEqual(roi.monthlySavingsHigh);
    expect(roi.annualSavingsHigh).toBe(roi.monthlySavingsHigh * 12);
    expect(roi.paybackMonthsLow).toBeLessThanOrEqual(roi.paybackMonthsHigh);
  });

  it('normalises zero and non-finite values when called outside validated API input', () => {
    const roi = estimateRoi({
      people: 0,
      hoursSavedPerPersonPerWeek: Number.NaN,
      hourlyCost: Number.POSITIVE_INFINITY,
      recoveryConfidencePercent: 0,
      investment: 0
    });
    expect(roi.assumptions).toContain('1 process participants / affected team members');
    expect(
      Object.values(roi)
        .filter((value) => typeof value === 'number')
        .every(Number.isFinite)
    ).toBe(true);
  });
});
