import OpenAI from 'openai';
import { buildProposalSystemPrompt, buildProposalUserPrompt } from './prompt';
import { buildPricingOptions, estimateRoi } from '~/lib/proposals/calculators';
import { proposalOutputSchema } from '~/lib/proposals/schema';
import type { ProposalInput, ProposalOutput } from '~/lib/types/proposal';

export function fallbackProposal(input: ProposalInput): ProposalOutput {
  const clientName = input.clientName || 'Target Client';
  const sector = input.sector
    ? `in the ${input.sector} sector`
    : 'in the sector recorded at discovery';
  const statedContext =
    input.currentPain?.trim() || 'Detailed current-state evidence has not yet been provided.';
  const desiredOutcome =
    input.desiredOutcome?.trim() || 'Desired outcomes must be confirmed during discovery.';
  const pricing = buildPricingOptions();
  const roiEstimate = estimateRoi(input.roiInputs);

  return {
    contractVersion: '1.0',
    status: 'DRAFT_REQUIRES_HUMAN_REVIEW',
    generationMode: 'deterministic-fallback',
    executiveSummary: `This draft translates the context supplied by ${clientName} ${sector} into an evidence-led assessment and phased set of options. Client facts, feasibility, scope and financial assumptions require consultant validation before delivery.`,
    businessContext: `${clientName} operates ${sector}. Stated current context: ${statedContext} Stated desired outcome: ${desiredOutcome}`,
    currentStateAssessment: `The current-state assessment is limited to information supplied in the assessment and discovery notes. Known context: ${statedContext} Any workflow volume, data-quality, integration or capacity finding not explicitly recorded remains unverified.`,
    keyOperationalChallenges: input.operationalPainPoints?.length
      ? input.operationalPainPoints
      : [
          'Current workflow baselines require discovery validation',
          'System ownership, data quality and integration constraints require confirmation',
          'Success measures and operational acceptance criteria are not yet signed off'
        ],
    prioritisedOpportunities: input.identifiedOpportunities?.length
      ? input.identifiedOpportunities
      : [
          'Assess high-volume repetitive work for safe automation potential',
          'Evaluate bounded AI assistance with human decision ownership',
          'Define baseline measures before forecasting capacity or financial impact'
        ],
    proposal: `Raeburn Consulting proposes a gated approach: validate the current state, confirm a bounded priority and business case, then agree whether a sprint or separately scoped implementation is justified.`,
    technicalSolution:
      'A proposed solution pattern combining structured inputs, least-privilege integrations, provider controls, schema validation, human approval and measurable operational monitoring. The final architecture depends on validated systems and data constraints.',
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
        successMetrics: [
          'Scope and assumptions signed off',
          'Named executive and operational ownership confirmed'
        ]
      },
      {
        phase: 'Phase 2: Build & Pilot Delivery',
        objective: 'Configure core automation workstreams and launch controlled pilot.',
        deliverables: ['Configured AI pipeline', 'User enablement guide', 'Pilot launch'],
        successMetrics: [
          'Pilot acceptance criteria agreed before build',
          'Observed outcome measured against the approved baseline'
        ]
      },
      {
        phase: 'Phase 3: Scale & Governance',
        objective: 'Full operational rollout, training, and continuous governance.',
        deliverables: ['Enterprise rollout', 'Governance framework', 'Handover documentation'],
        successMetrics: [
          'Scale decision supported by pilot evidence',
          'Security and governance exceptions reviewed before release'
        ]
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
    dependencies: [
      'Named executive sponsor and operational subject-matter experts',
      'Approved access to relevant systems and representative, minimised data',
      'Consultant validation of scope, financial assumptions and success measures'
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
      pricing: buildPricingOptions(),
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
    const client = new OpenAI({ apiKey: key, maxRetries: 1, timeout: 25_000 });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25_000);
    const response = await client.chat.completions
      .create(
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
      )
      .finally(() => clearTimeout(timeoutId));

    const text = response.choices[0]?.message?.content;
    if (!text) return fallbackProposal(input);

    return proposalFromModelText(text, input);
  } catch {
    return fallbackProposal(input);
  }
}
