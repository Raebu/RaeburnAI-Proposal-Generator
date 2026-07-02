import { z } from 'zod';

export const proposalInputSchema = z.object({
  clientName: z.string().min(2).max(120),
  clientWebsite: z.string().max(8000).optional().default(''),
  linkedinContext: z.string().max(8000).optional().default(''),
  annualReportContext: z.string().max(12000).optional().default(''),
  currentPain: z.string().max(4000).optional().default(''),
  desiredOutcome: z.string().max(4000).optional().default(''),
  budgetRange: z.string().max(250).optional().default(''),
  timelinePreference: z.string().max(250).optional().default(''),
  consultantPositioning: z.string().max(1000).optional().default('')
});

export type ProposalInputSchema = z.infer<typeof proposalInputSchema>;
