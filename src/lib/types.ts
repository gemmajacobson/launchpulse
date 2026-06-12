export interface Lead {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  industry: string;
  employeeCount: number;
  country: string;
  createdAt: string;
  lastActivityAt: string | null;
  source: LeadSource;
}

export type LeadSource =
  | 'organic'
  | 'paid_search'
  | 'paid_social'
  | 'outbound'
  | 'referral'
  | 'event'
  | 'webinar'
  | 'content_download';

export interface Activity {
  leadId: string;
  type: ActivityType;
  occurredAt: string;
  metadata?: Record<string, string>;
}

export type ActivityType =
  | 'page_view'
  | 'pricing_page_view'
  | 'demo_request'
  | 'email_open'
  | 'email_click'
  | 'email_reply'
  | 'webinar_attended'
  | 'content_download'
  | 'trial_started';

export interface ScoredLead extends Lead {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  scoredAt: string;
  signals: string[];
}

export interface Campaign {
  id: string;
  name: string;
  channel: LeadSource;
  startDate: string;
  endDate: string | null;
  budgetCents: number;
}

export interface Touchpoint {
  leadId: string;
  campaignId: string;
  occurredAt: string;
}

export interface Opportunity {
  id: string;
  leadId: string;
  amountCents: number;
  stage: 'discovery' | 'evaluation' | 'proposal' | 'closed_won' | 'closed_lost';
  createdAt: string;
  closedAt: string | null;
}

export interface SequenceStep {
  dayOffset: number;
  channel: 'email' | 'linkedin' | 'call';
  template: string;
}

export interface Sequence {
  id: string;
  name: string;
  audience: string;
  steps: SequenceStep[];
  active: boolean;
}
