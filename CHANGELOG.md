# Changelog

## 1.4.2 — 2026-06-10

- Fix U-shaped attribution rounding when an opportunity has exactly two touchpoints
- Bump `zod` to 3.23.x

## 1.4.1 — 2026-05-28

- Suppress sequence touches for leads who replied within the cooldown window
- Nightly scoring report now uploaded as a workflow artifact

## 1.4.0 — 2026-05-19

- New `/v1/attribution` endpoint with four attribution models
- Per-campaign ROI in attribution reports

## 1.3.0 — 2026-04-30

- Recency decay on engagement scoring (14/45/90-day bands)
- HubSpot contact sync pagination

## 1.2.0 — 2026-04-08

- Grade-based sequence routing (A/B → high-intent, C/D → nurture)
- Slack nightly digest

## 1.1.0 — 2026-03-25

- Lead scoring API (`/v1/score`)
- Initial HubSpot integration

## 1.0.0 — 2026-03-10

- Initial release
