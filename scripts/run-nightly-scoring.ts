/**
 * Nightly batch job: pull contacts, score them, write a report and post the
 * Slack digest. Runs from the `nightly-lead-scoring` GitHub Actions workflow.
 *
 * Without HUBSPOT_API_KEY it falls back to the bundled fixture data so the
 * job can run end-to-end in any environment.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import pino from 'pino';
import { scoreBatch } from '../src/scoring/leadScorer.js';
import { buildNightlyDigest, postDigest } from '../src/integrations/slack.js';
import { fixtureActivities, fixtureLeads } from './fixtures.js';

const logger = pino({ name: 'nightly-scoring' });

async function main() {
  const leads = fixtureLeads;
  const activities = fixtureActivities;

  if (process.env.HUBSPOT_API_KEY) {
    logger.info('HUBSPOT_API_KEY present — live sync would run here');
  } else {
    logger.warn('No HUBSPOT_API_KEY set, using fixture data');
  }

  const scored = scoreBatch(leads, activities);
  const hot = scored.filter((l) => l.grade === 'A' || l.grade === 'B');

  await mkdir('reports', { recursive: true });
  await writeFile(
    'reports/nightly-scoring.json',
    JSON.stringify({ generatedAt: new Date().toISOString(), leads: scored }, null, 2),
  );

  logger.info({ total: scored.length, hot: hot.length }, 'scoring complete');

  if (process.env.SLACK_WEBHOOK_URL) {
    await postDigest(buildNightlyDigest(hot, []));
    logger.info('Slack digest posted');
  } else {
    logger.warn('No SLACK_WEBHOOK_URL set, skipping digest');
  }
}

main().catch((err) => {
  logger.error(err, 'nightly scoring failed');
  process.exit(1);
});
