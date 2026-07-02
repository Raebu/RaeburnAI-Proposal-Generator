import OpenAI from 'openai';
import { buildProposalPrompt } from './prompt';
import { buildPricingOptions, estimateRoi } from '~/lib/proposals/calculators';
import type { ProposalInput, ProposalOutput } from '~/lib/types/proposal';

export function fallbackProposal(input: ProposalInput): ProposalOutput {
  const pricing = buildPricingOptions();
  return {
    executiveSummary: `${input.clientName} has an opportunity to turn discovery context into a prioritised implementation programme with measurable commercial value.`,
    proposal: 'Assess the client context, identify the highest-value opportunities, design the target solution, and deliver a practical implementation plan with governance and reporting.',
    technicalSolution: 'A secure AI-assisted consulting workflow for context ingestion, structured analysis, roadmap generation, ROI modelling, human review and proposal export.',
    roadmap: [
      { phase: 'Discover', objective: 'Clarify goals and current operating model.', deliverables: ['Stakeholder discovery', 'Current-state summary', 'Opportunity backlog'], successMetrics: ['Clear scope', 'Confirmed priorities'] },
      { phase: 'Design', objective: 'Create the solution architecture and delivery plan.', deliverables: ['Target-state design', 'Implementation roadmap', 'Commercial model'], successMetrics: ['Signed-off approach', 'Measurable ROI model'] },
      { phase: 'Deliver', objective: 'Implement priority workstreams and prove value.', deliverables: ['Configured workflows', 'Pilot launch', 'Training'], successMetrics: ['Adoption', 'Hours saved', 'Quality improvement'] }
    ],
    pricing,
    timeline: [
      { week: 'Week 1', workstream: 'Discovery', outcome: 'Opportunity map' },
      { week: 'Week 2', workstream: 'Solution design', outcome: 'Roadmap and commercial case' },
      { week: 'Weeks 3-6', workstream: 'Delivery', outcome: 'Pilot launched and measured' }
    ],
    roiEstimate: estimateRoi({ investment: pricing[1].price }),
    risks: [
      { risk: 'Insufficient stakeholder availability', likelihood: 'Medium', impact: 'Medium', mitigation: 'Agree named sponsors and decision cadence before kickoff.' },
      { risk: 'Poor source data quality', likelihood: 'Medium', impact: 'High', mitigation: 'Validate assumptions and prioritise high-confidence use cases first.' }
    ],
    executivePresentation: ['Executive summary', 'Current-state challenges', 'Recommended solution', 'Roadmap', 'ROI and payback']
  };
}

export async function generateProposal(input: ProposalInput): Promise<ProposalOutput> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return fallbackProposal(input);

  const client = new OpenAI({ apiKey: key });
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'Generate structured consulting proposal JSON.' },
      { role: 'user', content: buildProposalPrompt(input) }
    ]
  });

  const text = response.choices[0]?.message?.content;
  if (!text) return fallbackProposal(input);
  try {
    return JSON.parse(text) as ProposalOutput;
  } catch {
    return fallbackProposal(input);
  }
}
