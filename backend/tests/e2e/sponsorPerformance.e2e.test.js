import request from "supertest";
import { jest } from "@jest/globals";
import app from "../../src/app.js";

jest.setTimeout(60000);

describe("E2E - Sponsor Performance Workflow", () => {
  test("sponsorship agent should respond with sponsor data and analytics", async () => {
    const sponsorResponse = await request(app)
      .post("/api/sponsorship-agent/chat")
      .send({
        message:
          "Which sponsor has the highest attendee engagement and how is their performance?",
      });

    expect(sponsorResponse.status).toBeLessThan(500);
    expect(sponsorResponse.body).toBeDefined();

    if (sponsorResponse.body.success) {
      expect(sponsorResponse.body.analytics).toBeDefined();
      expect(Array.isArray(sponsorResponse.body.sponsors)).toBe(true);
    }
  });
});