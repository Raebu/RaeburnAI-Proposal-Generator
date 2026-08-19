import OpenAI from 'openai';
import { buildProposalSystemPrompt, buildProposalUserPrompt } from './prompt';
import { buildPricingOptions, estimateRoi } from '~/lib/proposals/calculators';
import { proposalOutputSchema } from '~/lib/proposals/schema';
import type { ProposalInput, ProposalOutput } from '~/lib/types/proposal';

export function fallbackProposal(input: ProposalInput): ProposalOutput {
  const clientName = input.clientName || 'Target Client';
  const sector = input.sector ? `in the ${input.sector} sector` : 'in your industry';
  const roiInputs = input.roiInputs || {
    people: 20,
    hoursSavedPerPersonPerWeek: 3,
    hourlyCost: 45,
    recoveryConfidencePercent: 80,
    investment: 12000
  };

  const pricing = buildPricingOptions(roiInputs.investment);
  const roiEstimate = estimateRoi(roiInputs);

  return {
    contractVersion: '1.0',
    status: 'DRAFT_REQUIRES_HUMAN_REVIEW',
    generationMode: 'deterministic-fallback',
    executiveSummary: `${clientName} ${sector} has an immediate opportunity to turn discovery context and operating bottlenecks into a prioritised AI transformation programme with measurable commercial ROI.`,
    businessContext: `${clientName} operates ${sector}. To maintain competitive advantage, the leadership team requires a strategic workflow modernization approach that addresses manual overhead while protecting operational stability.`,
    currentStateAssessment: `Current operations for ${clientName} are constrained by manual workflows, fragmented tools, and non-standardised data handoffs. Key team members spend significant hours weekly on repetitive processes.`,
    keyOperationalChallenges: input.operationalPainPoints?.length
      ? input.operationalPainPoints
      : [
          'High manual operational effort in core workflows',
          'Fragmented software stack and data silos',
          'Limited real-time visibility into capacity and throughput'
        ],
    prioritisedOpportunities: input.identifiedOpportunities?.length
      ? input.identifiedOpportunities
      : [
          'Automate high-volume repetitive document & workflow tasks',
          'Implement AI-assisted decision support for team members',
          'Establish continuous capacity recovery and analytics reporting'
        ],
    proposal: `Raeburn Consulting Group proposes a 3-phase consulting engagement to audit current workflows, architect a custom AI solution, and manage implementation through to adoption.`,
    technicalSolution:
      'A secure enterprise AI consulting architecture combining context ingestion, structured schemas, model gateway controls, human-in-the-loop validation, and executive analytics.',
    roadmap: [
      {
        phase: 'Phase 1: Diagnostic & Architecture',
        objective: 'Clarify operating model, audit workflows, and design target state.',
        deliverables: [
          'Stakeholder discovery',
          'Workflow audit',
          'Architecture design',
          'ROI model signoff'
        ],
        successMetrics: ['100% scope alignment', 'Confirmed executive sponsorship']
      },
      {
        phase: 'Phase 2: Build & Pilot Delivery',
        objective: 'Configure core automation workstreams and launch controlled pilot.',
        deliverables: ['Configured AI pipeline', 'User enablement guide', 'Pilot launch'],
        successMetrics: ['Pilot adoption > 80%', 'Measurable capacity recovery']
      },
      {
        phase: 'Phase 3: Scale & Governance',
        objective: 'Full operational rollout, training, and continuous governance.',
        deliverables: ['Enterprise rollout', 'Governance framework', 'Handover documentation'],
        successMetrics: ['Target ROI achievement', 'Zero security policy exceptions']
      }
    ],
    pricing,
    timeline: [
      {
        week: 'Weeks 1-2',
        workstream: 'Diagnostic & Architecture',
        outcome: 'Target design & business case'
      },
      {
        week: 'Weeks 3-6',
        workstream: 'Pilot Build & Testing',
        outcome: 'Functional pilot system'
      },
      {
        week: 'Weeks 7-8',
        workstream: 'Operational Launch & Handover',
        outcome: 'Enterprise enablement'
      }
    ],
    roiEstimate,
    risks: [
      {
        risk: 'Stakeholder availability during discovery',
        likelihood: 'Medium',
        impact: 'Medium',
        mitigation: 'Establish a structured 2-hour weekly steering cadence.'
      },
      {
        risk: 'Data quality & legacy tool integration',
        likelihood: 'Medium',
        impact: 'High',
        mitigation: 'Run automated data validation in Phase 1 before building integrations.'
      }
    ],
    governance: [
      'Weekly steering committee with named executive sponsor',
      'Document approved data-retention, access and provider-processing boundaries before launch',
      'Mandatory human review for critical outputs'
    ],
    responsibleAiConsiderations: [
      'Confirm the selected AI provider account’s retention and model-training controls before submitting confidential client data',
      'Audit only operational metadata; do not log client context or model response payloads',
      'Use structured validation and mandatory consultant review to reduce, but not eliminate, hallucination risk'
    ],
    nextSteps: [
      'Review and approve engagement scope',
      'Confirm named project sponsor and discovery team',
      'Schedule Phase 1 kickoff workshop'
    ],
    executivePresentation: [
      'Slide 1: Transformation Executive Summary',
      'Slide 2: Current State & Operational Challenges',
      'Slide 3: Target AI Architecture',
      'Slide 4: Phased Implementation Roadmap',
      'Slide 5: Commercial Pricing & ROI Payback'
    ]
  };
}

export function proposalFromModelText(text: string, input: ProposalInput): ProposalOutput {
  try {
    const parseResult = proposalOutputSchema.safeParse(JSON.parse(text));
    if (!parseResult.success) return fallbackProposal(input);

    return {
      ...parseResult.data,
      contractVersion: '1.0',
      status: 'DRAFT_REQUIRES_HUMAN_REVIEW',
      generationMode: 'provider-generated',
      pricing: buildPricingOptions(input.roiInputs?.investment),
      roiEstimate: estimateRoi(input.roiInputs)
    };
  } catch {
    return fallbackProposal(input);
  }
}

export async function generateProposal(input: ProposalInput): Promise<ProposalOutput> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return fallbackProposal(input);

  try {
    const client = new OpenAI({ apiKey: key });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await client.chat.completions.create(
      {
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: buildProposalSystemPrompt() },
          { role: 'user', content: buildProposalUserPrompt(input) }
        ]
      },
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    const text = response.choices[0]?.message?.content;
    if (!text) return fallbackProposal(input);

    return proposalFromModelText(text, input);
  } catch {
    console.warn('AI proposal generation unavailable; deterministic fallback used.');
    return fallbackProposal(input);
  }
}
