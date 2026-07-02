export type ProposalInput = {
  clientName: string;
  clientWebsite?: string;
  linkedinContext?: string;
  annualReportContext?: string;
  currentPain?: string;
  desiredOutcome?: string;
  budgetRange?: string;
  timelinePreference?: string;
  consultantPositioning?: string;
};

export type ProposalOutput = {
  executiveSummary: string;
  proposal: string;
  technicalSolution: string;
  roadmap: RoadmapPhase[];
  pricing: PricingOption[];
  timeline: TimelineItem[];
  roiEstimate: RoiEstimate;
  risks: RiskItem[];
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
