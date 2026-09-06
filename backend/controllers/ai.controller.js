import Conversation from "../models/Conversation.js";
import Event from "../models/Event.js";
import { askAI } from "../ai/registrationAgent.js";
import { processRegistration } from "./registration.controller.js";

export const registerAgent = async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "sessionId is required",
      });
    }

    let conversation = await Conversation.findOne({ sessionId });

    // ===========================
    // START CONVERSATION
    // ===========================
    if (!conversation) {
      conversation = await Conversation.create({
        sessionId,
      });

      const reply = await askAI(
        "Ask the user which event they would like to register for."
      );

      return res.json({
        success: true,
        completed: false,
        reply,
      });
    }

    // ===========================
    // EVENT SELECTION
    // ===========================
    if (conversation.status === "SELECTING_EVENT") {
      const event = await Event.findOne({
        title: { $regex: message, $options: "i" },
      });

      if (!event) {
        return res.json({
          success: false,
          completed: false,
          reply:
            "Sorry, I couldn't find that event. Please enter a valid event name.",
        });
      }

      conversation.eventId = event._id;
      conversation.status = "COLLECTING_DETAILS";
      conversation.currentFieldIndex = 0;

      await conversation.save();

      const fields = event.registrationFields.filter(
        (field) => !["name", "email"].includes(field.key)
      );

      if (fields.length === 0) {
        return res.json({
          success: true,
          completed: true,
          reply:
            "No additional information is required for this event. Please check your email for your registration status.",
        });
      }

      const reply = await askAI(
        `Ask the user for their ${fields[0].label}.`
      );

      return res.json({
        success: true,
        completed: false,
        event: event.title,
        reply,
      });
    }

    // ===========================
    // COLLECT DETAILS
    // ===========================
    if (conversation.status === "COLLECTING_DETAILS") {
      const event = await Event.findById(conversation.eventId);

      const fields = event.registrationFields.filter(
        (field) => !["name", "email"].includes(field.key)
      );

      const currentField = fields[conversation.currentFieldIndex];

      // Save current answer
      conversation.collectedFields.set(currentField.key, message);

      conversation.currentFieldIndex++;

      // Finished collecting all details
if (conversation.currentFieldIndex >= fields.length) {

  conversation.status = "READY_FOR_REGISTRATION";

  await conversation.save();

  // ==========================================
  // AUTOMATICALLY PROCESS REGISTRATION
  // ==========================================

  const result = await processRegistration(
    sessionId,
    req.user.id
  );

  return res.json({
    success: true,
    completed: true,
    registered: true,

    reply:
      "Thank you! Your registration has been completed successfully. A confirmation email with your registration details and QR code has been sent to your registered email address.",

    registrationId: result.registrationId,
    qrCode: result.qrCode,
  });
}
      const nextField = fields[conversation.currentFieldIndex];

      await conversation.save();

      const reply = await askAI(
        `Ask the user for their ${nextField.label}.`
      );

      return res.json({
        success: true,
        completed: false,
        reply,
      });
    }

    return res.json({
      success: false,
      reply: "This registration session has already been completed.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};