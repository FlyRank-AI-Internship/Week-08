import {
  beforeAll,
  afterAll,
  describe,
  expect,
  test,
} from "vitest";

import request from "supertest";

import { app } from "../src/app.js";
import { db } from "../src/db/pool.js";

import {
  createTestTenant,
  createTestWidget,
  cleanupTenant,
} from "./helpers/testData.js";

let tenant;
let widget;

beforeAll(async () => {
  process.env.GEO_PROVIDER_A_ENABLED =
    "false";

  process.env.GEO_PROVIDER_B_ENABLED =
    "false";

  process.env.SIDE_EFFECT_ENABLED =
    "false";

  tenant =
    await createTestTenant();

  widget =
    await createTestWidget(
      tenant.id
    );
});

afterAll(async () => {
  await cleanupTenant(
    tenant.id
  );

  //await db.end();
});

describe(
  "Public submission API",
  () => {
    test(
      "handles CORS preflight",
      async () => {
        const response =
          await request(app)
            .options(
              `/api/public/widgets/${widget.id}/submissions`
            )
            .set(
              "Origin",
              "http://localhost:5500"
            )
            .set(
              "Access-Control-Request-Method",
              "POST"
            )
            .set(
              "Access-Control-Request-Headers",
              "Content-Type"
            );

        expect(
          response.status
        ).toBe(204);

        expect(
          response.headers[
            "access-control-allow-origin"
          ]
        ).toBe(
          "http://localhost:5500"
        );
      }
    );

    test(
      "rejects missing required field",
      async () => {
        const response =
          await request(app)
            .post(
              `/api/public/widgets/${widget.id}/submissions`
            )
            .set(
              "Origin",
              "http://localhost:5500"
            )
            .send({
              data: {
                name: "Ahmad",
              },
            });

        expect(
          response.status
        ).toBe(400);

        expect(
          response.body.error
        ).toBe(
          "Invalid submission"
        );
      }
    );

    test(
      "rejects oversized payload",
      async () => {
        const response =
          await request(app)
            .post(
              `/api/public/widgets/${widget.id}/submissions`
            )
            .set(
              "Origin",
              "http://localhost:5500"
            )
            .send({
              data: {
                name:
                  "A".repeat(
                    25000
                  ),
                email:
                  "large@example.com",
              },
            });

        expect(
          response.status
        ).toBe(413);

        expect(
          response.body.error
        ).toBe(
          "Payload too large"
        );
      }
    );

    test(
      "honeypot submission is not stored",
      async () => {
        const response =
          await request(app)
            .post(
              `/api/public/widgets/${widget.id}/submissions`
            )
            .set(
              "Origin",
              "http://localhost:5500"
            )
            .send({
              data: {
                name: "Spam Bot",
                email:
                  "bot@example.com",
              },

              website:
                "spam.example.com",
            });

        expect(
          response.status
        ).toBe(202);

        expect(
          response.body.accepted
        ).toBe(true);

        const stored =
          await db.query(
            `
            SELECT id
            FROM submissions
            WHERE widget_id = $1
              AND payload->>'email'
                = 'bot@example.com'
            `,
            [widget.id]
          );

        expect(
          stored.rowCount
        ).toBe(0);
      }
    );

    test(
      "same idempotency key stores once",
      async () => {
        const key =
          "vitest-idempotency-001";

        const body = {
          data: {
            name: "Ahmad",
            email:
              "ahmad@example.com",
          },
        };

        const first =
          await request(app)
            .post(
              `/api/public/widgets/${widget.id}/submissions`
            )
            .set(
              "Origin",
              "http://localhost:5500"
            )
            .set(
              "Idempotency-Key",
              key
            )
            .send(body);

        expect(
          first.status
        ).toBe(201);

        const second =
          await request(app)
            .post(
              `/api/public/widgets/${widget.id}/submissions`
            )
            .set(
              "Origin",
              "http://localhost:5500"
            )
            .set(
              "Idempotency-Key",
              key
            )
            .send(body);

        expect(
          second.status
        ).toBe(200);

        expect(
          second.body.duplicate
        ).toBe(true);

        const count =
          await db.query(
            `
            SELECT COUNT(*)::int
              AS count
            FROM submissions
            WHERE widget_id = $1
              AND idempotency_key = $2
            `,
            [
              widget.id,
              key,
            ]
          );

        expect(
          count.rows[0].count
        ).toBe(1);
      }
    );
  }
);