import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType
} from 'docx';
import type { ProposalOutput } from '~/lib/types/proposal';

const navy = '172033';
const blue = '075985';
const slate = '475569';
const paleBlue = 'E0F2FE';
const paleSlate = 'F1F5F9';
const border = { style: BorderStyle.SINGLE, color: 'CBD5E1', size: 4 };

function heading(
  text: string,
  level: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1
) {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 280, after: 120 },
    keepNext: true
  });
}

function body(text: string) {
  return new Paragraph({ children: [new TextRun(text)], spacing: { after: 140, line: 320 } });
}

function bullets(items: string[]) {
  return items.map(
    (item) =>
      new Paragraph({
        children: [new TextRun(item)],
        bullet: { level: 0 },
        spacing: { after: 80 },
        indent: { left: 360, hanging: 180 }
      })
  );
}

function cell(text: string, header = false) {
  return new TableCell({
    shading: header ? { type: ShadingType.CLEAR, fill: navy } : undefined,
    margins: { top: 100, right: 120, bottom: 100, left: 120 },
    borders: { top: border, bottom: border, left: border, right: border },
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: header, color: header ? 'FFFFFF' : navy, size: 19 })]
      })
    ]
  });
}

function table(rows: string[][]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(
      (row, index) => new TableRow({ children: row.map((value) => cell(value, index === 0)) })
    )
  });
}

function pounds(value: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0
  }).format(value);
}

export function buildProposalDocument(
  proposal: ProposalOutput,
  clientName: string,
  demoMode = false
) {
  const roi = proposal.roiEstimate;
  return new Document({
    creator: 'Raeburn Consulting Group',
    title: `AI Transformation Proposal — ${clientName}`,
    description: 'Consultant-reviewable Raeburn AI transformation proposal',
    styles: {
      default: {
        document: {
          run: { font: 'Aptos', size: 22, color: navy },
          paragraph: { spacing: { after: 100 } }
        },
        heading1: {
          run: { font: 'Aptos Display', size: 32, bold: true, color: navy },
          paragraph: { spacing: { before: 300, after: 140 } }
        },
        heading2: {
          run: { font: 'Aptos Display', size: 25, bold: true, color: blue },
          paragraph: { spacing: { before: 220, after: 100 } }
        }
      }
    },
    sections: [
      {
        properties: { page: { margin: { top: 900, right: 900, bottom: 900, left: 900 } } },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Raeburn Consulting Group  •  Draft subject to human approval  •  Page ',
                    color: slate,
                    size: 17
                  }),
                  new TextRun({ children: [PageNumber.CURRENT], color: slate, size: 17 })
                ]
              })
            ]
          })
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 720, after: 200 },
            children: [
              new TextRun({
                text: 'RAEBURN CONSULTING GROUP',
                bold: true,
                color: blue,
                size: 22,
                characterSpacing: 80
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 180 },
            children: [
              new TextRun({ text: 'AI Transformation Proposal', bold: true, color: navy, size: 52 })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 420 },
            children: [new TextRun({ text: clientName, color: slate, size: 30 })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            shading: { type: ShadingType.CLEAR, fill: demoMode ? 'FEF3C7' : paleBlue },
            spacing: { before: 120, after: 120 },
            children: [
              new TextRun({
                text: demoMode
                  ? 'DEMONSTRATION DATA — NOT FOR CLIENT USE'
                  : 'DRAFT — REQUIRES RECORDED CONSULTANT APPROVAL BEFORE CLIENT DELIVERY',
                bold: true,
                color: demoMode ? '92400E' : blue,
                size: 20
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 760 },
            children: [
              new TextRun({
                text: `Contract ${proposal.contractVersion}  •  ${proposal.generationMode}`,
                color: slate,
                size: 19
              })
            ]
          }),

          heading('1. Executive summary'),
          body(proposal.executiveSummary),
          heading('2. Business context'),
          body(proposal.businessContext),
          heading('3. Current-state assessment'),
          body(proposal.currentStateAssessment),
          heading('4. Key operational challenges'),
          ...bullets(proposal.keyOperationalChallenges),
          heading('5. Prioritised AI and automation opportunities'),
          ...bullets(proposal.prioritisedOpportunities),
          heading('6. Proposed solution'),
          body(proposal.proposal),
          heading('7. Technical solution'),
          body(proposal.technicalSolution),
          heading('8. Implementation roadmap'),
          ...proposal.roadmap.flatMap((phase) => [
            heading(phase.phase, HeadingLevel.HEADING_2),
            body(phase.objective),
            new Paragraph({
              children: [new TextRun({ text: 'Deliverables', bold: true, color: blue })],
              keepNext: true
            }),
            ...bullets(phase.deliverables),
            new Paragraph({
              children: [new TextRun({ text: 'Success measures', bold: true, color: blue })],
              keepNext: true
            }),
            ...bullets(phase.successMetrics)
          ]),
          heading('9. Commercial options'),
          table([
            ['Option', 'Price', 'Scope', 'Best fit'],
            ...proposal.pricing.map((option) => [
              option.name,
              option.priceLabel,
              option.description,
              option.bestFor
            ])
          ]),
          heading('10. Timeline'),
          table([
            ['Period', 'Workstream', 'Outcome'],
            ...proposal.timeline.map((item) => [item.week, item.workstream, item.outcome])
          ]),
          heading('11. Dependencies'),
          ...bullets(proposal.dependencies),
          heading('12. ROI assumptions and estimate'),
          new Paragraph({
            shading: { type: ShadingType.CLEAR, fill: paleSlate },
            spacing: { before: 80, after: 160 },
            children: [
              new TextRun({ text: proposal.roiEstimate.narrative, bold: true, color: navy })
            ]
          }),
          ...bullets(roi.assumptions),
          table([
            ['Measure', 'Low estimate', 'High estimate'],
            [
              'Monthly capacity value',
              pounds(roi.monthlySavingsLow),
              pounds(roi.monthlySavingsHigh)
            ],
            ['Annual capacity value', pounds(roi.annualSavingsLow), pounds(roi.annualSavingsHigh)],
            ['First-year ROI', `${roi.firstYearRoiPercentLow}%`, `${roi.firstYearRoiPercentHigh}%`],
            [
              'Estimated payback',
              `${roi.paybackMonthsLow} months`,
              `${roi.paybackMonthsHigh} months`
            ]
          ]),
          body(
            'All ROI values are estimates derived from disclosed inputs. They are not guaranteed savings or revenue and must be validated during discovery.'
          ),
          heading('13. Risks and mitigations'),
          table([
            ['Risk', 'Likelihood', 'Impact', 'Mitigation'],
            ...proposal.risks.map((risk) => [
              risk.risk,
              risk.likelihood,
              risk.impact,
              risk.mitigation
            ])
          ]),
          heading('14. Governance'),
          ...bullets(proposal.governance),
          heading('15. Responsible AI considerations'),
          ...bullets(proposal.responsibleAiConsiderations),
          heading('16. Next steps'),
          ...bullets(proposal.nextSteps),
          heading('17. Executive presentation outline'),
          ...proposal.executivePresentation.map(
            (item, index) =>
              new Paragraph({
                children: [
                  new TextRun({ text: `${index + 1}. `, bold: true, color: blue }),
                  new TextRun(item)
                ],
                spacing: { after: 90 }
              })
          )
        ]
      }
    ]
  });
}

export async function proposalDocumentBlob(
  proposal: ProposalOutput,
  clientName: string,
  demoMode = false
) {
  return Packer.toBlob(buildProposalDocument(proposal, clientName, demoMode));
}
