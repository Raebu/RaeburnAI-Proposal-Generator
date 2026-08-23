export type ProposalInput = {
  contractVersion?: '1.0';
  assessmentId?: string;
  clientName: string;
  sector?: string;
  companySize?: string;
  decisionMaker?: { name?: string; email?: string; role?: string };
  clientWebsite?: string;
  linkedinContext?: string;
  annualReportContext?: string;
  currentPain?: string;
  desiredOutcome?: string;
  budgetRange?: string;
  timelinePreference?: string;
  consultantPositioning?: string;
  currentWorkflows?: string[];
  operationalPainPoints?: string[];
  softwareStack?: string[];
  identifiedOpportunities?: string[];
  riskFactors?: string[];
  implementationConstraints?: string[];
  discoveryNotes?: string;
  roiInputs?: {
    people: number;
    hoursSavedPerPersonPerWeek: number;
    hourlyCost: number;
    recoveryConfidencePercent: number;
    investment: number;
  };
};

export type ProposalOutput = {
  contractVersion: '1.0';
  status: 'DRAFT_REQUIRES_HUMAN_REVIEW';
  generationMode: 'provider-generated' | 'deterministic-fallback';
  executiveSummary: string;
  businessContext: string;
  currentStateAssessment: string;
  keyOperationalChallenges: string[];
  prioritisedOpportunities: string[];
  proposal: string;
  technicalSolution: string;
  roadmap: RoadmapPhase[];
  pricing: PricingOption[];
  timeline: TimelineItem[];
  dependencies: string[];
  roiEstimate: RoiEstimate;
  risks: RiskItem[];
  governance: string[];
  responsibleAiConsiderations: string[];
  nextSteps: string[];
  executivePresentation: string[];
};

export type RoadmapPhase = {
  phase: string;
  objective: string;
  deliverables: string[];
  successMetrics: string[];
};

export type PricingOption = {
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  bestFor: string;
};

export type TimelineItem = {
  week: string;
  workstream: string;
  outcome: string;
};

export type RoiEstimate = {
  assumptions: string[];
  monthlySavingsLow: number;
  monthlySavingsHigh: number;
  annualSavingsLow: number;
  annualSavingsHigh: number;
  firstYearRoiPercentLow: number;
  firstYearRoiPercentHigh: number;
  paybackMonthsLow: number;
  paybackMonthsHigh: number;
  narrative: string;
};

export type RiskItem = {
  risk: string;
  likelihood: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  mitigation: string;
};
