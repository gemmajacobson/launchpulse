# LaunchPulse

GTM analytics for revenue teams — lead scoring, multi-touch campaign attribution and outreach sequencing in one API.

![CI](https://img.shields.io/badge/CI-passing-brightgreen) ![node](https://img.shields.io/badge/node-%E2%89%A520-blue) ![license](https://img.shields.io/badge/license-proprietary-lightgrey)

## What it does

- **Lead scoring** — blends demographic fit (industry, company size, seniority) with recency-decayed behavioural engagement into a 0–100 score and an A–D grade.
- **Campaign attribution** — first-touch, last-touch, linear and U-shaped models over closed-won revenue, with per-campaign ROI.
- **Outreach sequencing** — routes scored leads into high-intent or nurture sequences, schedules multi-channel touches, and suppresses recent repliers.
- **Integrations** — HubSpot contact sync and Slack nightly digests.

## Quick start

```bash
npm install
npm run dev          # API on :3000
npm test             # unit tests
npm run score:nightly  # run the nightly scoring job locally
```

## API

| Endpoint | Method | Description |
|---|---|---|
| `/healthz` | GET | Liveness probe |
| `/v1/score` | POST | Score a batch of leads against their activity history |
| `/v1/attribution` | POST | Run an attribution model over campaigns + opportunities |

Example:

```bash
curl -s localhost:3000/v1/score \
  -H 'Content-Type: application/json' \
  -d '{"leads":[...],"activities":[...]}'
```

## Architecture

```
src/
├── api/           Express server & routes
├── scoring/       Lead scoring engine (fit + engagement)
├── attribution/   Multi-touch attribution models
├── sequencing/    Outreach sequence routing & scheduling
├── integrations/  HubSpot sync, Slack digests
└── lib/           Shared domain types
```

## CI/CD

| Workflow | Trigger | Purpose |
|---|---|---|
| `ci.yml` | push / PR to `main` | Typecheck, test, build |
| `deploy-staging.yml` | push to `main` | Deploy latest build to staging |
| `nightly-lead-scoring.yml` | cron 02:00 UTC | Re-score all leads, post Slack digest |
| `release.yml` | `v*` tag | Tagged production release |

## Configuration

Copy `.env.example` to `.env`:

| Variable | Purpose |
|---|---|
| `PORT` | API port (default 3000) |
| `HUBSPOT_API_KEY` | HubSpot private app token for contact sync |
| `SLACK_WEBHOOK_URL` | Incoming webhook for the nightly digest |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). All changes go through PR review and must pass CI.
