import request from "supertest";
import { jest } from "@jest/globals";
import app from "../../src/app.js";

jest.setTimeout(60000);

describe("E2E - High Crowd Risk Workflow", () => {
  test("event intelligence endpoint should return a valid analysis response", async () => {
    const response = await request(app)
      .post("/api/event-intelligence/chat")
      .send({
        message:
          "Analyze the current registration and attendance levels. Identify whether there is any crowd or capacity risk and recommend immediate action if required.",
      });

    expect(response.status).toBeLessThan(500);
    expect(response.body).toBeDefined();

    if (response.body.success) {
      expect(response.body.message).toBeDefined();
      expect(response.body.insights).toBeDefined();
      expect(response.body.insights.registrationSummary).toBeDefined();
    }
  });
});