# FlyRank Capstone - Embeddable Widget & Lead-Capture Platform

An Express/PostgreSQL backend where authenticated tenants create widgets, embed them on external sites, safely capture public leads, and inspect dashboard analytics.

## Status

Phase 4 - Complete. The repeatable seed, full automated suite, and two-run demo rehearsal are verified. The core capstone is ready for its live demo.

## Architecture

```text
Widget owner -> JWT auth -> widget CRUD -----------> PostgreSQL
External site -> widget.v2.js -> cached config -> rendered form
Visitor -> CORS + validation + rate limit + honeypot
        -> geo provider A -> provider B -> store lead -> safe notification
Owner -> JWT auth -> dashboard queries -----------> PostgreSQL
```

The API, service, repository, and database layers are separate. Every owner query is tenant-scoped. Geo lookup and notification failures degrade without losing an otherwise valid lead.

## Setup

Requirements: Node.js 20+, Docker with Compose.

```bash
cp .env.example .env
docker compose up -d
npm install
npm run migrate
npm run seed
npm start
```

On PowerShell, replace the first command with `Copy-Item .env.example .env`.

The API runs at `http://localhost:3000`. Serve the customer page from a second origin:

```bash
npx serve test-site -l 5500
```

Then open `http://localhost:5500`.

## Demo and tests

```bash
npm test
npm run demo
```

The demo command intentionally forces the notification to fail and verifies the submission still stores. The complete presentation flow and credentials are in [DEMO.md](DEMO.md).

## API

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Database health |
| `POST` | `/api/auth/login` | Public | Obtain JWT |
| `POST/GET` | `/api/widgets` | Bearer token | Create/list tenant widgets |
| `GET/PATCH/DELETE` | `/api/widgets/:id` | Bearer token | Manage one tenant widget |
| `GET` | `/api/widgets/:id/embed` | Bearer token | Generate embed snippet |
| `GET` | `/widget.v2.js?id=:id` | Public | Versioned immutable widget bundle |
| `GET` | `/api/public/widgets/:id/config` | Public/CORS | Short-cached widget config |
| `OPTIONS/POST` | `/api/public/widgets/:id/submissions` | Public/CORS | Preflight and lead capture |
| `GET` | `/api/dashboard/submissions` | Bearer token | Paginated tenant leads |
| `GET` | `/api/dashboard/stats` | Bearer token | Summary, daily, widget, and geo stats |
| `GET` | `/api/dashboard/widgets/:id/stats` | Bearer token | Tenant-safe widget stats |
| `GET` | `/api/dashboard/events` | Bearer token | Tenant-isolated live SSE stream |

Demo login:

```json
{"email":"owner-a@example.com","password":"Password123!"}
```

Public submission:

```json
{"data":{"name":"Demo Lead","email":"lead@example.com"},"website":""}
```

## Security and resilience

- JWT authentication and tenant-scoped repositories
- 20 KB JSON body limit and schema/widget-field validation
- Explicit CORS/preflight support for public endpoints
- Per-IP/per-widget rate limiting and honeypot spam handling
- Idempotency keys for safe retries
- Two-provider geo fallback with no-geo success
- Notification failure isolated after durable storage
- Real-time dashboard updates over authenticated Server-Sent Events

## Limitations

- Local development only; no production CDN or deployment is included.
- Rate limiting is in-memory and should use a shared store when horizontally scaled.
- The notification is intentionally a fake local side effect.
- The widget UI and dashboard surface are intentionally minimal because this is a backend capstone.
