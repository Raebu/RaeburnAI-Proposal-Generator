import { Document, HeadingLevel, Packer, Paragraph } from 'docx';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import pptxgen from 'pptxgenjs';
import type { ProposalRecord } from '~/lib/proposals/store';

function lines(record: ProposalRecord) {
  const latest = record.versions.at(-1);
  if (!latest) throw new Error('Proposal has no versions');
  const out = latest.output;
  return [
    record.clientName,
    `Proposal version ${latest.version}`,
    '',
    'Executive summary',
    out.executiveSummary,
    '',
    'Proposal',
    out.proposal,
    '',
    'Technical solution',
    out.technicalSolution,
    '',
    'Roadmap',
    ...out.roadmap.flatMap((phase) => [`${phase.phase}: ${phase.objective}`, ...phase.deliverables.map((item) => `• ${item}`)]),
    '',
    'Pricing',
    ...out.pricing.map((item) => `${item.name}: £${item.price.toLocaleString('en-GB')} — ${item.description}`),
    '',
    'ROI',
    out.roiEstimate.narrative,
    '',
    'Risks',
    ...out.risks.map((risk) => `${risk.risk} (${risk.likelihood}/${risk.impact}) — ${risk.mitigation}`)
  ];
}

export async function exportPdf(record: ProposalRecord) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([595.28, 841.89]);
  let y = 800;
  for (const raw of lines(record)) {
    const isHeading = ['Executive summary', 'Proposal', 'Technical solution', 'Roadmap', 'Pricing', 'ROI', 'Risks'].includes(raw);
    const chunks = raw.match(/.{1,92}(?:\s|$)/g) || [raw];
    for (const chunk of chunks) {
      if (y < 55) {
        page = pdf.addPage([595.28, 841.89]);
        y = 800;
      }
      page.drawText(chunk.trim(), { x: 45, y, size: isHeading ? 14 : 10, font: isHeading ? bold : font, maxWidth: 505 });
      y -= isHeading ? 22 : 14;
    }
    if (!raw) y -= 5;
  }
  return Buffer.from(await pdf.save());
}

export async function exportDocx(record: ProposalRecord) {
  const content = lines(record);
  const headingNames = new Set(['Executive summary', 'Proposal', 'Technical solution', 'Roadmap', 'Pricing', 'ROI', 'Risks']);
  const doc = new Document({
    sections: [
      {
        children: content.map((line, index) =>
          new Paragraph({
            text: line,
            heading: index === 0 ? HeadingLevel.TITLE : headingNames.has(line) ? HeadingLevel.HEADING_1 : undefined
          })
        )
      }
    ]
  });
  return Buffer.from(await Packer.toBuffer(doc));
}

export async function exportPptx(record: ProposalRecord) {
  const latest = record.versions.at(-1);
  if (!latest) throw new Error('Proposal has no versions');
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'RaeburnAI Proposal Generator';
  pptx.subject = `Proposal for ${record.clientName}`;
  const title = pptx.addSlide();
  title.addText(record.clientName, { x: 0.7, y: 1.8, w: 12, h: 0.8, fontSize: 30, bold: true });
  title.addText(`Approved proposal · version ${latest.version}`, { x: 0.7, y: 2.8, w: 12, h: 0.5, fontSize: 16 });

  const sections: Array<[string, string]> = [
    ['Executive summary', latest.output.executiveSummary],
    ['Recommended solution', latest.output.technicalSolution],
    ['Commercial proposal', latest.output.proposal],
    ['ROI', latest.output.roiEstimate.narrative]
  ];
  for (const [heading, text] of sections) {
    const slide = pptx.addSlide();
    slide.addText(heading, { x: 0.6, y: 0.5, w: 12, h: 0.6, fontSize: 24, bold: true });
    slide.addText(text, { x: 0.7, y: 1.5, w: 11.8, h: 5.2, fontSize: 16, breakLine: false, valign: 'top' });
  }
  const data = await pptx.write({ outputType: 'nodebuffer' });
  return Buffer.from(data as Buffer);
}
