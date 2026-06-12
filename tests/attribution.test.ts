import { describe, expect, it } from 'vitest';
import { attributeRevenue, creditSplit } from '../src/attribution/attribution.js';
import type { Campaign, Opportunity, Touchpoint } from '../src/lib/types.js';

const campaigns: Campaign[] = [
  { id: 'c-webinar', name: 'Q2 Webinar Series', channel: 'webinar', startDate: '2026-04-01', endDate: null, budgetCents: 500_000 },
  { id: 'c-paid', name: 'Paid Search — Brand', channel: 'paid_search', startDate: '2026-01-01', endDate: null, budgetCents: 2_000_000 },
  { id: 'c-event', name: 'SaaStr Booth', channel: 'event', startDate: '2026-05-10', endDate: '2026-05-12', budgetCents: 1_500_000 },
];

const touchpoints: Touchpoint[] = [
  { leadId: 'lead-1', campaignId: 'c-paid', occurredAt: '2026-05-01T00:00:00Z' },
  { leadId: 'lead-1', campaignId: 'c-webinar', occurredAt: '2026-05-15T00:00:00Z' },
  { leadId: 'lead-1', campaignId: 'c-event', occurredAt: '2026-05-20T00:00:00Z' },
];

const wonOpp: Opportunity = {
  id: 'opp-1',
  leadId: 'lead-1',
  amountCents: 1_000_000,
  stage: 'closed_won',
  createdAt: '2026-05-21T00:00:00Z',
  closedAt: '2026-06-01T00:00:00Z',
};

describe('creditSplit', () => {
  it('gives everything to the first touch under first_touch', () => {
    const credit = creditSplit(touchpoints, 1_000_000, 'first_touch');
    expect(credit.get('c-paid')).toBe(1_000_000);
    expect(credit.size).toBe(1);
  });

  it('gives everything to the last touch under last_touch', () => {
    const credit = creditSplit(touchpoints, 1_000_000, 'last_touch');
    expect(credit.get('c-event')).toBe(1_000_000);
  });

  it('splits evenly under linear', () => {
    const credit = creditSplit(touchpoints, 900_000, 'linear');
    expect(credit.get('c-paid')).toBe(300_000);
    expect(credit.get('c-webinar')).toBe(300_000);
    expect(credit.get('c-event')).toBe(300_000);
  });

  it('gives 40/20/40 under u_shaped', () => {
    const credit = creditSplit(touchpoints, 1_000_000, 'u_shaped');
    expect(credit.get('c-paid')).toBe(400_000);
    expect(credit.get('c-event')).toBe(400_000);
    expect(credit.get('c-webinar')).toBe(200_000);
  });

  it('handles a single touch under u_shaped', () => {
    const credit = creditSplit([touchpoints[0]], 1_000_000, 'u_shaped');
    expect(credit.get('c-paid')).toBe(1_000_000);
  });

  it('returns empty credit with no touches', () => {
    expect(creditSplit([], 1_000_000, 'linear').size).toBe(0);
  });
});

describe('attributeRevenue', () => {
  it('only counts closed_won opportunities', () => {
    const lost: Opportunity = { ...wonOpp, id: 'opp-2', stage: 'closed_lost' };
    const report = attributeRevenue(campaigns, [lost], touchpoints);
    expect(report.every((c) => c.attributedRevenueCents === 0)).toBe(true);
  });

  it('computes ROI against campaign budget', () => {
    const report = attributeRevenue(campaigns, [wonOpp], touchpoints, 'first_touch');
    const paid = report.find((c) => c.campaignId === 'c-paid')!;
    expect(paid.attributedRevenueCents).toBe(1_000_000);
    expect(paid.roi).toBe(-0.5);
  });

  it('sorts campaigns by attributed revenue', () => {
    const report = attributeRevenue(campaigns, [wonOpp], touchpoints, 'u_shaped');
    expect(report[0].attributedRevenueCents).toBeGreaterThanOrEqual(
      report[report.length - 1].attributedRevenueCents,
    );
  });
});
