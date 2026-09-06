import Venue from "../models/Venue.js";
import Session from "../models/Session.js";
import nodemailer from "nodemailer";

// ==========================================
// CREATE VENUE
// POST /api/venues
// ==========================================

export const createVenue = async (
  req,
  res
) => {
  try {
    const {
      name,
      location,
      capacity,
      venueType,
      facilities,
      notes,
    } = req.body;

    if (
      !name ||
      !location ||
      !capacity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "name, location and capacity are required.",
      });
    }

    const venue = await Venue.create({
      name,
      location,
      capacity,
      venueType,
      facilities:
        facilities || [],
      notes: notes || "",
    });

    return res.status(201).json({
      success: true,
      message:
        "Venue created successfully.",
      data: venue,
    });
  } catch (error) {
    console.error(
      "Create Venue Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET ALL VENUES
// GET /api/venues
// ==========================================

export const getAllVenues = async (
  req,
  res
) => {
  try {
    const venues =
      await Venue.find({})
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: venues.length,
      data: venues,
    });
  } catch (error) {
    console.error(
      "Get Venues Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET VENUE BY ID
// GET /api/venues/:id
// ==========================================

export const getVenueById = async (
  req,
  res
) => {
  try {
    const venue =
      await Venue.findById(
        req.params.id
      );

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: venue,
    });
  } catch (error) {
    console.error(
      "Get Venue Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE VENUE
// PUT /api/venues/:id
// ==========================================

export const updateVenue = async (
  req,
  res
) => {
  try {
    // Prevent eventId from being
    // added through an update request.
    const {
      eventId,
      ...updateData
    } = req.body;

    const venue =
      await Venue.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Venue updated successfully.",
      data: venue,
    });
  } catch (error) {
    console.error(
      "Update Venue Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// DELETE VENUE
// DELETE /api/venues/:id
// ==========================================

export const deleteVenue = async (
  req,
  res
) => {
  try {
    const venue =
      await Venue.findById(
        req.params.id
      );

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found.",
      });
    }

    const assignedSession =
      await Session.findOne({
        venueId: venue._id,
        status: {
          $ne: "Cancelled",
        },
      });

    if (assignedSession) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete venue because it is assigned to a session.",
      });
    }

    await Venue.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "Venue deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Venue Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// CHECK VENUE AVAILABILITY
// GET /api/venues/:id/availability
// ==========================================

export const checkVenueAvailability =
  async (req, res) => {
    try {
      const {
        startTime,
        endTime,
      } = req.query;

      if (!startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message:
            "startTime and endTime are required.",
        });
      }

      const requestedStart =
        new Date(startTime);

      const requestedEnd =
        new Date(endTime);

      if (
        isNaN(
          requestedStart.getTime()
        ) ||
        isNaN(
          requestedEnd.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid startTime or endTime.",
        });
      }

      if (
        requestedStart >=
        requestedEnd
      ) {
        return res.status(400).json({
          success: false,
          message:
            "startTime must be earlier than endTime.",
        });
      }

      const venue =
        await Venue.findById(
          req.params.id
        );

      if (!venue) {
        return res.status(404).json({
          success: false,
          message: "Venue not found.",
        });
      }

      const conflict =
        await Session.findOne({
          venueId: venue._id,

          status: {
            $ne: "Cancelled",
          },

          startTime: {
            $lt: requestedEnd,
          },

          endTime: {
            $gt: requestedStart,
          },
        });

      return res.status(200).json({
        success: true,
        available: !conflict,

        message: conflict
          ? "Venue is already booked during this time."
          : "Venue is available.",

        conflict: conflict
          ? {
              sessionId:
                conflict._id,
              title:
                conflict.title,
              startTime:
                conflict.startTime,
              endTime:
                conflict.endTime,
            }
          : null,
      });
    } catch (error) {
      console.error(
        "Venue Availability Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// ==========================================
// FIND SUITABLE VENUES
// GET /api/venues/search
// ==========================================

export const findSuitableVenues =
  async (req, res) => {
    try {
      const {
        capacity,
        facilities,
        startTime,
        endTime,
        location,
        venueType,
      } = req.query;

      if (!capacity) {
        return res.status(400).json({
          success: false,
          message:
            "capacity is required.",
        });
      }

      const requiredFacilities =
        facilities
          ? facilities
              .split(",")
              .map((item) =>
                item.trim()
              )
              .filter(Boolean)
          : [];

      const filter = {
        status: "Active",

        capacity: {
          $gte: Number(capacity),
        },

        facilities: {
          $all:
            requiredFacilities,
        },
      };

      if (location) {
        filter.location = {
          $regex: location,
          $options: "i",
        };
      }

      if (venueType) {
        filter.venueType = venueType;
      }

      const venues =
        await Venue.find(filter)
          .sort({
            capacity: 1,
          });

      let availableVenues =
        venues;

      // ==========================================
      // TIME CONFLICT CHECK
      // ==========================================

      if (
        startTime &&
        endTime
      ) {
        const start =
          new Date(startTime);

        const end =
          new Date(endTime);

        if (
          isNaN(start.getTime()) ||
          isNaN(end.getTime())
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid startTime or endTime.",
          });
        }

        const results = [];

        for (
          const venue of venues
        ) {
          const conflict =
            await Session.findOne({
              venueId: venue._id,

              status: {
                $ne: "Cancelled",
              },

              startTime: {
                $lt: end,
              },

              endTime: {
                $gt: start,
              },
            });

          if (!conflict) {
            results.push(
              venue
            );
          }
        }

        availableVenues =
          results;
      }

      return res.status(200).json({
        success: true,
        count:
          availableVenues.length,
        data:
          availableVenues,
      });
    } catch (error) {
      console.error(
        "Find Suitable Venues Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// ==========================================
// BOOK VENUE
// POST /api/venues/:id/book
// ==========================================

export const bookVenue = async (
  req,
  res
) => {
  try {
    const {
      title,
      description,
      sessionType,
      topic,
      startTime,
      endTime,
      expectedAttendance,
      speakerId,
      requiredFacilities,
      notes,
    } = req.body;

    const venueId =
      req.params.id;

    // ==========================================
    // REQUIRED FIELDS
    // ==========================================

    if (
      !title ||
      !title.trim() ||
      !startTime ||
      !endTime ||
      expectedAttendance ===
        undefined ||
      expectedAttendance ===
        null ||
      expectedAttendance === ""
    ) {
      return res.status(400).json({
        success: false,
        message:
          "title, startTime, endTime and expectedAttendance are required.",
      });
    }

    // ==========================================
    // FIND VENUE
    // ==========================================

    const venue =
      await Venue.findById(
        venueId
      );

    if (!venue) {
      return res.status(404).json({
        success: false,
        message:
          "Venue not found.",
      });
    }

    if (
      venue.status !== "Active"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Venue is currently inactive.",
      });
    }

    // ==========================================
    // CAPACITY CHECK
    // ==========================================

    if (
      Number(
        expectedAttendance
      ) > venue.capacity
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Venue capacity is ${venue.capacity}, but expected attendance is ${expectedAttendance}.`,
      });
    }

    // ==========================================
    // FACILITY CHECK
    // ==========================================

    const requestedFacilities =
      Array.isArray(
        requiredFacilities
      )
        ? requiredFacilities
        : [];

    const normalizeFacility = (
      facility
    ) =>
      String(facility)
        .trim()
        .toLowerCase();

    const venueFacilities =
      (
        venue.facilities ||
        []
      ).map(
        normalizeFacility
      );

    const missingFacilities =
      requestedFacilities.filter(
        (requiredFacility) => {
          const required =
            normalizeFacility(
              requiredFacility
            );

          return !venueFacilities.some(
            (availableFacility) =>
              availableFacility ===
                required ||
              availableFacility.includes(
                required
              ) ||
              required.includes(
                availableFacility
              )
          );
        }
      );

    if (
      missingFacilities.length >
      0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Venue does not have all required facilities.",
        missingFacilities,
      });
    }

    // ==========================================
    // DATE VALIDATION
    // ==========================================

    const requestedStart =
      new Date(startTime);

    const requestedEnd =
      new Date(endTime);

    if (
      isNaN(
        requestedStart.getTime()
      ) ||
      isNaN(
        requestedEnd.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid startTime or endTime.",
      });
    }

    if (
      requestedStart >=
      requestedEnd
    ) {
      return res.status(400).json({
        success: false,
        message:
          "startTime must be earlier than endTime.",
      });
    }

    // ==========================================
    // FINAL VENUE CONFLICT CHECK
    // ==========================================

    const venueConflict =
      await Session.findOne({
        venueId: venue._id,

        status: {
          $ne: "Cancelled",
        },

        startTime: {
          $lt: requestedEnd,
        },

        endTime: {
          $gt: requestedStart,
        },
      });

    if (venueConflict) {
      return res.status(409).json({
        success: false,
        message:
          "Venue is already booked during the requested time.",

        conflict: {
          sessionId:
            venueConflict._id,
          title:
            venueConflict.title,
          startTime:
            venueConflict.startTime,
          endTime:
            venueConflict.endTime,
        },
      });
    }

    // ==========================================
    // SPEAKER CONFLICT CHECK
    // ==========================================

    if (speakerId) {
      const speakerConflict =
        await Session.findOne({
          speakerId,

          status: {
            $ne: "Cancelled",
          },

          startTime: {
            $lt: requestedEnd,
          },

          endTime: {
            $gt: requestedStart,
          },
        });

      if (speakerConflict) {
        return res.status(409).json({
          success: false,
          message:
            "Selected speaker is already assigned to another session during this time.",

          conflict: {
            sessionId:
              speakerConflict._id,
            title:
              speakerConflict.title,
            startTime:
              speakerConflict.startTime,
            endTime:
              speakerConflict.endTime,
          },
        });
      }
    }

    // ==========================================
    // CREATE SESSION / VENUE BOOKING
    // ==========================================

    const session =
      await Session.create({
        title: title.trim(),

        description:
          description || "",

        sessionType: [
  "Workshop",
  "Talk",
  "Panel",
  "Keynote",
  "Presentation",
  "Networking",
  "Other",
].includes(sessionType)
  ? sessionType
  : "Other",

        topic:
          topic || "",

        startTime:
          requestedStart,

        endTime:
          requestedEnd,

        expectedAttendance:
          Number(
            expectedAttendance
          ),

        actualAttendance: 0,

        venueId:
          venue._id,

        speakerId:
          speakerId || null,

        requiredFacilities:
          requestedFacilities,

        status:
          "Scheduled",

        notes:
          notes || "",
      });

    // ==========================================
    // POPULATE DETAILS
    // ==========================================

    await session.populate([
      {
        path: "venueId",
        select:
          "name location capacity venueType facilities",
      },
      {
        path: "speakerId",
        select:
          "name email organization designation",
      },
    ]);

    // ==========================================
    // SEND CONFIRMATION EMAIL
    // ==========================================

    let emailSent = false;

    try {
      const transporter =
        nodemailer.createTransport({
          service: "gmail",

          auth: {
            user:
              process.env.EMAIL_USER,

            pass:
              process.env.EMAIL_PASS,
          },
        });

      const recipientEmail =
        req.user?.email;

      if (recipientEmail) {
        await transporter.sendMail({
          from:
            `"EventMind" <${process.env.EMAIL_USER}>`,

          to: recipientEmail,

          subject:
            `Venue Booking Confirmed - ${venue.name}`,

          html: `
            <div
              style="
                font-family: Arial, sans-serif;
                max-width: 700px;
                margin: auto;
                padding: 25px;
              "
            >

              <h2 style="color:#4f46e5;">
                Venue Booking Confirmed ✓
              </h2>

              <p>
                Your venue has been successfully booked.
              </p>

              <hr>

              <h3>Booking Details</h3>

              <table cellpadding="8">

                <tr>
                  <td><b>Booking Title</b></td>
                  <td>${session.title}</td>
                </tr>

                <tr>
                  <td><b>Venue</b></td>
                  <td>${venue.name}</td>
                </tr>

                <tr>
                  <td><b>Location</b></td>
                  <td>${venue.location}</td>
                </tr>

                <tr>
                  <td><b>Capacity</b></td>
                  <td>${venue.capacity}</td>
                </tr>

                <tr>
                  <td><b>Expected Attendance</b></td>
                  <td>${session.expectedAttendance}</td>
                </tr>

                <tr>
                  <td><b>Start</b></td>
                  <td>
                    ${requestedStart.toLocaleString(
                      "en-IN"
                    )}
                  </td>
                </tr>

                <tr>
                  <td><b>End</b></td>
                  <td>
                    ${requestedEnd.toLocaleString(
                      "en-IN"
                    )}
                  </td>
                </tr>

              </table>

              <br>

              <p>
                <b>Status:</b> Confirmed
              </p>

              <p>
                Thank you for using EventMind.
              </p>

              <p>
                Regards,<br>
                <b>EventMind Team</b>
              </p>

            </div>
          `,
        });

        emailSent = true;
      }
    } catch (emailError) {
      console.error(
        "Venue booking email error:",
        emailError.message
      );
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(201).json({
      success: true,
      message:
        "Venue booked successfully.",
      emailSent,

      data: {
        session,
        venue,
      },
    });
  } catch (error) {
    console.error(
      "Book Venue Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};