'use client';

import { FormEvent, useState } from 'react';
import type { ProposalInput, ProposalOutput } from '~/lib/types/proposal';

const DEMO_PAYLOAD: ProposalInput = {
  contractVersion: '1.0',
  clientName: 'Northstar Advisory Group',
  sector: 'Professional & Management Consulting',
  companySize: '50-200 employees',
  decisionMaker: {
    name: 'Sarah Jenkins',
    email: 's.jenkins@northstar-advisory.example',
    role: 'Managing Director'
  },
  clientWebsite:
    'UK consulting firm serving mid-market businesses with operational improvement and technology transformation services.',
  linkedinContext:
    'Leadership team is actively posting about AI adoption, consultant productivity, and client delivery excellence.',
  annualReportContext:
    'The organisation is prioritising margin expansion, faster client engagement turnarounds, and enterprise AI enablement.',
  currentPain:
    'Proposal drafting, discovery synthesis, and ROI roadmap production are highly manual, taking 15-20 hours per engagement.',
  desiredOutcome:
    'Establish a standardized, AI-assisted proposal engine that reduces drafting time by 75% while maintaining elite consulting quality.',
  budgetRange: '£15,000 - £40,000',
  timelinePreference: '6 weeks',
  consultantPositioning: 'Raeburn Consulting Group — AI Workflow & Transformation Practice',
  currentWorkflows: [
    'Client discovery notes transcription',
    'Manual proposal writing in Word/PowerPoint',
    'Ad-hoc ROI spreadsheet calculations'
  ],
  operationalPainPoints: [
    'Inconsistent proposal pricing & risk coverage across senior consultants',
    'Significant billable hours wasted on draft document preparation',
    'Slower client response times during peak acquisition cycles'
  ],
  softwareStack: ['Microsoft 365 / Teams', 'HubSpot CRM', 'Custom Excel financial models'],
  identifiedOpportunities: [
    'Automated client context extraction & schema validation',
    'Deterministic ROI payback calculator integration',
    'Print-quality proposal and executive presentation outline export'
  ],
  riskFactors: [
    'Consultant adoption resistance to new workflow tools',
    'Client confidentiality & data privacy governance concerns'
  ],
  implementationConstraints: [
    'Zero retention of confidential client context on external AI servers',
    'Full compatibility with existing web browser environment'
  ],
  discoveryNotes:
    'Initial scoping call confirmed strong partner support for AI enablement, provided human review remains mandatory before proposals reach clients.',
  roiInputs: {
    people: 25,
    hoursSavedPerPersonPerWeek: 4,
    hourlyCost: 65,
    recoveryConfidencePercent: 85,
    investment: 15000
  }
};

export default function HomePage() {
  const [formData, setFormData] = useState<ProposalInput>({
    clientName: '',
    sector: '',
    companySize: '',
    clientWebsite: '',
    linkedinContext: '',
    annualReportContext: '',
    currentPain: '',
    desiredOutcome: '',
    budgetRange: '',
    timelinePreference: '',
    consultantPositioning: '',
    discoveryNotes: '',
    roiInputs: {
      people: 20,
      hoursSavedPerPersonPerWeek: 3,
      hourlyCost: 45,
      recoveryConfidencePercent: 80,
      investment: 12000
    }
  });

  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<ProposalOutput | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);

  function loadDemoData() {
    setFormData(DEMO_PAYLOAD);
    setDemoMode(true);
    setError('');
  }

  function handleInputChange(field: keyof ProposalInput, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleRoiChange(key: keyof NonNullable<ProposalInput['roiInputs']>, value: number) {
    setFormData((prev) => ({
      ...prev,
      roiInputs: {
        ...(prev.roiInputs || {
          people: 20,
          hoursSavedPerPersonPerWeek: 3,
          hourlyCost: 45,
          recoveryConfidencePercent: 80,
          investment: 12000
        }),
        [key]: value
      }
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        return setError(data.error || 'Failed to generate proposal');
      }

      setProposal(data.proposal);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Network error');
    }
  }

  function copyToClipboard() {
    if (!proposal) return;
    const text = `
${demoMode ? 'DEMONSTRATION DATA — NOT FOR CLIENT USE\n\n' : ''}EXECUTIVE PROPOSAL — ${formData.clientName}

${proposal.executiveSummary}

BUSINESS CONTEXT
${proposal.businessContext}

CURRENT STATE ASSESSMENT
${proposal.currentStateAssessment}

TECHNICAL SOLUTION
${proposal.technicalSolution}

PROPOSED COST & PRICING
${proposal.pricing.map((p) => `- ${p.name}: ${p.priceLabel} (${p.description})`).join('\n')}

ROI ESTIMATE
${proposal.roiEstimate.narrative}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  function downloadJson() {
    if (!proposal) return;
    const jsonStr = JSON.stringify(
      demoMode ? { demoData: true, warning: 'NOT FOR CLIENT USE', proposal } : proposal,
      null,
      2
    );
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proposal-${proposal.contractVersion}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadDocx() {
    if (!proposal || exportingDocx) return;
    setExportingDocx(true);
    setError('');
    try {
      const { proposalDocumentBlob } = await import('~/lib/proposals/docx');
      const blob = await proposalDocumentBlob(proposal, formData.clientName, demoMode);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const clientSlug = formData.clientName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 80);
      anchor.href = url;
      anchor.download = `raeburn-ai-transformation-proposal-${clientSlug || 'client'}.docx`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('The DOCX export could not be created. Use Print / PDF or try again.');
    } finally {
      setExportingDocx(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      <header className="no-print border-b border-white/10 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 font-bold text-white shadow-lg shadow-sky-500/20">
              R
            </span>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white">
                Raeburn Consulting Group
              </h1>
              <p className="text-xs text-sky-400 font-medium uppercase tracking-wider">
                RaeburnAI Proposal Generator v1.0
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadDemoData}
            className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-500/20 transition"
          >
            ⚡ Load Demo Client Data
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="no-print mb-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-8 shadow-2xl">
          <div className="flex items-center space-x-3">
            <span className="rounded-full bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-400 border border-sky-400/20">
              Commercial Engine
            </span>
            <span className="text-xs text-slate-400">Strict Schema Validation • Contract 1.0</span>
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
            AI Proposal & Solution Generator
          </h2>
          <p className="mt-4 max-w-3xl text-slate-300 leading-relaxed">
            Convert client discovery context, annual report notes, and operational parameters into
            structured, commercially credible executive proposals, technical roadmaps, deterministic
            ROI models, and presentation outlines.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <form
            onSubmit={submit}
            className="no-print space-y-6 rounded-3xl border border-white/10 bg-slate-900/60 p-6 md:p-8 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold text-white">Client & Project Context</h3>
              <span className="text-xs text-slate-400">* Required</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200">Client Name *</label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="e.g. Northstar Advisory Group"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-slate-100 placeholder-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200">
                    Sector / Industry
                  </label>
                  <input
                    type="text"
                    value={formData.sector || ''}
                    onChange={(e) => handleInputChange('sector', e.target.value)}
                    placeholder="e.g. Management Consulting"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-slate-100 placeholder-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200">Company Size</label>
                  <input
                    type="text"
                    value={formData.companySize || ''}
                    onChange={(e) => handleInputChange('companySize', e.target.value)}
                    placeholder="e.g. 50-200 staff"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-slate-100 placeholder-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200">
                  Client Website / Service Excerpts
                </label>
                <textarea
                  rows={3}
                  value={formData.clientWebsite || ''}
                  onChange={(e) => handleInputChange('clientWebsite', e.target.value)}
                  placeholder="Paste website notes, core offerings, or positioning statements..."
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-slate-100 placeholder-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200">
                  LinkedIn & Annual Report Context
                </label>
                <textarea
                  rows={3}
                  value={formData.annualReportContext || ''}
                  onChange={(e) => handleInputChange('annualReportContext', e.target.value)}
                  placeholder="Paste annual report strategy notes, leadership priorities, or growth targets..."
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-slate-100 placeholder-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200">
                  Current Pain & Bottlenecks
                </label>
                <textarea
                  rows={3}
                  value={formData.currentPain || ''}
                  onChange={(e) => handleInputChange('currentPain', e.target.value)}
                  placeholder="What operational problem or manual work is holding the client back?"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-slate-100 placeholder-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200">
                  Desired Business Outcome
                </label>
                <textarea
                  rows={3}
                  value={formData.desiredOutcome || ''}
                  onChange={(e) => handleInputChange('desiredOutcome', e.target.value)}
                  placeholder="What measurable results must the proposal achieve?"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-slate-100 placeholder-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200">Budget Range</label>
                  <input
                    type="text"
                    value={formData.budgetRange || ''}
                    onChange={(e) => handleInputChange('budgetRange', e.target.value)}
                    placeholder="e.g. £15,000 - £40,000"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-slate-100 placeholder-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200">
                    Timeline Preference
                  </label>
                  <input
                    type="text"
                    value={formData.timelinePreference || ''}
                    onChange={(e) => handleInputChange('timelinePreference', e.target.value)}
                    placeholder="e.g. 6 weeks"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-slate-100 placeholder-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                  Deterministic ROI Calculator Inputs
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label htmlFor="roi-people" className="block text-slate-300">
                      Affected Staff Count
                    </label>
                    <input
                      id="roi-people"
                      type="number"
                      min={1}
                      value={formData.roiInputs?.people ?? 20}
                      onChange={(e) => handleRoiChange('people', Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="roi-hours-saved" className="block text-slate-300">
                      Hours Saved / Person / Wk
                    </label>
                    <input
                      id="roi-hours-saved"
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={formData.roiInputs?.hoursSavedPerPersonPerWeek ?? 3}
                      onChange={(e) =>
                        handleRoiChange('hoursSavedPerPersonPerWeek', Number(e.target.value))
                      }
                      className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="roi-hourly-cost" className="block text-slate-300">
                      Hourly Rate (£/hr)
                    </label>
                    <input
                      id="roi-hourly-cost"
                      type="number"
                      min={10}
                      value={formData.roiInputs?.hourlyCost ?? 45}
                      onChange={(e) => handleRoiChange('hourlyCost', Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="roi-investment" className="block text-slate-300">
                      Investment Benchmark (£)
                    </label>
                    <input
                      id="roi-investment"
                      type="number"
                      min={1000}
                      value={formData.roiInputs?.investment ?? 12000}
                      onChange={(e) => handleRoiChange('investment', Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 px-5 py-4 font-bold text-slate-950 shadow-lg shadow-sky-500/25 hover:from-sky-300 hover:to-indigo-400 transition disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-slate-950" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Synthesising Proposal...</span>
                </span>
              ) : (
                'Generate Executive Proposal'
              )}
            </button>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                ⚠️ {error}
              </div>
            )}
          </form>

          <section className="proposal-print-container rounded-3xl border border-white/10 bg-white p-6 md:p-8 text-slate-900 shadow-2xl min-h-[650px]">
            {!proposal ? (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-400">
                <div className="rounded-full bg-slate-100 p-4 mb-4">
                  <svg
                    className="h-8 w-8 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-slate-600">No Proposal Generated Yet</h4>
                <p className="mt-2 text-sm max-w-sm">
                  Fill in the client details on the left or click &quot;Load Demo Client Data&quot;
                  to test the AI proposal generator.
                </p>
              </div>
            ) : (
              <ProposalView
                proposal={proposal}
                clientName={formData.clientName}
                demoMode={demoMode}
                onCopy={copyToClipboard}
                onDownload={downloadJson}
                onDownloadDocx={downloadDocx}
                exportingDocx={exportingDocx}
                copied={copied}
              />
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function ProposalView({
  proposal,
  clientName,
  demoMode,
  onCopy,
  onDownload,
  onDownloadDocx,
  exportingDocx,
  copied
}: {
  proposal: ProposalOutput;
  clientName: string;
  demoMode: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onDownloadDocx: () => void;
  exportingDocx: boolean;
  copied: boolean;
}) {
  return (
    <div className="space-y-8 text-slate-900">
      {demoMode && (
        <div className="demo-warning rounded-lg border-2 border-amber-500 bg-amber-50 p-3 text-center text-sm font-black tracking-wide text-amber-900">
          DEMONSTRATION DATA — NOT FOR CLIENT USE
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-300">
              {proposal.status}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Contract Version {proposal.contractVersion}
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Commercial Client Proposal — {clientName}
          </h2>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {proposal.generationMode === 'provider-generated'
              ? 'AI-generated draft — consultant verification required'
              : 'Deterministic fallback draft — AI provider unavailable or not configured'}
          </p>
        </div>

        <div className="no-print flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCopy}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            {copied ? '✓ Copied' : '📋 Copy Text'}
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            💾 JSON
          </button>
          <button
            type="button"
            onClick={onDownloadDocx}
            disabled={exportingDocx}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60"
          >
            {exportingDocx ? 'Preparing DOCX…' : '📄 DOCX'}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-sky-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-800 transition shadow"
          >
            🖨️ Print / PDF
          </button>
        </div>
      </div>

      <Section title="1. Executive Summary" text={proposal.executiveSummary} />
      <Section title="2. Business Context & Strategic Alignment" text={proposal.businessContext} />
      <Section title="3. Current State Assessment" text={proposal.currentStateAssessment} />

      <div>
        <h3 className="text-lg font-bold text-slate-900">4. Key Challenges & Opportunities</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-red-800">
              Operational Challenges
            </h4>
            <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs text-slate-700">
              {proposal.keyOperationalChallenges.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800">
              Prioritised Opportunities
            </h4>
            <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs text-slate-700">
              {proposal.prioritisedOpportunities.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Section title="5. Core Engagement Proposal" text={proposal.proposal} />
      <Section title="6. Technical Solution & AI Architecture" text={proposal.technicalSolution} />

      <div>
        <h3 className="text-lg font-bold text-slate-900">7. Phased Implementation Roadmap</h3>
        <div className="mt-3 space-y-3">
          {proposal.roadmap.map((phase, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">{phase.phase}</span>
              </div>
              <p className="mt-1 text-xs text-slate-600">{phase.objective}</p>
              <div className="mt-3 grid gap-2 md:grid-cols-2 text-xs">
                <div>
                  <span className="font-semibold text-slate-800">Key Deliverables:</span>
                  <ul className="list-disc pl-4 text-slate-600 mt-1 space-y-0.5">
                    {phase.deliverables.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Success Metrics:</span>
                  <ul className="list-disc pl-4 text-slate-600 mt-1 space-y-0.5">
                    {phase.successMetrics.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900">8. Commercial Pricing Tiers</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {proposal.pricing.map((option, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
                  {option.name}
                </span>
                <p className="mt-2 text-2xl font-black text-slate-900">{option.priceLabel}</p>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{option.description}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">Best for:</span> {option.bestFor}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900">9. Delivery Timeline & Workstreams</h3>
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="p-3">Timeline</th>
                <th className="p-3">Workstream</th>
                <th className="p-3">Target Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {proposal.timeline.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">{item.week}</td>
                  <td className="p-3 text-slate-700">{item.workstream}</td>
                  <td className="p-3 text-slate-600">{item.outcome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-5">
        <h3 className="text-lg font-bold text-sky-950">10. Deterministic ROI & Financial Model</h3>
        <p className="mt-2 text-xs text-slate-700 leading-relaxed">
          {proposal.roiEstimate.narrative}
        </p>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="rounded-lg bg-white p-3 border border-sky-100 shadow-sm">
            <span className="block text-[10px] uppercase font-bold text-slate-500">
              Monthly Capacity Value (Low)
            </span>
            <span className="text-lg font-extrabold text-emerald-700">
              £{proposal.roiEstimate.monthlySavingsLow.toLocaleString()}
            </span>
          </div>
          <div className="rounded-lg bg-white p-3 border border-sky-100 shadow-sm">
            <span className="block text-[10px] uppercase font-bold text-slate-500">
              Monthly Capacity Value (High)
            </span>
            <span className="text-lg font-extrabold text-emerald-700">
              £{proposal.roiEstimate.monthlySavingsHigh.toLocaleString()}
            </span>
          </div>
          <div className="rounded-lg bg-white p-3 border border-sky-100 shadow-sm">
            <span className="block text-[10px] uppercase font-bold text-slate-500">
              Fastest Payback
            </span>
            <span className="text-lg font-extrabold text-sky-700">
              {proposal.roiEstimate.paybackMonthsLow} mos
            </span>
          </div>
          <div className="rounded-lg bg-white p-3 border border-sky-100 shadow-sm">
            <span className="block text-[10px] uppercase font-bold text-slate-500">
              Conservative Payback
            </span>
            <span className="text-lg font-extrabold text-sky-700">
              {proposal.roiEstimate.paybackMonthsHigh} mos
            </span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-lg bg-white p-3 border border-sky-100 shadow-sm">
            <span className="block text-[10px] uppercase font-bold text-slate-500">
              Annualised Capacity Value
            </span>
            <span className="text-sm font-extrabold text-emerald-700">
              £{proposal.roiEstimate.annualSavingsLow.toLocaleString()}–£
              {proposal.roiEstimate.annualSavingsHigh.toLocaleString()}
            </span>
          </div>
          <div className="rounded-lg bg-white p-3 border border-sky-100 shadow-sm">
            <span className="block text-[10px] uppercase font-bold text-slate-500">
              First-Year ROI Range
            </span>
            <span className="text-sm font-extrabold text-sky-700">
              {proposal.roiEstimate.firstYearRoiPercentLow}%–
              {proposal.roiEstimate.firstYearRoiPercentHigh}%
            </span>
          </div>
        </div>
        <div className="mt-3">
          <span className="text-xs font-semibold text-slate-700">Model Assumptions:</span>
          <ul className="mt-1 list-disc pl-4 text-xs text-slate-600 space-y-0.5">
            {proposal.roiEstimate.assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900">11. Risk Register & Mitigations</h3>
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="p-3">Risk Factor</th>
                <th className="p-3">Likelihood</th>
                <th className="p-3">Impact</th>
                <th className="p-3">Mitigation Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {proposal.risks.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">{item.risk}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.likelihood === 'High' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'}`}
                    >
                      {item.likelihood}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.impact === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}
                    >
                      {item.impact}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{item.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 text-xs">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            12. Governance Framework
          </h4>
          <ul className="mt-2 list-disc pl-4 text-slate-700 space-y-1">
            {proposal.governance.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            Responsible AI & Security
          </h4>
          <ul className="mt-2 list-disc pl-4 text-slate-700 space-y-1">
            {proposal.responsibleAiConsiderations.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
        <h3 className="text-sm font-bold text-indigo-950">13. Recommended Next Steps</h3>
        <ol className="mt-2 list-decimal pl-5 text-xs text-slate-700 space-y-1">
          {proposal.nextSteps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-lg font-bold text-slate-900">
          14. Executive Presentation Outline (5-Slide Pitch Deck)
        </h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-xs text-slate-700 font-medium">
          {proposal.executivePresentation.map((slide, idx) => (
            <li key={idx} className="p-2 rounded bg-slate-50 border border-slate-100">
              {slide}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-700">{text}</p>
    </div>
  );
}
