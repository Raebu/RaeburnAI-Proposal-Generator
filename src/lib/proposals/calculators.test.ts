import { describe, expect, it } from 'vitest';
import { buildPricingOptions, estimateRoi } from './calculators';

describe('proposal calculators', () => {
  it('creates pricing options', () => {
    const options = buildPricingOptions(10000);
    expect(options.length).toBe(3);
  });

  it('estimates commercial value', () => {
    const roi = estimateRoi({ people: 10, hoursSavedPerPersonPerWeek: 2 });
    expect(roi.monthlySavingsLow > 0).toBe(true);
    expect(roi.paybackMonthsHigh > 0).toBe(true);
  });
});
