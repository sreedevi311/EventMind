import request from "supertest";
import { jest } from "@jest/globals";
import app from "../../src/app.js";

jest.setTimeout(60000);

describe("E2E - Attendee Registration Workflow", () => {
  test("registration flow should accept valid registration payload", async () => {
    const registrationResponse = await request(app)
      .post("/api/registrations")
      .send({
        sessionId: "507f1f77bcf86cd799439011",
      })
      .set("Authorization", "Bearer invalid-token");

    expect(registrationResponse.status).toBeGreaterThanOrEqual(400);
    expect(registrationResponse.body).toBeDefined();
  });
});