import { z } from 'zod';

export const decisionMakerSchema = z.object({
  name: z.string().max(120).optional().default(''),
  email: z.string().email().optional().or(z.literal('')).default(''),
  role: z.string().max(120).optional().default('')
});

export const roiInputsSchema = z.object({
  people: z.number().int().min(0).max(10000),
  hoursSavedPerPersonPerWeek: z.number().min(0).max(80),
  hourlyCost: z.number().min(0).max(5000),
  recoveryConfidencePercent: z.number().min(0).max(100),
  investment: z.number().min(0).max(10000000)
});

export const proposalInputSchema = z
  .object({
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
    currentWorkflows: z.array(z.string().max(500)).max(30).optional().default([]),
    operationalPainPoints: z.array(z.string().max(500)).max(30).optional().default([]),
    softwareStack: z.array(z.string().max(500)).max(30).optional().default([]),
    identifiedOpportunities: z.array(z.string().max(500)).max(30).optional().default([]),
    riskFactors: z.array(z.string().max(500)).max(30).optional().default([]),
    implementationConstraints: z.array(z.string().max(500)).max(30).optional().default([]),
    discoveryNotes: z.string().max(12000).optional().default(''),
    roiInputs: roiInputsSchema.optional()
  })
  .strict();

export type ProposalInputSchema = z.infer<typeof proposalInputSchema>;

export const roadmapPhaseSchema = z.object({
  phase: z.string().min(1).max(500),
  objective: z.string().min(1).max(2000),
  deliverables: z.array(z.string().min(1).max(1000)).max(20),
  successMetrics: z.array(z.string().min(1).max(1000)).max(20)
});

export const pricingOptionSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().finite().min(0).max(10000000),
  priceLabel: z.string().min(1).max(100),
  description: z.string().min(1).max(2000),
  bestFor: z.string().min(1).max(1000)
});

export const timelineItemSchema = z.object({
  week: z.string().min(1).max(200),
  workstream: z.string().min(1).max(500),
  outcome: z.string().min(1).max(1000)
});

export const roiEstimateSchema = z.object({
  assumptions: z.array(z.string().min(1).max(1000)).max(30),
  monthlySavingsLow: z.number().finite().min(0),
  monthlySavingsHigh: z.number().finite().min(0),
  annualSavingsLow: z.number().finite().min(0),
  annualSavingsHigh: z.number().finite().min(0),
  firstYearRoiPercentLow: z.number().finite(),
  firstYearRoiPercentHigh: z.number().finite(),
  paybackMonthsLow: z.number().finite().min(0),
  paybackMonthsHigh: z.number().finite().min(0),
  narrative: z.string().min(1).max(4000)
});

export const riskItemSchema = z.object({
  risk: z.string().min(1).max(1000),
  likelihood: z.enum(['Low', 'Medium', 'High']),
  impact: z.enum(['Low', 'Medium', 'High']),
  mitigation: z.string().min(1).max(2000)
});

export const proposalOutputSchema = z
  .object({
    contractVersion: z.literal('1.0').default('1.0'),
    status: z.literal('DRAFT_REQUIRES_HUMAN_REVIEW').default('DRAFT_REQUIRES_HUMAN_REVIEW'),
    generationMode: z
      .enum(['provider-generated', 'deterministic-fallback'])
      .default('provider-generated'),
    executiveSummary: z.string().min(1).max(8000),
    businessContext: z.string().min(1).max(12000),
    currentStateAssessment: z.string().min(1).max(12000),
    keyOperationalChallenges: z.array(z.string().max(1000)).min(1).max(20),
    prioritisedOpportunities: z.array(z.string().max(1000)).min(1).max(20),
    proposal: z.string().min(1).max(16000),
    technicalSolution: z.string().min(1).max(16000),
    roadmap: z.array(roadmapPhaseSchema).min(1).max(10),
    pricing: z.array(pricingOptionSchema).min(1).max(10),
    timeline: z.array(timelineItemSchema).min(1).max(20),
    dependencies: z.array(z.string().max(1000)).min(1).max(20),
    roiEstimate: roiEstimateSchema,
    risks: z.array(riskItemSchema).min(1).max(20),
    governance: z.array(z.string().max(1000)).min(1).max(20),
    responsibleAiConsiderations: z.array(z.string().max(1000)).min(1).max(20),
    nextSteps: z.array(z.string().max(1000)).min(1).max(20),
    executivePresentation: z.array(z.string().max(1000)).min(1).max(30)
  })
  .strict();

export type ProposalOutputSchema = z.infer<typeof proposalOutputSchema>;
