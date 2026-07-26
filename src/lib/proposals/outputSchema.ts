import { z } from 'zod';

const boundedText = (max: number) => z.string().trim().min(1).max(max);

const roadmapPhaseSchema = z.object({
  phase: boundedText(200),
  objective: boundedText(2000),
  deliverables: z.array(boundedText(1000)).min(1).max(50),
  successMetrics: z.array(boundedText(1000)).min(1).max(50),
}).strict();

const pricingOptionSchema = z.object({
  name: boundedText(200),
  price: z.number().finite().nonnegative().max(100_000_000),
  description: boundedText(5000),
  bestFor: boundedText(2000),
}).strict();

const timelineItemSchema = z.object({
  week: boundedText(200),
  workstream: boundedText(500),
  outcome: boundedText(2000),
}).strict();

const roiEstimateSchema = z.object({
  assumptions: z.array(boundedText(2000)).min(1).max(100),
  monthlySavingsLow: z.number().finite().nonnegative().max(1_000_000_000),
  monthlySavingsHigh: z.number().finite().nonnegative().max(1_000_000_000),
  paybackMonthsLow: z.number().finite().nonnegative().max(1200),
  paybackMonthsHigh: z.number().finite().nonnegative().max(1200),
  narrative: boundedText(10_000),
}).strict().refine((value) => value.monthlySavingsHigh >= value.monthlySavingsLow, {
  message: 'monthlySavingsHigh must be greater than or equal to monthlySavingsLow',
}).refine((value) => value.paybackMonthsHigh >= value.paybackMonthsLow, {
  message: 'paybackMonthsHigh must be greater than or equal to paybackMonthsLow',
});

const riskSchema = z.object({
  risk: boundedText(2000),
  likelihood: z.enum(['Low', 'Medium', 'High']),
  impact: z.enum(['Low', 'Medium', 'High']),
  mitigation: boundedText(5000),
}).strict();

export const proposalOutputSchema = z.object({
  executiveSummary: boundedText(20_000),
  proposal: boundedText(100_000),
  technicalSolution: boundedText(50_000),
  roadmap: z.array(roadmapPhaseSchema).min(1).max(50),
  pricing: z.array(pricingOptionSchema).min(1).max(20),
  timeline: z.array(timelineItemSchema).min(1).max(100),
  roiEstimate: roiEstimateSchema,
  risks: z.array(riskSchema).max(100),
  executivePresentation: z.array(boundedText(2000)).min(1).max(100),
}).strict();
