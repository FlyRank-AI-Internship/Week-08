# Phase 4 Demo Runbook

The demo is deterministic: `npm run seed` recreates two tenants, one stable demo widget, three dashboard leads, and the credentials below.

## Prepare

```bash
docker compose up -d
npm run migrate
npm run seed
npm test
```

Start the API and the second-origin customer page in separate terminals:

```bash
npm start
npx serve test-site -l 5500
```

Open `http://localhost:5500`, submit the rendered widget, and show the browser Network panel: config is fetched cross-origin and the submission succeeds.

Open `http://localhost:3000/demo/dashboard` in another tab. New widget submissions appear in its table immediately without a refresh, proving the optional real-time dashboard stretch goal.

## Automated rehearsal

Run this twice after seeding:

```bash
npm run demo
npm run demo
```

The command proves login, cached public config delivery, cross-origin submission, durable storage, and dashboard aggregation. It deliberately forces the notification side effect to fail; the lead still stores and the API still returns `201`.

## Demo credentials

- Owner: `owner-a@example.com`
- Password: `Password123!`
- Demo widget: `11111111-1111-4111-8111-111111111111`

## Live failure to explain

The rehearsal sets `SIDE_EFFECT_FORCE_FAIL=true`. The server logs a `side_effect_failure`, then returns success because notifications are non-critical and run only after the database insert.
