import { describe, expect, it } from 'vitest';
import { engagementScore, fitScore, scoreBatch, scoreLead } from '../src/scoring/leadScorer.js';
import type { Activity, Lead } from '../src/lib/types.js';

const baseLead: Lead = {
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
};

const asOf = new Date('2026-06-10T12:00:00Z');

describe('fitScore', () => {
  it('awards full fit for target industry, mid-market size and senior title', () => {
    expect(fitScore(baseLead)).toBe(40);
  });

  it('gives partial credit to enterprise-sized companies', () => {
    const enterprise = { ...baseLead, employeeCount: 10_000 };
    expect(fitScore(enterprise)).toBe(32);
  });

  it('scores a poor-fit lead low', () => {
    const poor: Lead = {
      ...baseLead,
      industry: 'agriculture',
      employeeCount: 3,
      title: 'Student',
    };
    expect(fitScore(poor)).toBe(0);
  });
});

describe('engagementScore', () => {
  it('weights recent high-intent activity heavily', () => {
    const activities: Activity[] = [
      { leadId: 'lead-1', type: 'demo_request', occurredAt: '2026-06-08T10:00:00Z' },
      { leadId: 'lead-1', type: 'pricing_page_view', occurredAt: '2026-06-09T10:00:00Z' },
    ];
    expect(engagementScore(activities, asOf)).toBe(38);
  });

  it('decays activity older than two weeks', () => {
    const recent: Activity[] = [
      { leadId: 'lead-1', type: 'webinar_attended', occurredAt: '2026-06-05T10:00:00Z' },
    ];
    const stale: Activity[] = [
      { leadId: 'lead-1', type: 'webinar_attended', occurredAt: '2026-04-20T10:00:00Z' },
    ];
    expect(engagementScore(recent, asOf)).toBeGreaterThan(engagementScore(stale, asOf));
  });

  it('ignores activity older than 90 days', () => {
    const ancient: Activity[] = [
      { leadId: 'lead-1', type: 'trial_started', occurredAt: '2025-12-01T10:00:00Z' },
    ];
    expect(engagementScore(ancient, asOf)).toBe(0);
  });

  it('caps at 60', () => {
    const flood: Activity[] = Array.from({ length: 10 }, () => ({
      leadId: 'lead-1',
      type: 'trial_started' as const,
      occurredAt: '2026-06-09T10:00:00Z',
    }));
    expect(engagementScore(flood, asOf)).toBe(60);
  });
});

describe('scoreLead', () => {
  it('grades a hot lead as A and surfaces signals', () => {
    const activities: Activity[] = [
      { leadId: 'lead-1', type: 'demo_request', occurredAt: '2026-06-08T10:00:00Z' },
      { leadId: 'lead-1', type: 'pricing_page_view', occurredAt: '2026-06-09T10:00:00Z' },
    ];
    const scored = scoreLead(baseLead, activities, asOf);
    expect(scored.grade).toBe('A');
    expect(scored.signals).toContain('requested_demo');
    expect(scored.signals).toContain('viewed_pricing');
  });

  it('only counts the lead own activity', () => {
    const someoneElses: Activity[] = [
      { leadId: 'other-lead', type: 'trial_started', occurredAt: '2026-06-09T10:00:00Z' },
    ];
    const scored = scoreLead(baseLead, someoneElses, asOf);
    expect(scored.score).toBe(fitScore(baseLead));
  });
});

describe('scoreBatch', () => {
  it('returns leads sorted by score descending', () => {
    const cold: Lead = { ...baseLead, id: 'lead-2', title: 'Intern', industry: 'retail', employeeCount: 5 };
    const result = scoreBatch([cold, baseLead], [], asOf);
    expect(result[0].id).toBe('lead-1');
    expect(result[1].id).toBe('lead-2');
  });
});
