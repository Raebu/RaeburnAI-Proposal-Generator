'use client';

import { FormEvent, useState } from 'react';
import type { ProposalOutput } from '~/lib/types/proposal';

const fields = [
  ['clientName', 'Client name', 'Acme Consulting Ltd'],
  ['clientWebsite', 'Client website/context', 'Paste website notes, service pages or positioning...'],
  ['linkedinContext', 'LinkedIn/company context', 'Paste LinkedIn company profile, leadership notes or recent posts...'],
  ['annualReportContext', 'Annual report/context', 'Paste annual report excerpts, strategy notes or financial priorities...'],
  ['currentPain', 'Current pain', 'What problem does the client need solved?'],
  ['desiredOutcome', 'Desired outcome', 'What result should the proposal deliver?'],
  ['budgetRange', 'Budget range', 'Example: £10k-£50k'],
  ['timelinePreference', 'Timeline preference', 'Example: 6 weeks'],
  ['consultantPositioning', 'Your positioning', 'Example: AI automation consultant for recruitment firms']
] as const;

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<ProposalOutput | null>(null);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const response = await fetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    setLoading(false);
    if (!response.ok) return setError(data.error || 'Something went wrong');
    setProposal(data.proposal);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">RaeburnAI</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">Proposal Generator for Consultants</h1>
          <p className="mt-5 max-w-3xl text-lg text-slate-300">
            Convert client websites, LinkedIn context and annual report notes into executive proposals, technical roadmaps, pricing, timelines and ROI estimates.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">Client context</h2>
            <div className="mt-6 space-y-4">
              {fields.map(([name, label, placeholder]) => (
                <label key={name} className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
                  {name === 'clientName' || name === 'budgetRange' || name === 'timelinePreference' ? (
                    <input name={name} required={name === 'clientName'} placeholder={placeholder} className="w-full rounded-xl border border-white/10 bg-white p-3 text-slate-950" />
                  ) : (
                    <textarea name={name} placeholder={placeholder} rows={4} className="w-full rounded-xl border border-white/10 bg-white p-3 text-slate-950" />
                  )}
                </label>
              ))}
            </div>
            <button disabled={loading} className="mt-6 w-full rounded-xl bg-sky-400 px-5 py-3 font-bold text-slate-950 hover:bg-sky-300 disabled:opacity-60">
              {loading ? 'Generating...' : 'Generate proposal'}
            </button>
            {error && <p className="mt-4 rounded-xl bg-red-500/20 p-3 text-red-100">{error}</p>}
          </form>

          <section className="rounded-3xl border border-white/10 bg-white p-6 text-slate-950">
            {!proposal ? (
              <div className="flex min-h-[600px] items-center justify-center rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                Your proposal output will appear here.
              </div>
            ) : (
              <ProposalView proposal={proposal} />
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function ProposalView({ proposal }: { proposal: ProposalOutput }) {
  return (
    <div className="space-y-8">
      <OutputSection title="Executive summary" body={proposal.executiveSummary} />
      <OutputSection title="Proposal" body={proposal.proposal} />
      <OutputSection title="Technical solution" body={proposal.technicalSolution} />
      <div>
        <h3 className="text-xl font-bold">Roadmap</h3>
        <div className="mt-3 space-y-3">
          {proposal.roadmap.map((phase) => (
            <div key={phase.phase} className="rounded-xl border border-slate-200 p-4">
              <p className="font-semibold">{phase.phase}</p>
              <p className="text-slate-700">{phase.objective}</p>
              <p className="mt-2 text-sm text-slate-600">Deliverables: {phase.deliverables.join(', ')}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold">Pricing</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {proposal.pricing.map((option) => (
            <div key={option.name} className="rounded-xl border border-slate-200 p-4">
              <p className="font-semibold">{option.name}</p>
              <p className="mt-2 text-2xl font-bold">£{option.price.toLocaleString()}</p>
              <p className="mt-2 text-sm text-slate-600">{option.description}</p>
            </div>
          ))}
        </div>
      </div>
      <OutputSection title="ROI estimate" body={proposal.roiEstimate.narrative} />
      <div>
        <h3 className="text-xl font-bold">Executive presentation</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-700">
          {proposal.executivePresentation.map((slide) => <li key={slide}>{slide}</li>)}
        </ol>
      </div>
    </div>
  );
}

function OutputSection({ title, body }: { title: string; body: string }) {
  return (
    <section>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-2 whitespace-pre-line leading-7 text-slate-700">{body}</p>
    </section>
  );
}
