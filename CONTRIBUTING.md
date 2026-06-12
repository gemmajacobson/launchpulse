# Contributing to LaunchPulse

## Workflow

1. Branch from `main` (`feat/...`, `fix/...`, `chore/...`).
2. Make your change with tests.
3. Open a PR — CI must pass (typecheck, tests, build).
4. One approving review required before merge.

## Local development

```bash
npm install
npm run dev        # API with hot reload
npm run test:watch # tests in watch mode
```

## Conventions

- TypeScript strict mode; no `any` unless unavoidable.
- Domain types live in `src/lib/types.ts` — extend there first.
- New scoring signals need a corresponding test in `tests/leadScorer.test.ts`.
- Keep integrations thin: parse at the boundary (zod), map into domain types immediately.

## Releases

Tag `main` with `vX.Y.Z` to trigger the release workflow. Update `CHANGELOG.md` in the same PR as the version bump.
