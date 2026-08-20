# Evidence

This file contains one real proof for each completed Definition-of-Done requirement. Items that have not yet been implemented remain marked as pending.

## Widget Management

### Authentication Required

Unauthenticated widget-management requests are rejected with HTTP `401`.

**Status:** Completed

### Widget Creation

Tenant A successfully created an authenticated widget:

```text
id              : f326a952-717c-4998-957e-b560456f445f
type            : contact
title           : Contact Us
description     : Send us a message
button_text     : Send
is_active       : True
```

**Status:** Completed

### Widget Retrieval

Tenant A successfully retrieved its own widget through the authenticated API.

```text
id              : f326a952-717c-4998-957e-b560456f445f
type            : contact
title           : Contact Us
is_active       : True
```

**Status:** Completed

### Tenant Isolation

Widget repository queries are scoped using both the widget ID and authenticated `tenant_id`. Cross-tenant reads and modifications return a tenant-safe `404 Widget not found`.

**Status:** Completed / verified during Phase 2

### Embed Snippet

Per-widget embed snippet generation is implemented through the authenticated widget API.

**Status:** Completed

---

## Widget Delivery

Public cached widget configuration endpoint:

**Status:** Completed - `tests/widget-delivery.test.js` verifies the public config response.

Versioned widget JavaScript bundle (`widget.v1.js`):

**Status:** Completed - `tests/widget-delivery.test.js` verifies the immutable versioned bundle.

Widget rendered successfully on a second-origin customer page:

**Status:** Completed - the port 5500 test page and `tests/widget-render.test.js` prove rendering.

Correct HTTP cache headers:

**Status:** Completed - delivery tests assert immutable and 60-second cache policies.

---

## Public Submission API

### Valid Cross-Origin Submission

A valid submission from the allowed second origin was accepted and stored.

Request origin:

```text
http://localhost:5500
```

Result:

```text
accepted submissionId
-------- ------------
True     7c37d1b5-36d0-4629-8fbf-c8a4b3781e4f
```

Database proof:

```text
id                                   | payload
-------------------------------------+-------------------------------------------------
7c37d1b5-36d0-4629-8fbf-c8a4b3781e4f | {"name": "Ahmad", "email": "ahmad@example.com"}
```

**Status:** Completed

### CORS Preflight

Preflight request returned:

```text
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:5500
Access-Control-Allow-Methods: GET,POST,OPTIONS
Access-Control-Allow-Headers: Content-Type,Idempotency-Key
```

**Status:** Completed

### Required Field Validation

A submission missing the required `email` field returned a clean validation error:

```json
{
  "error": "Invalid submission",
  "fields": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

**Status:** Completed

### Oversized Payload

A request body larger than the configured JSON limit returned:

```json
{
  "error": "Payload too large"
}
```

HTTP status: `413`

**Status:** Completed

### Idempotent Submission

The same submission was sent again using the same `Idempotency-Key`.

Result:

```text
accepted duplicate
-------- ---------
True     True
```

The request did not create a duplicate submission row.

**Status:** Completed

---

## Abuse Protection

### Rate Limiting

A burst of 12 rapid requests produced:

```text
201
201
201
201
201
201
201
201
201
201
429
429
```

This proves the public endpoint begins returning HTTP `429` when the configured request limit is exceeded.

**Status:** Completed

### Honeypot Spam Protection

A bot-style request filled the hidden `website` field.

API response:

```text
accepted
--------
True
```

Database query after the request:

```text
id                                   | payload                                         | is_spam
-------------------------------------+-------------------------------------------------+--------
7c37d1b5-36d0-4629-8fbf-c8a4b3781e4f | {"name": "Ahmad", "email": "ahmad@example.com"} | f
```

No `Spam Bot` submission was stored.

**Status:** Completed

---

## Enrichment and Safe Side Effects

### Geo Provider A → Provider B Fallback

Provider A disabled/failing, Provider B enriches the submission.

**Status:** Completed - `tests/geo-fallback.test.js` verifies provider B after provider A is disabled.

### All Geo Providers Down

The submission must still be stored successfully without country/city data when both geo providers fail.

**Status:** Completed - `tests/geo-fallback.test.js` verifies a null-geo degraded result.

### Safe Side Effect

A forced confirmation-email/webhook failure must not prevent the submission from being stored or the API from returning success.

**Status:** Completed - `npm run demo` forces failure after storage and requires HTTP 201 plus an increased dashboard count.

---

## Tests and Documentation

### Automated Tests

Required automated coverage still needs to include:

* CORS preflight
* invalid payload
* oversized payload
* rate limiting
* honeypot spam control
* geo-provider fallback
* successful widget rendering

**Status:** Completed - 5 test files and all 12 tests passed after the documented Docker setup.

### README

README must include:

* system overview
* architecture diagram
* exact run and seed instructions
* API documentation
* honest limitations

**Status:** Completed

---

## Optional Stretch Goal

### Real-time Dashboard

`GET /api/dashboard/events` exposes an authenticated SSE stream. A stored submission publishes `submission.created` only to listeners belonging to that submission's tenant. `tests/dashboard-events.test.js` proves authentication and tenant isolation; `/demo/dashboard` renders live leads without refreshing.

**Status:** Completed

### Required Submission-Pack Files

The final repository must include:

* `README.md`
* `capstone.yaml`
* `EVIDENCE.md`
* `BUILDLOG.md`
* `.env.example`

**Status:** Completed
