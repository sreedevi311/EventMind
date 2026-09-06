import {
  orchestrateAgents,
} from "../ai/agentOrchestrator.js";

export const orchestratorChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a request.",
      });
    }

    const result = await orchestrateAgents(message);

    return res.status(
      result.success ? 200 : 500
    ).json(result);

  } catch (error) {
    console.error(
      "Agent Orchestrator Error:",
      error
    );

    return res.status(500).json({
      success: false,
      status: "failed",
      message:
        error.message ||
        "Agent orchestration failed.",
    });
  }
};