import type { PricingOption, RoiEstimate } from '~/lib/types/proposal';

export function buildPricingOptions(basePrice = 12000): PricingOption[] {
  return [
    {
      name: 'Diagnostic Sprint',
      price: Math.round(basePrice * 0.45),
      description: 'Discovery, workflow audit, solution architecture and prioritised business case.',
      bestFor: 'Clients who need clarity before committing to implementation.'
    },
    {
      name: 'Implementation Partner',
      price: basePrice,
      description: 'End-to-end proposal delivery, build support, enablement and launch governance.',
      bestFor: 'Clients ready to move from strategy to measurable delivery.'
    },
    {
      name: 'Transformation Retainer',
      price: Math.round(basePrice * 2.5),
      description: 'Multi-workstream delivery, executive reporting, optimisation and continuous improvement.',
      bestFor: 'Clients who need a longer-term operating partner.'
    }
  ];
}

export function estimateRoi(params?: { people?: number; hoursSavedPerPersonPerWeek?: number; hourlyCost?: number; investment?: number }): RoiEstimate {
  const people = params?.people ?? 20;
  const hours = params?.hoursSavedPerPersonPerWeek ?? 3;
  const hourlyCost = params?.hourlyCost ?? 45;
  const investment = params?.investment ?? 12000;
  const monthlySavingsLow = Math.round(people * hours * hourlyCost * 4 * 0.6);
  const monthlySavingsHigh = Math.round(people * hours * hourlyCost * 4 * 1.2);

  return {
    assumptions: [
      `${people} affected users or process participants`,
      `${hours} hours saved per person per week before optimisation uplift`,
      `Blended hourly cost of £${hourlyCost}`,
      `Initial investment benchmark of £${investment}`
    ],
    monthlySavingsLow,
    monthlySavingsHigh,
    paybackMonthsLow: Number((investment / monthlySavingsHigh).toFixed(1)),
    paybackMonthsHigh: Number((investment / monthlySavingsLow).toFixed(1)),
    narrative: `Estimated monthly value ranges from £${monthlySavingsLow.toLocaleString()} to £${monthlySavingsHigh.toLocaleString()}, with payback typically inside ${Number((investment / monthlySavingsLow).toFixed(1))} months under the conservative scenario.`
  };
}
