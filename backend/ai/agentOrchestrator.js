import jwt from "jsonwebtoken";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const createInternalToken = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return "";
  }

  return jwt.sign(
    {
      _id: "agent-orchestrator",
      email: "internal@system.local",
      role: "internal",
    },
    secret,
    {
      expiresIn: "1h",
    }
  );
};

const AGENTS = {
  registration: {
    name: "Registration Agent",
    endpoint: "/api/registration-agent/chat",
  },

  venue: {
    name: "Venue Agent",
    endpoint: "/api/venue-agent/chat",
  },

  speaker: {
    name: "Speaker Agent",
    endpoint: "/api/speaker-agent/chat",
  },

  sponsorship: {
    name: "Sponsorship Agent",
    endpoint: "/api/sponsorship-agent/chat",
  },

  incident: {
    name: "Incident Agent",
    endpoint: "/api/incidents/chat",
  },

  intelligence: {
    name: "Event Intelligence Engine",
    endpoint: "/api/event-intelligence/chat",
  },
};

const AGENT_ALIASES = {
  "registration agent": "registration",
  "registration": "registration",
  "venue agent": "venue",
  "venue": "venue",
  "speaker agent": "speaker",
  "speaker": "speaker",
  "sponsorship agent": "sponsorship",
  "sponsor": "sponsorship",
  "sponsorship": "sponsorship",
  "incident agent": "incident",
  "incident": "incident",
  "event intelligence engine": "intelligence",
  "event intelligence": "intelligence",
  "intelligence": "intelligence",
};

const normalizeWorkflowAgents = (agents = []) => {
  if (!Array.isArray(agents)) {
    return [];
  }

  return agents
    .map((agent) => {
      if (!agent) return null;

      const normalized = String(agent).trim();
      const key = AGENT_ALIASES[normalized.toLowerCase()];

      if (key && AGENTS[key]) {
        return key;
      }

      return null;
    })
    .filter(Boolean);
};

export const askOrchestratorAI = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Orchestrator AI Error:", error);
    throw new Error("Failed to process agent orchestration.");
  }
};

const determineWorkflow = async (message) => {
  const prompt = `
You are the Agent Orchestrator for an Event Management Platform.

Organizer request:
"${message}"

Available agents:

1. Registration Agent
   Handles attendee registration, attendees and check-in information.

2. Venue Agent
   Handles venue search, availability and venue booking.

3. Speaker Agent
   Handles speakers, expertise, availability and scheduling.

4. Sponsorship Agent
   Handles sponsors, deliverables, payments and sponsor performance.

5. Incident Agent
   Handles incidents, classification, prioritization and incident management.

6. Event Intelligence Engine
   Combines event information and provides overall event intelligence.

Determine which agents are required and the correct execution order.

Return ONLY valid JSON:

{
  "intent": "",
  "agents": [],
  "requiresApproval": false,
  "reason": ""
}

Rules:

- Use the minimum number of agents necessary.
- If multiple agents are required, order them by dependency.
- Use Incident Agent when an operational incident must be created.
- Use Event Intelligence Engine when overall analysis is required.
- Venue booking requires Venue Agent.
- Speaker scheduling requires Speaker Agent.
- Sponsor-related questions require Sponsorship Agent.
- Registration/attendee questions require Registration Agent.
- Do not invent agents.
- Return ONLY JSON.
`;

  const response = await askOrchestratorAI(prompt);

  try {
    const cleaned = response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    const normalizedAgents = normalizeWorkflowAgents(parsed.agents);

    return {
      ...parsed,
      agents: normalizedAgents.length > 0 ? normalizedAgents : ["intelligence"],
    };
  } catch (error) {
    console.error("Workflow parsing error:", error);

    return {
      intent: "general",
      agents: ["intelligence"],
      requiresApproval: false,
      reason: "Fallback to Event Intelligence Engine",
    };
  }
};

const executeAgent = async (agentKey, message, previousResults = []) => {
  const agent = AGENTS[agentKey];

  if (!agent) {
    throw new Error(`Unknown agent: ${agentKey}`);
  }

  const baseUrl =
    process.env.BACKEND_URL || "http://localhost:5000";

  const token = createInternalToken();

  const prompt = `
Organizer request:
${message}

Previous agent results:
${JSON.stringify(previousResults, null, 2)}

You are being called as part of a coordinated multi-agent workflow.

Use the previous results when relevant.

Perform only the responsibilities of your agent.
Return a concise result that can be passed to the next agent.
`;

  const response = await fetch(
    `${baseUrl}${agent.endpoint}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        message: prompt,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `${agent.name} failed with status ${response.status}`
    );
  }

  const data = await response.json();

  return {
    agent: agent.name,
    success: data.success !== false,
    message: data.message || "",
    data,
  };
};

export const orchestrateAgents = async (message) => {
  if (!message || !message.trim()) {
    throw new Error("Message is required.");
  }

  const workflow = await determineWorkflow(message);
  const results = [];

  for (const agentKey of workflow.agents) {
    try {
      const result = await executeAgent(
        agentKey,
        message,
        results
      );

      results.push(result);

      if (!result.success) {
        return {
          success: false,
          status: "failed",
          workflow,
          results,
          message: `${result.agent} could not complete its task.`,
        };
      }
    } catch (error) {
      console.error(
        `Agent ${agentKey} execution error:`,
        error
      );

      return {
        success: false,
        status: "failed",
        workflow,
        results,
        message: error.message,
      };
    }
  }

  const summaryPrompt = `
You are the final coordinator of an Event Management Platform.

Original organizer request:
"${message}"

Workflow:
${JSON.stringify(workflow, null, 2)}

Agent results:
${JSON.stringify(results, null, 2)}

Provide a single clear response to the organizer.

Rules:

- Combine the useful information from all agents.
- Do not repeat unnecessary information.
- Clearly mention important actions taken.
- Clearly mention failures.
- Clearly mention if human attention is required.
- Do not invent information.
- Use clean Markdown.
`;

  const finalResponse = await askOrchestratorAI(summaryPrompt);

  return {
    success: true,
    status: "completed",

    workflow: {
      intent: workflow.intent,
      agents: workflow.agents,
      requiresApproval: workflow.requiresApproval,
      reason: workflow.reason,
    },

    results,

    message: finalResponse,
  };
};

export default {
  askOrchestratorAI,
  orchestrateAgents,
};