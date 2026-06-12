import { parseISO } from 'date-fns';
import type { Campaign, Opportunity, Touchpoint } from '../lib/types.js';

export type AttributionModel = 'first_touch' | 'last_touch' | 'linear' | 'u_shaped';

export interface CampaignAttribution {
  campaignId: string;
  campaignName: string;
  attributedRevenueCents: number;
  touchpoints: number;
  roi: number | null;
}

function touchesForLead(touchpoints: Touchpoint[], leadId: string): Touchpoint[] {
  return touchpoints
    .filter((t) => t.leadId === leadId)
    .sort((a, b) => parseISO(a.occurredAt).getTime() - parseISO(b.occurredAt).getTime());
}

/** Split one opportunity's revenue across its touchpoints under the given model. */
export function creditSplit(
  touches: Touchpoint[],
  amountCents: number,
  model: AttributionModel,
): Map<string, number> {
  const credit = new Map<string, number>();
  if (touches.length === 0) return credit;

  const add = (campaignId: string, cents: number) => {
    credit.set(campaignId, (credit.get(campaignId) ?? 0) + cents);
  };

  switch (model) {
    case 'first_touch':
      add(touches[0].campaignId, amountCents);
      break;
    case 'last_touch':
      add(touches[touches.length - 1].campaignId, amountCents);
      break;
    case 'linear': {
      const share = Math.floor(amountCents / touches.length);
      touches.forEach((t) => add(t.campaignId, share));
      break;
    }
    case 'u_shaped': {
      if (touches.length === 1) {
        add(touches[0].campaignId, amountCents);
        break;
      }
      const endShare = Math.floor(amountCents * 0.4);
      add(touches[0].campaignId, endShare);
      add(touches[touches.length - 1].campaignId, endShare);
      const middle = touches.slice(1, -1);
      if (middle.length > 0) {
        const middleShare = Math.floor((amountCents - endShare * 2) / middle.length);
        middle.forEach((t) => add(t.campaignId, middleShare));
      }
      break;
    }
  }

  return credit;
}

export function attributeRevenue(
  campaigns: Campaign[],
  opportunities: Opportunity[],
  touchpoints: Touchpoint[],
  model: AttributionModel = 'u_shaped',
): CampaignAttribution[] {
  const totals = new Map<string, { revenue: number; touches: number }>();
  for (const campaign of campaigns) {
    totals.set(campaign.id, {
      revenue: 0,
      touches: touchpoints.filter((t) => t.campaignId === campaign.id).length,
    });
  }

  const won = opportunities.filter((o) => o.stage === 'closed_won');
  for (const opp of won) {
    const touches = touchesForLead(touchpoints, opp.leadId);
    for (const [campaignId, cents] of creditSplit(touches, opp.amountCents, model)) {
      const entry = totals.get(campaignId);
      if (entry) entry.revenue += cents;
    }
  }

  return campaigns
    .map((campaign) => {
      const entry = totals.get(campaign.id)!;
      return {
        campaignId: campaign.id,
        campaignName: campaign.name,
        attributedRevenueCents: entry.revenue,
        touchpoints: entry.touches,
        roi:
          campaign.budgetCents > 0
            ? Number(((entry.revenue - campaign.budgetCents) / campaign.budgetCents).toFixed(2))
            : null,
      };
    })
    .sort((a, b) => b.attributedRevenueCents - a.attributedRevenueCents);
}
