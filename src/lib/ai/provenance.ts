import { createHash } from 'node:crypto';
import type { ProposalInput } from '~/lib/types/proposal';

export type SourceManifestItem = {
  source: string;
  present: boolean;
  bytes: number;
  sha256?: string;
};

function manifestItem(source: string, value?: string): SourceManifestItem {
  const text = value ?? '';
  if (!text) return { source, present: false, bytes: 0 };
  return {
    source,
    present: true,
    bytes: Buffer.byteLength(text, 'utf8'),
    sha256: createHash('sha256').update(text, 'utf8').digest('hex')
  };
}

export function buildSourceManifest(input: ProposalInput): SourceManifestItem[] {
  return [
    manifestItem('clientWebsite', input.clientWebsite),
    manifestItem('linkedinContext', input.linkedinContext),
    manifestItem('annualReportContext', input.annualReportContext),
    manifestItem('currentPain', input.currentPain),
    manifestItem('desiredOutcome', input.desiredOutcome),
    manifestItem('budgetRange', input.budgetRange),
    manifestItem('timelinePreference', input.timelinePreference),
    manifestItem('consultantPositioning', input.consultantPositioning)
  ];
}
