import { describe, expect, it } from 'vitest';
import { routeToSequence, scheduleSequence, suppressRecentRepliers } from '../src/sequencing/sequencer.js';
import type { ScoredLead, Sequence } from '../src/lib/types.js';

const hotLead: ScoredLead = {
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
  lastActivityAt: '2026-06-01T00:00:00Z',
  source: 'organic',
  score: 82,
  grade: 'A',
  scoredAt: '2026-06-10T00:00:00Z',
  signals: ['requested_demo'],
};

const sequences: Sequence[] = [
  {
    id: 'seq-hi',
    name: 'High intent — 5 step',
    audience: 'high-intent',
    active: true,
    steps: [
      { dayOffset: 0, channel: 'email', template: 'hi-intro' },
      { dayOffset: 2, channel: 'linkedin', template: 'hi-connect' },
      { dayOffset: 4, channel: 'call', template: 'hi-call' },
    ],
  },
  {
    id: 'seq-nurture',
    name: 'Nurture — monthly',
    audience: 'nurture',
    active: true,
    steps: [{ dayOffset: 0, channel: 'email', template: 'nurture-1' }],
  },
];

describe('routeToSequence', () => {
  it('routes A-grade leads to the high-intent sequence', () => {
    expect(routeToSequence(hotLead, sequences)?.id).toBe('seq-hi');
  });

  it('routes C-grade leads to nurture', () => {
    const cool = { ...hotLead, grade: 'C' as const };
    expect(routeToSequence(cool, sequences)?.id).toBe('seq-nurture');
  });

  it('returns null when no sequences are active', () => {
    const inactive = sequences.map((s) => ({ ...s, active: false }));
    expect(routeToSequence(hotLead, inactive)).toBeNull();
  });
});

describe('scheduleSequence', () => {
  it('offsets each step from the start date', () => {
    const touches = scheduleSequence(hotLead, sequences[0], new Date('2026-06-10T09:00:00Z'));
    expect(touches).toHaveLength(3);
    expect(touches[0].sendAt.startsWith('2026-06-10')).toBe(true);
    expect(touches[2].sendAt.startsWith('2026-06-14')).toBe(true);
  });
});

describe('suppressRecentRepliers', () => {
  it('drops touches inside the reply cooldown window', () => {
    const touches = scheduleSequence(hotLead, sequences[0], new Date('2026-06-10T09:00:00Z'));
    const lastReply = new Map([['lead-1', '2026-06-09T12:00:00Z']]);
    const remaining = suppressRecentRepliers(touches, lastReply, 5);
    expect(remaining).toHaveLength(0);
  });

  it('keeps touches for leads who never replied', () => {
    const touches = scheduleSequence(hotLead, sequences[0], new Date('2026-06-10T09:00:00Z'));
    expect(suppressRecentRepliers(touches, new Map())).toHaveLength(3);
  });
});
