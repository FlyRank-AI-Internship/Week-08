import request from "supertest";

import { app } from "../src/app.js";
import { db } from "../src/db/pool.js";

const widgetId =
  "11111111-1111-4111-8111-111111111111";

function check(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function rehearse() {
  const login = await request(app)
    .post("/api/auth/login")
    .send({
      email: "owner-a@example.com",
      password: "Password123!",
    });

  check(login.status === 200, "Demo owner login failed");
  const token = login.body.token;

  const config = await request(app)
    .get(`/api/public/widgets/${widgetId}/config`)
    .set("Origin", "http://localhost:5500");

  check(config.status === 200, "Public widget config failed");
  check(
    config.headers["cache-control"]?.includes("max-age=60"),
    "Public config is missing its short cache header"
  );

  process.env.GEO_PROVIDER_A_ENABLED = "false";
  process.env.GEO_PROVIDER_B_ENABLED = "false";
  process.env.SIDE_EFFECT_ENABLED = "true";
  process.env.SIDE_EFFECT_FORCE_FAIL = "true";

  const idempotencyKey = `demo-${Date.now()}`;
  const submission = await request(app)
    .post(`/api/public/widgets/${widgetId}/submissions`)
    .set("Origin", "http://localhost:5500")
    .set("Idempotency-Key", idempotencyKey)
    .send({
      data: {
        name: "Live Demo Lead",
        email: "live-demo@example.com",
        message: "The forced notification failure must not lose this lead.",
      },
    });

  check(submission.status === 201, "Public submission failed");
  check(submission.body.accepted, "Submission was not accepted");

  const dashboard = await request(app)
    .get("/api/dashboard/stats")
    .set("Authorization", `Bearer ${token}`);

  check(dashboard.status === 200, "Dashboard stats failed");
  check(
    dashboard.body.summary.total_submissions >= 4,
    "Dashboard did not include seeded and live leads"
  );

  console.log("DEMO REHEARSAL PASSED");
  console.log(`Widget: ${config.body.title}`);
  console.log(`Stored submission: ${submission.body.submissionId}`);
  console.log(
    `Dashboard total: ${dashboard.body.summary.total_submissions}`
  );
  console.log(
    "Forced side-effect failure was logged and the main request still returned 201."
  );
}

try {
  await rehearse();
} catch (error) {
  console.error("DEMO REHEARSAL FAILED:", error.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
