import QRCode from "qrcode";
import { v2 as cloudinary } from "cloudinary";

import Event from "../models/Event.js";
import User from "../models/User.js";
import Registration from "../models/Registration.js";
import Conversation from "../models/Conversation.js";
import { sendEmail } from "../utils/sendEmail.js";

// ==========================================
// CLOUDINARY CONFIG
// ==========================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ==========================================
// PROCESS REGISTRATION
// Used by both API and AI agent
// ==========================================

export const processRegistration = async (sessionId, userId) => {

  // ==========================================
  // USER
  // ==========================================

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  // ==========================================
  // CONVERSATION
  // ==========================================

  const conversation = await Conversation.findOne({
    sessionId,
  });

  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  if (conversation.status !== "READY_FOR_REGISTRATION") {
    throw new Error("Registration details are not complete.");
  }

  // ==========================================
  // EVENT
  // ==========================================

  const event = await Event.findById(conversation.eventId);

  if (!event) {
    throw new Error("Event not found.");
  }

  // ==========================================
  // DUPLICATE CHECK
  // ==========================================

  const existingRegistration = await Registration.findOne({
    eventId: event._id,
    userId: user._id,
  });

  if (existingRegistration) {
    throw new Error(
      "You have already registered for this event."
    );
  }

  // ==========================================
  // CONVERSATION DETAILS
  // ==========================================

  const details = Object.fromEntries(
    conversation.collectedFields
  );

  // ==========================================
  // REGISTRATION RESPONSES
  // ==========================================

  const responses = event.registrationFields
    .filter(
      (field) =>
        !["name", "email"].includes(field.key)
    )
    .map((field) => ({
      key: field.key,
      label: field.label,
      value: details[field.key] || "",
    }));

  // ==========================================
  // REGISTRATION ID
  // ==========================================

  const registrationId =
    "REG" + Date.now().toString().slice(-8);

  // ==========================================
  // CREATE REGISTRATION
  // ==========================================

  const registration = await Registration.create({
    registrationId,
    eventId: event._id,
    userId: user._id,
    registrationSource: "CHAT_AGENT",
    registrationStatus: "REGISTERED",
    responses,
  });

  // ==========================================
  // GENERATE QR
  // ==========================================

  const qrData = JSON.stringify({
    registrationId: registration.registrationId,
    eventId: registration.eventId,
    userId: registration.userId,
  });

  const qrImage = await QRCode.toDataURL(qrData);

  // ==========================================
  // UPLOAD QR TO CLOUDINARY
  // ==========================================

  const uploadResult =
    await cloudinary.uploader.upload(qrImage, {
      folder: "eventmind/qr-codes",
      public_id: registration.registrationId,
      overwrite: true,
    });

  registration.qrCode = uploadResult.secure_url;

  await registration.save();

  // ==========================================
  // SEND CONFIRMATION EMAIL
  // ==========================================

  await sendEmail({
    to: user.email,
    subject: `Registration Confirmed - ${event.title}`,

    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;padding:20px">

        <h2 style="color:#2E86C1">
          Registration Successful 🎉
        </h2>

        <p>Hello <b>${user.name}</b>,</p>

        <p>
          Your registration has been successfully completed.
          Your QR code has been generated.
        </p>

        <hr>

        <h3>Event Details</h3>

        <table cellpadding="8">

          <tr>
            <td><b>Event</b></td>
            <td>${event.title}</td>
          </tr>

          <tr>
            <td><b>Registration ID</b></td>
            <td>${registration.registrationId}</td>
          </tr>

          <tr>
            <td><b>Category</b></td>
            <td>${event.category}</td>
          </tr>

          <tr>
            <td><b>Venue</b></td>
            <td>${event.venue}</td>
          </tr>

          <tr>
            <td><b>Start</b></td>
            <td>${new Date(event.startDate).toLocaleString()}</td>
          </tr>

          <tr>
            <td><b>End</b></td>
            <td>${new Date(event.endDate).toLocaleString()}</td>
          </tr>

        </table>

        <br>

        <h3>Your Entry QR Code</h3>

        <img
          src="${registration.qrCode}"
          width="220"
          alt="QR Code"
        />

        <br><br>

        <p>
          Please keep this QR code safe.
          It will be scanned during event check-in.
        </p>

        <hr>

        <p>
          Thank you for registering.<br>
          <b>EventMind Team</b>
        </p>

      </div>
    `,
    text: `Registration confirmed for ${event.title}. Your registration ID is ${registration.registrationId}.`,
  });

  // ==========================================
  // COMPLETE CONVERSATION
  // ==========================================

  conversation.status = "REGISTRATION_COMPLETED";

  await conversation.save();

  // ==========================================
  // RETURN RESULT
  // ==========================================

  return {
    registrationId: registration.registrationId,
    qrCode: registration.qrCode,
    eventTitle: event.title,
    userEmail: user.email,
  };
};

// ==========================================
// CREATE REGISTRATION API
// POST /api/registrations
// ==========================================

export const createRegistration = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "sessionId is required.",
      });
    }

    const result = await processRegistration(
      sessionId,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Registration completed successfully.",
      ...result,
    });

  } catch (error) {
    console.error(
      "Registration Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET ALL REGISTRATIONS
// GET /api/registrations
// ==========================================

export const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("userId", "name email")
      .populate("eventId", "title venue category startDate endDate")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });

  } catch (error) {
    console.error(
      "Get All Registrations Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET REGISTRATION BY ID
// GET /api/registrations/:id
// ==========================================

export const getRegistrationById = async (req, res) => {
  try {
    const registration = await Registration.findById(
      req.params.id
    )
      .populate("userId", "name email")
      .populate(
        "eventId",
        "title venue category startDate endDate"
      );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: registration,
    });

  } catch (error) {
    console.error(
      "Get Registration Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// DELETE REGISTRATION
// DELETE /api/registrations/:id
// ==========================================

export const deleteRegistration = async (req, res) => {
  try {
    const registration =
      await Registration.findById(
        req.params.id
      );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found.",
      });
    }

    await Registration.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Registration deleted successfully.",
    });

  } catch (error) {
    console.error(
      "Delete Registration Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
