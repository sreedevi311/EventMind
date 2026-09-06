import Registration from "../models/Registration.js";
import nodemailer from "nodemailer";

// ==========================================
// CHECK-IN
// POST /api/checkin
// ==========================================
export const checkIn = async (req, res) => {
  try {
    let { registrationId, location } = req.body;

    // ------------------------------------------
    // Validate registrationId
    // ------------------------------------------
    if (!registrationId) {
      return res.status(400).json({
        success: false,
        message: "registrationId is required.",
      });
    }

    // ------------------------------------------
    // Create mail transporter
    // ------------------------------------------
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ------------------------------------------
    // Parse QR Code
    // QR contains:
    // {
    //   registrationId,
    //   eventId,
    //   userId
    // }
    // ------------------------------------------
    try {
      const qrData = JSON.parse(registrationId);

      registrationId = qrData.registrationId;
    } catch (error) {
      // QR may already contain plain registrationId
    }

    console.log("Actual registrationId:", registrationId);

    // ------------------------------------------
    // Find registration
    // ------------------------------------------
    const registration = await Registration.findOne({
      registrationId,
    })
      .populate("userId", "name email")
      .populate("eventId", "title venue");

    // ------------------------------------------
    // Invalid QR
    // ------------------------------------------
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Invalid QR Code.",
      });
    }

    // ------------------------------------------
    // Check cancellation
    // ------------------------------------------
    if (registration.registrationStatus === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Registration has been cancelled.",
      });
    }

    // ------------------------------------------
    // Prevent duplicate check-in
    // ------------------------------------------
    if (registration.checkIn?.checkedIn === true) {
      return res.status(400).json({
        success: false,
        message: "Attendee has already checked in.",
        data: {
          registrationId: registration.registrationId,
          checkedInAt: registration.checkIn.checkedInAt,
          location: registration.checkIn.location,
        },
      });
    }

    // ------------------------------------------
    // Check-in timestamp
    // ------------------------------------------
    const checkInDate = new Date();

    // ------------------------------------------
    // Update Registration
    // ------------------------------------------
    registration.registrationStatus = "CHECKED_IN";

    registration.checkIn = {
      checkedIn: true,
      checkedInAt: checkInDate,
      checkedInBy: req.user?.id || null,
      location: location || "",
    };

    // ------------------------------------------
    // Add registration timeline entry
    // ------------------------------------------
    registration.registrationTimeline.push({
      status: "CHECKED_IN",
      timestamp: checkInDate,
    });

    // ------------------------------------------
    // Save registration
    // ------------------------------------------
    await registration.save();

    // ------------------------------------------
    // Send check-in confirmation email
    // ------------------------------------------
    await transporter.sendMail({
      from: `"EventMind" <${process.env.EMAIL_USER}>`,
      to: registration.userId.email,
      subject: `Check-in Successful - ${registration.eventId.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          
          <h2>Check-in Successful ✅</h2>

          <p>Dear ${registration.userId.name},</p>

          <p>
            You have successfully checked in to the event
            <strong>${registration.eventId.title}</strong>.
          </p>

          <p>
            <strong>Date:</strong>
            ${checkInDate.toLocaleDateString("en-IN")}
            <br />

            <strong>Time:</strong>
            ${checkInDate.toLocaleTimeString("en-IN")}
            <br />

            <strong>Location:</strong>
            ${location || "Not specified"}
          </p>

          <p>
            Your attendance has been successfully recorded.
          </p>

          <p>
            Thank you for attending the event!
          </p>

          <p>
            Regards,<br />
            <strong>EventMind Team</strong>
          </p>

        </div>
      `,
    });

    // ------------------------------------------
    // Success response
    // ------------------------------------------
    return res.status(200).json({
      success: true,
      message: "Check-in successful.",
      data: {
        registrationId: registration.registrationId,
        attendee: registration.userId.name,
        event: registration.eventId.title,
        checkedInAt: registration.checkIn.checkedInAt,
        location: registration.checkIn.location,
      },
    });
  } catch (error) {
    console.error("Check-in error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET CHECK-IN STATUS
// GET /api/checkin/:registrationId
// ==========================================
export const getCheckInStatus = async (req, res) => {
  try {
    const registration = await Registration.findOne({
      registrationId: req.params.registrationId,
    })
      .populate("userId", "name email")
      .populate("eventId", "title venue");

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        registrationId: registration.registrationId,
        attendee: registration.userId,
        event: registration.eventId,
        status: registration.registrationStatus,
        checkIn: registration.checkIn,
      },
    });
  } catch (error) {
    console.error("Get check-in status error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET ALL CHECK-INS
// GET /api/checkin
// ==========================================
export const getAllCheckIns = async (req, res) => {
  try {
    const registrations = await Registration.find({
      "checkIn.checkedIn": true,
    })
      .populate("userId", "name email")
      .populate("eventId", "title venue")
      .sort({
        "checkIn.checkedInAt": -1,
      });

    return res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    console.error("Get all check-ins error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

