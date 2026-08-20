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
    await createTestTenant(
      "Rate Limit Test"
    );

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
  "Rate limiting",
  () => {
    test(
      "returns 429 under burst traffic",
      async () => {
        const statuses = [];

        for (
          let i = 0;
          i < 12;
          i += 1
        ) {
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
                    `User ${i}`,

                  email:
                    `user${i}@example.com`,
                },
              });

          statuses.push(
            response.status
          );
        }

        expect(
          statuses
        ).toContain(429);
      }
    );
  }
);