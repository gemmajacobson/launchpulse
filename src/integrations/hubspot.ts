import { z } from 'zod';
import type { Lead } from '../lib/types.js';

const HUBSPOT_BASE = process.env.HUBSPOT_BASE_URL ?? 'https://api.hubapi.com';

const hubspotContactSchema = z.object({
  id: z.string(),
  properties: z.object({
    email: z.string().email(),
    firstname: z.string().default(''),
    lastname: z.string().default(''),
    company: z.string().default(''),
    jobtitle: z.string().default(''),
    industry: z.string().default('unknown'),
    numberofemployees: z.coerce.number().default(0),
    country: z.string().default('unknown'),
    createdate: z.string(),
    lastmodifieddate: z.string().nullable().default(null),
    hs_analytics_source: z.string().default('organic'),
  }),
});

export type HubspotContact = z.infer<typeof hubspotContactSchema>;

const SOURCE_MAP: Record<string, Lead['source']> = {
  ORGANIC_SEARCH: 'organic',
  PAID_SEARCH: 'paid_search',
  PAID_SOCIAL: 'paid_social',
  OFFLINE: 'outbound',
  REFERRALS: 'referral',
};

export function toLead(contact: HubspotContact): Lead {
  const p = contact.properties;
  return {
    id: `hs-${contact.id}`,
    email: p.email,
    firstName: p.firstname,
    lastName: p.lastname,
    company: p.company,
    title: p.jobtitle,
    industry: p.industry,
    employeeCount: p.numberofemployees,
    country: p.country,
    createdAt: p.createdate,
    lastActivityAt: p.lastmodifieddate,
    source: SOURCE_MAP[p.hs_analytics_source] ?? 'organic',
  };
}

export async function fetchContactPage(
  apiKey: string,
  after?: string,
): Promise<{ leads: Lead[]; next?: string }> {
  const url = new URL('/crm/v3/objects/contacts', HUBSPOT_BASE);
  url.searchParams.set('limit', '100');
  if (after) url.searchParams.set('after', after);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    throw new Error(`HubSpot contacts request failed: ${res.status}`);
  }

  const body = (await res.json()) as {
    results: unknown[];
    paging?: { next?: { after: string } };
  };

  return {
    leads: body.results.map((r) => toLead(hubspotContactSchema.parse(r))),
    next: body.paging?.next?.after,
  };
}
