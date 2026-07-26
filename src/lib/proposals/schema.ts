import { z } from 'zod';

export const proposalInputSchema = z.object({
  clientName: z.string().trim().min(2).max(120),
  clientWebsite: z.string().trim().max(8000).optional().default(''),
  linkedinContext: z.string().trim().max(8000).optional().default(''),
  annualReportContext: z.string().trim().max(12000).optional().default(''),
  currentPain: z.string().trim().max(4000).optional().default(''),
  desiredOutcome: z.string().trim().max(4000).optional().default(''),
  budgetRange: z.string().trim().max(250).optional().default(''),
  timelinePreference: z.string().trim().max(250).optional().default(''),
  consultantPositioning: z.string().trim().max(1000).optional().default('')
}).strict().refine((value) => {
  const contextLength =
    value.clientWebsite.length +
    value.linkedinContext.length +
    value.annualReportContext.length +
    value.currentPain.length +
    value.desiredOutcome.length +
    value.consultantPositioning.length;
  return contextLength >= 10;
}, {
  message: 'Provide at least 10 characters of client context.'
});

export type ProposalInputSchema = z.infer<typeof proposalInputSchema>;
