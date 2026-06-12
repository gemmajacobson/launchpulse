import { describe, expect, it } from 'vitest';
import { createServer } from '../src/api/server.js';

async function request(app: ReturnType<typeof createServer>, path: string, body?: unknown) {
  const server = app.listen(0);
  const port = (server.address() as { port: number }).port;
  try {
    const res = await fetch(`http://127.0.0.1:${port}${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: res.status, json: await res.json() };
  } finally {
    server.close();
  }
}

describe('API', () => {
  it('reports healthy', async () => {
    const { status, json } = await request(createServer(), '/healthz');
    expect(status).toBe(200);
    expect(json.status).toBe('ok');
  });

  it('rejects malformed scoring payloads', async () => {
    const { status } = await request(createServer(), '/v1/score', { nope: true });
    expect(status).toBe(400);
  });

  it('scores a valid lead batch', async () => {
    const lead = {
      id: 'lead-1',
      email: 'maya@acme.io',
      firstName: 'Maya',
      lastName: 'Chen',
      company: 'Acme',
      title: 'VP of Engineering',
      industry: 'software',
      employeeCount: 400,
      country: 'US',
      createdAt: '2026-05-01T00:00:00Z',
      lastActivityAt: null,
      source: 'organic',
    };
    const { status, json } = await request(createServer(), '/v1/score', {
      leads: [lead],
      activities: [],
    });
    expect(status).toBe(200);
    expect(json.results).toHaveLength(1);
    expect(json.results[0].grade).toBeDefined();
  });
});
