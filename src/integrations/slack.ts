import type { ScoredLead } from '../lib/types.js';
import type { CampaignAttribution } from '../attribution/attribution.js';

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function buildNightlyDigest(
  hotLeads: ScoredLead[],
  attribution: CampaignAttribution[],
): string {
  const leadLines = hotLeads
    .slice(0, 10)
    .map((l) => `• *${l.firstName} ${l.lastName}* (${l.company}) — grade ${l.grade}, score ${l.score}`)
    .join('\n');

  const campaignLines = attribution
    .slice(0, 5)
    .map((c) => `• ${c.campaignName}: ${formatCurrency(c.attributedRevenueCents)} attributed`)
    .join('\n');

  return [
    `:chart_with_upwards_trend: *LaunchPulse nightly digest*`,
    ``,
    `*New hot leads (${hotLeads.length})*`,
    leadLines || '_none today_',
    ``,
    `*Top campaigns by attributed revenue*`,
    campaignLines || '_no attribution data_',
  ].join('\n');
}

export async function postDigest(text: string): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    throw new Error('SLACK_WEBHOOK_URL is not configured');
  }
  const res = await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    throw new Error(`Slack webhook returned ${res.status}`);
  }
}
