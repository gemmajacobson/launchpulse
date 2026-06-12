import express from 'express';
import pino from 'pino';
import { z } from 'zod';
import { scoreBatch } from '../scoring/leadScorer.js';
import { attributeRevenue } from '../attribution/attribution.js';
import type { Activity, Campaign, Lead, Opportunity, Touchpoint } from '../lib/types.js';

const logger = pino({ name: 'launchpulse-api' });

const scoreRequestSchema = z.object({
  leads: z.array(z.unknown()),
  activities: z.array(z.unknown()).default([]),
});

const attributionRequestSchema = z.object({
  campaigns: z.array(z.unknown()),
  opportunities: z.array(z.unknown()),
  touchpoints: z.array(z.unknown()),
  model: z.enum(['first_touch', 'last_touch', 'linear', 'u_shaped']).default('u_shaped'),
});

export function createServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', version: process.env.APP_VERSION ?? 'dev' });
  });

  app.post('/v1/score', (req, res) => {
    const parsed = scoreRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const scored = scoreBatch(
      parsed.data.leads as Lead[],
      parsed.data.activities as Activity[],
    );
    logger.info({ count: scored.length }, 'scored lead batch');
    res.json({ results: scored });
  });

  app.post('/v1/attribution', (req, res) => {
    const parsed = attributionRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const report = attributeRevenue(
      parsed.data.campaigns as Campaign[],
      parsed.data.opportunities as Opportunity[],
      parsed.data.touchpoints as Touchpoint[],
      parsed.data.model,
    );
    res.json({ results: report });
  });

  return app;
}
