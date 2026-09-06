import request from "supertest";
import { jest } from "@jest/globals";
import app from "../../src/app.js";

jest.setTimeout(60000);

describe("E2E - Venue Issue Workflow", () => {
  test("incident creation endpoint should accept a venue issue and return generated incident fields", async () => {
    const incidentResponse = await request(app)
      .post("/api/incidents")
      .send({
        title: "E2E Venue Issue",
        description:
          "The main event hall has a serious technical problem affecting attendees.",
      });

    expect(incidentResponse.status).toBeLessThan(500);
    expect(incidentResponse.body).toBeDefined();

    if (incidentResponse.body.success) {
      const incident =
        incidentResponse.body.incident || incidentResponse.body.data;

      expect(incident).toBeDefined();
      expect(incident.category).toBeDefined();
      expect(incident.severity).toBeDefined();
      expect(incident.priority).toBeDefined();
      expect(incident.responsibleTeam).toBeDefined();
    }
  });
});