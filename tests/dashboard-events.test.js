import { describe, expect, test, vi } from "vitest";
import request from "supertest";

import { app } from "../src/app.js";
import {
  publishSubmissionCreated,
  subscribeToTenant,
} from "../src/services/dashboardEventService.js";

function fakeResponse() {
  return { write: vi.fn() };
}

describe("Real-time dashboard events", () => {
  test("event stream requires authentication", async () => {
    const response = await request(app)
      .get("/api/dashboard/events");

    expect(response.status).toBe(401);
  });

  test("publishes a new submission only to its tenant", () => {
    const tenantA = fakeResponse();
    const tenantB = fakeResponse();
    const stopA = subscribeToTenant("tenant-a", tenantA);
    const stopB = subscribeToTenant("tenant-b", tenantB);

    tenantA.write.mockClear();
    tenantB.write.mockClear();

    const listeners = publishSubmissionCreated({
      id: "submission-1",
      tenant_id: "tenant-a",
      widget_id: "widget-1",
      payload: { email: "lead@example.com" },
      country: "Pakistan",
      city: "Karachi",
      created_at: "2026-08-20T00:00:00.000Z",
    });

    expect(listeners).toBe(1);
    expect(tenantA.write).toHaveBeenCalledWith(
      "event: submission.created\n"
    );
    expect(tenantA.write).toHaveBeenCalledWith(
      expect.stringContaining("lead@example.com")
    );
    expect(tenantB.write).not.toHaveBeenCalled();

    stopA();
    stopB();
  });
});
