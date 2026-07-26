import { z } from 'zod';

export const approvalRequestSchema = z.object({
  reason: z.string().trim().min(3).max(2000),
}).strict();

export const proposalIdSchema = z.string().uuid();
