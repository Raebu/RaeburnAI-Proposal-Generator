import { z } from 'zod';

export const decisionMakerSchema = z.object({
  name: z.string().max(120).optional().default(''),
  email: z.string().email().optional().or(z.literal('')).default(''),
  role: z.string().max(120).optional().default('')
});

export const roiInputsSchema = z.object({
  people: z.number().min(1).max(10000).default(20),
  hoursSavedPerPersonPerWeek: z.number().min(0.1).max(80).default(3),
  hourlyCost: z.number().min(1).max(5000).default(45),
  recoveryConfidencePercent: z.number().min(1).max(100).default(80),
  investment: z.number().min(500).max(10000000).default(12000)
});

export const proposalInputSchema = z.object({
  contractVersion: z.literal('1.0').optional().default('1.0'),
  assessmentId: z.string().max(120).optional().default(''),
  clientName: z
    .string()
    .min(2, 'Client name must be at least 2 characters')
    .max(120, 'Client name too long'),
  sector: z.string().max(120).optional().default(''),
  companySize: z.string().max(120).optional().default(''),
  decisionMaker: decisionMakerSchema.optional().default({}),
  clientWebsite: z.string().max(8000).optional().default(''),
  linkedinContext: z.string().max(8000).optional().default(''),
  annualReportContext: z.string().max(12000).optional().default(''),
  currentPain: z.string().max(4000).optional().default(''),
  desiredOutcome: z.string().max(4000).optional().default(''),
  budgetRange: z.string().max(250).optional().default(''),
  timelinePreference: z.string().max(250).optional().default(''),
  consultantPositioning: z.string().max(1000).optional().default(''),
  currentWorkflows: z.array(z.string().max(500)).optional().default([]),
  operationalPainPoints: z.array(z.string().max(500)).optional().default([]),
  softwareStack: z.array(z.string().max(500)).optional().default([]),
  identifiedOpportunities: z.array(z.string().max(500)).optional().default([]),
  riskFactors: z.array(z.string().max(500)).optional().default([]),
  implementationConstraints: z.array(z.string().max(500)).optional().default([]),
  discoveryNotes: z.string().max(12000).optional().default(''),
  roiInputs: roiInputsSchema.optional().default({
    people: 20,
    hoursSavedPerPersonPerWeek: 3,
    hourlyCost: 45,
    recoveryConfidencePercent: 80,
    investment: 12000
  })
});

export type ProposalInputSchema = z.infer<typeof proposalInputSchema>;

export const roadmapPhaseSchema = z.object({
  phase: z.string().min(1),
  objective: z.string().min(1),
  deliverables: z.array(z.string()),
  successMetrics: z.array(z.string())
});

export const pricingOptionSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  description: z.string().min(1),
  bestFor: z.string().min(1)
});

export const timelineItemSchema = z.object({
  week: z.string().min(1),
  workstream: z.string().min(1),
  outcome: z.string().min(1)
});

export const roiEstimateSchema = z.object({
  assumptions: z.array(z.string()),
  monthlySavingsLow: z.number().min(0),
  monthlySavingsHigh: z.number().min(0),
  annualSavingsLow: z.number().min(0),
  annualSavingsHigh: z.number().min(0),
  firstYearRoiPercentLow: z.number(),
  firstYearRoiPercentHigh: z.number(),
  paybackMonthsLow: z.number().min(0),
  paybackMonthsHigh: z.number().min(0),
  narrative: z.string().min(1)
});

export const riskItemSchema = z.object({
  risk: z.string().min(1),
  likelihood: z.enum(['Low', 'Medium', 'High']),
  impact: z.enum(['Low', 'Medium', 'High']),
  mitigation: z.string().min(1)
});

export const proposalOutputSchema = z.object({
  contractVersion: z.literal('1.0').default('1.0'),
  status: z.literal('DRAFT_REQUIRES_HUMAN_REVIEW').default('DRAFT_REQUIRES_HUMAN_REVIEW'),
  generationMode: z
    .enum(['provider-generated', 'deterministic-fallback'])
    .default('provider-generated'),
  executiveSummary: z.string().min(1),
  businessContext: z.string().min(1),
  currentStateAssessment: z.string().min(1),
  keyOperationalChallenges: z.array(z.string()),
  prioritisedOpportunities: z.array(z.string()),
  proposal: z.string().min(1),
  technicalSolution: z.string().min(1),
  roadmap: z.array(roadmapPhaseSchema).min(1),
  pricing: z.array(pricingOptionSchema).min(1),
  timeline: z.array(timelineItemSchema).min(1),
  roiEstimate: roiEstimateSchema,
  risks: z.array(riskItemSchema).min(1),
  governance: z.array(z.string()),
  responsibleAiConsiderations: z.array(z.string()),
  nextSteps: z.array(z.string()),
  executivePresentation: z.array(z.string())
});

export type ProposalOutputSchema = z.infer<typeof proposalOutputSchema>;
