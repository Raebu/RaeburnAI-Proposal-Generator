import type { PricingOption, RoiEstimate } from '~/lib/types/proposal';

export function buildPricingOptions(): PricingOption[] {
  return [
    {
      name: 'AI Workflow & Automation Audit',
      price: 750,
      priceLabel: '£750',
      description: 'Workflow review, opportunity scorecard, 30-day roadmap and findings review.',
      bestFor: 'Organisations that need an evidence-led starting point.'
    },
    {
      name: 'AI Transformation Sprint',
      price: 2500,
      priceLabel: 'From £2,500',
      description:
        'A contained sprint to validate and deliver one priority transformation workstream.',
      bestFor: 'Clients ready to move from diagnosis into a focused pilot.'
    },
    {
      name: 'Implementation / Automation Project',
      price: 5000,
      priceLabel: '£5,000+',
      description:
        'Quotation-based implementation, integration, testing, enablement and governance.',
      bestFor: 'Clients with validated scope and executive sponsorship.'
    },
    {
      name: 'Continuous Optimisation & AI Operations',
      price: 500,
      priceLabel: '£500–£1,500 per month',
      description: 'Ongoing monitoring, optimisation, governance and prioritisation after launch.',
      bestFor: 'Teams that need continuous improvement and operational support.'
    }
  ];
}

type RoiParams = {
  people?: number;
  hoursSavedPerPersonPerWeek?: number;
  hourlyCost?: number;
  recoveryConfidencePercent?: number;
  investment?: number;
};

export function estimateRoi(params?: RoiParams): RoiEstimate {
  const safe = (value: number | undefined, max: number) =>
    Number.isFinite(value) ? Math.min(max, Math.max(0, value as number)) : 0;
  const people = Math.floor(safe(params?.people, 10000));
  const hours = safe(params?.hoursSavedPerPersonPerWeek, 80);
  const hourlyCost = safe(params?.hourlyCost, 5000);
  const confidencePercent = safe(params?.recoveryConfidencePercent, 100);
  const confidence = confidencePercent / 100;
  const investment = safe(params?.investment, 10000000);
  const rawMonthlySavings = people * hours * hourlyCost * 4.33;
  const monthlySavingsLow = Math.round(rawMonthlySavings * 0.6 * confidence);
  const monthlySavingsHigh = Math.round(rawMonthlySavings * confidence);
  const annualSavingsLow = monthlySavingsLow * 12;
  const annualSavingsHigh = monthlySavingsHigh * 12;
  const calculableInvestment = investment > 0;
  const calculableSavings = monthlySavingsLow > 0 && monthlySavingsHigh > 0;
  const firstYearRoiPercentLow = calculableInvestment
    ? Math.round(((annualSavingsLow - investment) / investment) * 100)
    : 0;
  const firstYearRoiPercentHigh = calculableInvestment
    ? Math.round(((annualSavingsHigh - investment) / investment) * 100)
    : 0;
  const paybackMonthsHigh =
    calculableInvestment && calculableSavings
      ? Number((investment / monthlySavingsLow).toFixed(1))
      : 0;
  const paybackMonthsLow =
    calculableInvestment && calculableSavings
      ? Number((investment / monthlySavingsHigh).toFixed(1))
      : 0;
  const assumptions = [
    people
      ? `${people} process participants / affected team members`
      : 'Affected team size not yet verified',
    hours
      ? `${hours} hours potentially released per person per week`
      : 'Hours released per person not yet verified',
    hourlyCost
      ? `Blended hourly cost of £${hourlyCost}/hr`
      : 'Blended hourly cost not yet verified',
    confidencePercent
      ? `Capacity recovery confidence factor of ${confidencePercent}%`
      : 'Capacity recovery confidence not yet verified',
    investment
      ? `Implementation investment benchmark of £${investment.toLocaleString()}`
      : 'Implementation investment not yet confirmed',
    'Capacity value is a planning estimate, not guaranteed cash savings; recurring technology costs, VAT and implementation disruption are excluded and must be confirmed during discovery.'
  ];
  const narrative =
    calculableInvestment && calculableSavings
      ? `Estimated gross monthly capacity value ranges from £${monthlySavingsLow.toLocaleString()} to £${monthlySavingsHigh.toLocaleString()} (£${annualSavingsLow.toLocaleString()} to £${annualSavingsHigh.toLocaleString()} annualised), with first-year ROI of ${firstYearRoiPercentLow}% to ${firstYearRoiPercentHigh}% and investment payback estimated within ${paybackMonthsLow} to ${paybackMonthsHigh} months.`
      : 'ROI and payback are not yet calculable because one or more required assumptions are zero, missing or unverified. No savings claim should be made until a consultant validates affected people, recoverable hours, hourly cost, confidence and investment.';
  return {
    assumptions,
    monthlySavingsLow,
    monthlySavingsHigh,
    annualSavingsLow,
    annualSavingsHigh,
    firstYearRoiPercentLow,
    firstYearRoiPercentHigh,
    paybackMonthsLow,
    paybackMonthsHigh,
    narrative
  };
}
