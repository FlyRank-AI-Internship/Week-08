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
  tenant =
    await createTestTenant(
      "Widget Delivery Test"
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
  "Widget delivery",
  () => {
    test(
      "serves versioned script with immutable cache",
      async () => {
        const response =
          await request(app)
            .get(
              `/widget.v1.js?id=${widget.id}`
            );

        expect(
          response.status
        ).toBe(200);

        expect(
          response.headers[
            "cache-control"
          ]
        ).toContain(
          "immutable"
        );

        expect(
          response.text
        ).toContain(
          "data-flyrank-widget"
        );
      }
    );

    test(
      "serves public config with short cache",
      async () => {
        const response =
          await request(app)
            .get(
              `/api/public/widgets/${widget.id}/config`
            )
            .set(
              "Origin",
              "http://localhost:5500"
            );

        expect(
          response.status
        ).toBe(200);

        expect(
          response.headers[
            "cache-control"
          ]
        ).toContain(
          "max-age=60"
        );

        expect(
          response.body.id
        ).toBe(widget.id);
      }
    );
  }
);