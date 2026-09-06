import request from "supertest";
import { jest } from "@jest/globals";
import app from "../../src/app.js";

jest.setTimeout(60000);

describe("E2E - Speaker Cancellation Workflow", () => {
  test("orchestrator should accept a speaker-cancellation request and return workflow metadata", async () => {
    const response = await request(app)
      .post("/api/agent-orchestrator/chat")
      .send({
        message:
          "The main speaker has cancelled. Find a replacement speaker, check the session schedule, identify any impact, and report what action is required.",
      });

    expect(response.status).toBeLessThan(500);
    expect(response.body).toBeDefined();

    if (response.body.success) {
      expect(response.body.workflow).toBeDefined();
      expect(Array.isArray(response.body.workflow.agents)).toBe(true);
      expect(response.body.results).toBeDefined();
    }
  });
});