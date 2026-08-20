
### `BUILDLOG.md`

```md
# Build Log

## Phase 1 - Design

### AI assistance
AI helped me structure the initial repository and break the capstone into layers.

### What I reviewed myself
I compared the proposed structure against the capstone requirements and kept the design focused on the required backend concerns.

### Changes I made
To be updated as implementation continues.

## Phase 2 - Hardened submission path

AI helped assemble validation, CORS, rate limiting, honeypot handling, geo fallback, idempotency, and failure-isolated notifications. I reviewed the ordering: validate, enrich with graceful fallback, store durably, then run the non-critical side effect.

## Phase 3 - Delivery, dashboard, and proof

AI helped create the versioned browser bundle, cached config route, second-origin page, aggregation queries, and Vitest coverage. I reviewed the public/authenticated path separation and tenant filters.

## Phase 4 - Demo prep

AI added deterministic demo data, a stable widget ID, an automated rehearsal command, and a live-demo runbook. The rehearsal forces notification failure and proves the stored lead still reaches dashboard totals.

### Verification
The full suite passed (12/12), then the Phase 4 rehearsal passed twice. Both runs stored a lead despite the deliberately failed notification; dashboard totals increased from 4 to 5.

## Stretch Goal - Real-time dashboard

AI helped add an authenticated Server-Sent Events stream, an in-memory tenant subscription broker, a small live dashboard page, and isolation tests. I kept bearer authentication in request headers by serving the dashboard from the API origin instead of exposing a JWT in a query string.
