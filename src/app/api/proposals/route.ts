import { NextResponse } from 'next/server';
import { generateProposal } from '~/lib/ai/generateProposal';
import { proposalInputSchema } from '~/lib/proposals/schema';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = proposalInputSchema.parse(json);
    const proposal = await generateProposal(input);
    return NextResponse.json({ proposal });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to generate proposal' },
      { status: 400 }
    );
  }
}
