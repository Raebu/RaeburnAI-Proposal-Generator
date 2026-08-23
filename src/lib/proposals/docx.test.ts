import { describe, expect, it } from 'vitest';
import { fallbackProposal } from '~/lib/ai/generateProposal';
import { proposalDocumentBlob } from './docx';

describe('DOCX proposal export', () => {
  it('creates a real Office Open XML package from validated proposal data', async () => {
    const proposal = fallbackProposal({ clientName: 'Export Test Ltd', sector: 'Recruitment' });
    const blob = await proposalDocumentBlob(proposal, 'Export Test Ltd');
    const bytes = new Uint8Array(await blob.arrayBuffer());
    expect(blob.type).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    expect(String.fromCharCode(...bytes.slice(0, 2))).toBe('PK');
    expect(bytes.byteLength).toBeGreaterThan(5_000);
  });
});
