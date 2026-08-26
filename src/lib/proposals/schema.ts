import { z } from 'zod';

const boundedText = (max: number) => z.string().trim().min(1).max(max);

export const proposalInputSchema = z.object({
  clientName: z.string().trim().min(2).max(120),
  clientWebsite: z.string().max(8000).optional().default(''),
  linkedinContext: z.string().max(8000).optional().default(''),
  annualReportContext: z.string().max(12000).optional().default(''),
  currentPain: z.string().max(4000).optional().default(''),
  desiredOutcome: z.string().max(4000).optional().default(''),
  budgetRange: z.string().max(250).optional().default(''),
  timelinePreference: z.string().max(250).optional().default(''),
  consultantPositioning: z.string().max(1000).optional().default('')
});

const roadmapPhaseSchema = z.object({
  phase: boundedText(120),
  objective: boundedText(1200),
  deliverables: z.array(boundedText(500)).max(20),
  successMetrics: z.array(boundedText(500)).max(20)
});

const pricingOptionSchema = z.object({
  name: boundedText(120),
  price: z.number().finite().nonnegative().max(100_000_000),
  description: boundedText(2000),
  bestFor: boundedText(1000)
});

const timelineItemSchema = z.object({
  week: boundedText(120),
  workstream: boundedText(300),
  outcome: boundedText(1000)
});

const riskItemSchema = z.object({
  risk: boundedText(1000),
  likelihood: z.enum(['Low', 'Medium', 'High']),
  impact: z.enum(['Low', 'Medium', 'High']),
  mitigation: boundedText(2000)
});

export const proposalOutputSchema = z.object({
  executiveSummary: boundedText(8000),
  proposal: boundedText(20000),
  technicalSolution: boundedText(20000),
  roadmap: z.array(roadmapPhaseSchema).min(1).max(20),
  pricing: z.array(pricingOptionSchema).min(1).max(10),
  timeline: z.array(timelineItemSchema).min(1).max(30),
  roiEstimate: z.object({
    assumptions: z.array(boundedText(1000)).max(30),
    monthlySavingsLow: z.number().finite().nonnegative().max(1_000_000_000),
    monthlySavingsHigh: z.number().finite().nonnegative().max(1_000_000_000),
    paybackMonthsLow: z.number().finite().nonnegative().max(1200),
    paybackMonthsHigh: z.number().finite().nonnegative().max(1200),
    narrative: boundedText(5000)
  }),
  risks: z.array(riskItemSchema).max(30),
  executivePresentation: z.array(boundedText(1000)).min(1).max(50)
});

export type ProposalInputSchema = z.infer<typeof proposalInputSchema>;
export type ProposalOutputSchema = z.infer<typeof proposalOutputSchema>;
