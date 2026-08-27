# E2E tests

Playwright specs.

## Prerequisiti

Un solo install manuale dei browser (~150 MB):

```bash
cd frontend
npx playwright install chromium
```

Non è stato messo in `postinstall` per evitare download pesanti a chi non usa gli e2e.

## Run

Dalla root:

```bash
npm run test:e2e
```

Oppure dentro `frontend/`:

```bash
npm run test:e2e
```

## Unit test

I test unitari (`vitest`) girano senza dipendenze extra:

```bash
npm test
```
