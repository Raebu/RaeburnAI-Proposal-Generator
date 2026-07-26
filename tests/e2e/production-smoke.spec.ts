import { expect, test } from '@playwright/test';

const apiKey = process.env.PROPOSAL_API_KEY ?? 'test-proposal-api-key-at-least-32-characters';
const actor = 'reviewer@example.com';

test('health and readiness endpoints respond', async ({ request }) => {
  const health = await request.get('/api/health');
  expect(health.ok()).toBeTruthy();
  expect((await health.json()).status).toBe('ok');

  const ready = await request.get('/api/ready');
  expect(ready.ok()).toBeTruthy();
  expect((await ready.json()).ready).toBe(true);
});

test('proposal generation requires authentication', async ({ request }) => {
  const response = await request.post('/api/proposals', {
    data: {
      clientName: 'Example Ltd',
      currentPain: 'Manual proposal preparation takes too long.',
    },
  });
  expect(response.status()).toBe(401);
});

test('proposal is persisted pending approval and can be approved once', async ({ request }) => {
  const headers = { 'x-api-key': apiKey, 'x-actor': actor };
  const generated = await request.post('/api/proposals', {
    headers,
    data: {
      clientName: 'Example Ltd',
      currentPain: 'Manual proposal preparation takes too long.',
      desiredOutcome: 'Create reviewed and auditable client proposals.',
    },
  });
  expect(generated.status()).toBe(201);
  const generatedBody = await generated.json();
  expect(generatedBody.proposal.status).toBe('PENDING_APPROVAL');
  const proposalId = generatedBody.proposal.id as string;

  const retrieved = await request.get(`/api/proposals/${proposalId}`, { headers });
  expect(retrieved.ok()).toBeTruthy();
  expect((await retrieved.json()).proposal.status).toBe('PENDING_APPROVAL');

  const approved = await request.post(`/api/proposals/${proposalId}/approve`, {
    headers,
    data: { reason: 'Pricing, assumptions and scope reviewed by a consultant.' },
  });
  expect(approved.ok()).toBeTruthy();
  expect((await approved.json()).proposal.status).toBe('APPROVED');

  const repeated = await request.post(`/api/proposals/${proposalId}/approve`, {
    headers,
    data: { reason: 'Attempted duplicate approval.' },
  });
  expect(repeated.status()).toBe(409);
});
