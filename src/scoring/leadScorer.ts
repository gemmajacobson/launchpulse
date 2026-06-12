import { differenceInDays, parseISO } from 'date-fns';
import type { Activity, Lead, ScoredLead } from '../lib/types.js';

const ACTIVITY_WEIGHTS: Record<Activity['type'], number> = {
  page_view: 1,
  pricing_page_view: 8,
  demo_request: 30,
  email_open: 1,
  email_click: 3,
  email_reply: 12,
  webinar_attended: 10,
  content_download: 5,
  trial_started: 35,
};

const TARGET_INDUSTRIES = new Set([
  'software',
  'fintech',
  'healthcare',
  'ecommerce',
  'cybersecurity',
]);

const SENIORITY_KEYWORDS = ['vp', 'head', 'director', 'chief', 'founder', 'lead'];

/** Demographic fit: who the lead is. Max 40 points. */
export function fitScore(lead: Lead): number {
  let score = 0;

  if (TARGET_INDUSTRIES.has(lead.industry.toLowerCase())) score += 12;

  if (lead.employeeCount >= 50 && lead.employeeCount <= 2000) score += 14;
  else if (lead.employeeCount > 2000) score += 6;

  const title = lead.title.toLowerCase();
  if (SENIORITY_KEYWORDS.some((k) => title.includes(k))) score += 14;

  return Math.min(score, 40);
}

/** Behavioural engagement: what the lead has done. Max 60 points, recency-decayed. */
export function engagementScore(activities: Activity[], asOf: Date): number {
  const raw = activities.reduce((total, activity) => {
    const ageDays = differenceInDays(asOf, parseISO(activity.occurredAt));
    if (ageDays < 0 || ageDays > 90) return total;
    const decay = ageDays <= 14 ? 1 : ageDays <= 45 ? 0.6 : 0.3;
    return total + ACTIVITY_WEIGHTS[activity.type] * decay;
  }, 0);

  return Math.min(Math.round(raw), 60);
}

function grade(score: number): ScoredLead['grade'] {
  if (score >= 75) return 'A';
  if (score >= 50) return 'B';
  if (score >= 25) return 'C';
  return 'D';
}

function signals(lead: Lead, activities: Activity[]): string[] {
  const out: string[] = [];
  if (activities.some((a) => a.type === 'demo_request')) out.push('requested_demo');
  if (activities.some((a) => a.type === 'trial_started')) out.push('in_trial');
  if (activities.some((a) => a.type === 'pricing_page_view')) out.push('viewed_pricing');
  if (TARGET_INDUSTRIES.has(lead.industry.toLowerCase())) out.push('target_industry');
  return out;
}

export function scoreLead(lead: Lead, activities: Activity[], asOf = new Date()): ScoredLead {
  const own = activities.filter((a) => a.leadId === lead.id);
  const score = fitScore(lead) + engagementScore(own, asOf);

  return {
    ...lead,
    score,
    grade: grade(score),
    scoredAt: asOf.toISOString(),
    signals: signals(lead, own),
  };
}

export function scoreBatch(leads: Lead[], activities: Activity[], asOf = new Date()): ScoredLead[] {
  return leads
    .map((lead) => scoreLead(lead, activities, asOf))
    .sort((a, b) => b.score - a.score);
}
