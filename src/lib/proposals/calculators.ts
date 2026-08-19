import type { PricingOption, RoiEstimate } from '~/lib/types/proposal';

export function buildPricingOptions(basePrice = 12000): PricingOption[] {
  const safeBase = Number.isFinite(basePrice) && basePrice > 0 ? basePrice : 12000;
  return [
    {
      name: 'Diagnostic Sprint',
      price: Math.round(safeBase * 0.45),
      description:
        'Discovery, workflow audit, solution architecture and prioritised business case.',
      bestFor: 'Clients who need clarity before committing to implementation.'
    },
    {
      name: 'Implementation Partner',
      price: Math.round(safeBase),
      description: 'End-to-end proposal delivery, build support, enablement and launch governance.',
      bestFor: 'Clients ready to move from strategy to measurable delivery.'
    },
    {
      name: 'Transformation Retainer',
      price: Math.round(safeBase * 2.5),
      description:
        'Multi-workstream delivery, executive reporting, optimisation and continuous improvement.',
      bestFor: 'Clients who need a longer-term operating partner.'
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
  const finiteOr = (value: number | undefined, fallback: number) =>
    Number.isFinite(value) ? (value as number) : fallback;
  const people = Math.max(1, finiteOr(params?.people, 20));
  const hours = Math.max(0.1, finiteOr(params?.hoursSavedPerPersonPerWeek, 3));
  const hourlyCost = Math.max(1, finiteOr(params?.hourlyCost, 45));
  const confidence =
    Math.min(100, Math.max(1, finiteOr(params?.recoveryConfidencePercent, 80))) / 100;
  const investment = Math.max(500, finiteOr(params?.investment, 12000));

  const rawWeeklySavings = people * hours * hourlyCost;
  const rawMonthlySavings = rawWeeklySavings * 4.33;

  const monthlySavingsLow = Math.round(rawMonthlySavings * 0.6 * confidence);
  const monthlySavingsHigh = Math.round(rawMonthlySavings * confidence);

  const safeLow = Math.max(1, monthlySavingsLow);
  const safeHigh = Math.max(1, monthlySavingsHigh);

  const annualSavingsLow = safeLow * 12;
  const annualSavingsHigh = safeHigh * 12;
  const firstYearRoiPercentLow = Math.round(((annualSavingsLow - investment) / investment) * 100);
  const firstYearRoiPercentHigh = Math.round(((annualSavingsHigh - investment) / investment) * 100);

  const paybackMonthsHigh = Number((investment / safeLow).toFixed(1));
  const paybackMonthsLow = Number((investment / safeHigh).toFixed(1));

  return {
    assumptions: [
      `${people} process participants / affected team members`,
      `${hours} hours saved per person per week before process optimization`,
      `Blended hourly cost of £${hourlyCost}/hr`,
      `Capacity recovery confidence factor of ${Math.round(confidence * 100)}%`,
      `Implementation investment benchmark of £${investment.toLocaleString()}`,
      'Capacity value is a planning estimate, not guaranteed cash savings; recurring technology costs, VAT and implementation disruption are excluded and must be confirmed during discovery.'
    ],
    monthlySavingsLow,
    monthlySavingsHigh,
    annualSavingsLow,
    annualSavingsHigh,
    firstYearRoiPercentLow,
    firstYearRoiPercentHigh,
    paybackMonthsLow,
    paybackMonthsHigh,
    narrative: `Estimated gross monthly capacity value ranges from £${monthlySavingsLow.toLocaleString()} to £${monthlySavingsHigh.toLocaleString()} (£${annualSavingsLow.toLocaleString()} to £${annualSavingsHigh.toLocaleString()} annualised), with first-year ROI of ${firstYearRoiPercentLow}% to ${firstYearRoiPercentHigh}% and investment payback estimated within ${paybackMonthsLow} to ${paybackMonthsHigh} months.`
  };
}
