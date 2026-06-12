/**
 * FICTIONAL SAMPLE DATA — for demos and local development only.
 *
 * Every person, company, email address and event in this file is invented.
 * Any resemblance to real people or companies is coincidental. All email
 * addresses use the reserved example.com / example.org domains (RFC 2606),
 * which can never belong to real mailboxes.
 */
import type { Activity, Lead } from '../src/lib/types.js';

export const fixtureLeads: Lead[] = [
  {
    id: 'demo-lead-1001',
    email: 'maya.chen@northwind-labs.example.com',
    firstName: 'Maya',
    lastName: 'Chen',
    company: 'Northwind Labs (fictional)',
    title: 'VP of Engineering',
    industry: 'software',
    employeeCount: 420,
    country: 'US',
    createdAt: '2026-05-02T09:15:00Z',
    lastActivityAt: '2026-06-09T16:40:00Z',
    source: 'webinar',
  },
  {
    id: 'demo-lead-1002',
    email: 'jide.okafor@meridianpay.example.com',
    firstName: 'Jide',
    lastName: 'Okafor',
    company: 'MeridianPay (fictional)',
    title: 'Head of Growth',
    industry: 'fintech',
    employeeCount: 180,
    country: 'GB',
    createdAt: '2026-05-20T11:00:00Z',
    lastActivityAt: '2026-06-08T10:05:00Z',
    source: 'paid_search',
  },
  {
    id: 'demo-lead-1003',
    email: 'sofia.lindqvist@brightcart.example.org',
    firstName: 'Sofia',
    lastName: 'Lindqvist',
    company: 'BrightCart (fictional)',
    title: 'Marketing Manager',
    industry: 'ecommerce',
    employeeCount: 64,
    country: 'SE',
    createdAt: '2026-04-12T08:30:00Z',
    lastActivityAt: '2026-05-30T14:12:00Z',
    source: 'content_download',
  },
  {
    id: 'demo-lead-1004',
    email: 'priya.raman@solostack.example.org',
    firstName: 'Priya',
    lastName: 'Raman',
    company: 'SoloStack (fictional)',
    title: 'Founder',
    industry: 'software',
    employeeCount: 3,
    country: 'IN',
    createdAt: '2026-06-01T19:45:00Z',
    lastActivityAt: null,
    source: 'organic',
  },
];

export const fixtureActivities: Activity[] = [
  { leadId: 'demo-lead-1001', type: 'webinar_attended', occurredAt: '2026-06-03T17:00:00Z' },
  { leadId: 'demo-lead-1001', type: 'pricing_page_view', occurredAt: '2026-06-08T09:22:00Z' },
  { leadId: 'demo-lead-1001', type: 'demo_request', occurredAt: '2026-06-09T16:40:00Z' },
  { leadId: 'demo-lead-1002', type: 'email_click', occurredAt: '2026-06-05T08:00:00Z' },
  { leadId: 'demo-lead-1002', type: 'pricing_page_view', occurredAt: '2026-06-08T10:05:00Z' },
  { leadId: 'demo-lead-1003', type: 'content_download', occurredAt: '2026-05-28T13:00:00Z' },
  { leadId: 'demo-lead-1003', type: 'email_open', occurredAt: '2026-05-30T14:12:00Z' },
];
