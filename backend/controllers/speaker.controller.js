import Speaker from "../models/Speaker.js";
import Session from "../models/Session.js";

// ==========================================
// NORMALIZE TEXT
// ==========================================

const normalize = (value) => {
  if (!value) return "";

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[-_&]/g, " ")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

// ==========================================
// CHECK SPEAKER TIME AVAILABILITY
// ==========================================

const isSpeakerAvailableAtTime = (
  speaker,
  startTime,
  endTime
) => {
  // If no availability slots are defined,
  // consider speaker available.
  if (
    !speaker.availability ||
    speaker.availability.length === 0
  ) {
    return true;
  }

  const requestedStart = new Date(startTime);
  const requestedEnd = new Date(endTime);

  const requestedYear =
    requestedStart.getFullYear();

  const requestedMonth =
    requestedStart.getMonth();

  const requestedDay =
    requestedStart.getDate();

  const requestedStartMinutes =
    requestedStart.getHours() * 60 +
    requestedStart.getMinutes();

  const requestedEndMinutes =
    requestedEnd.getHours() * 60 +
    requestedEnd.getMinutes();

  return speaker.availability.some((slot) => {
    const slotDate = new Date(slot.date);

    const sameDate =
      slotDate.getFullYear() === requestedYear &&
      slotDate.getMonth() === requestedMonth &&
      slotDate.getDate() === requestedDay;

    if (!sameDate) {
      return false;
    }

    const [
      startHour,
      startMinute,
    ] = slot.startTime
      .split(":")
      .map(Number);

    const [
      endHour,
      endMinute,
    ] = slot.endTime
      .split(":")
      .map(Number);

    const slotStartMinutes =
      startHour * 60 + startMinute;

    const slotEndMinutes =
      endHour * 60 + endMinute;

    return (
      requestedStartMinutes >=
        slotStartMinutes &&
      requestedEndMinutes <=
        slotEndMinutes
    );
  });
};

// ==========================================
// CREATE SPEAKER
// POST /api/speakers
// ==========================================

export const createSpeaker = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      phone,
      organization,
      designation,
      bio,
      expertise,
      topics,
      sessionPreferences,
      availability,
      notes,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message:
          "name and email are required.",
      });
    }

    // Check duplicate speaker globally
    const existingSpeaker =
      await Speaker.findOne({
        email,
      });

    if (existingSpeaker) {
      return res.status(400).json({
        success: false,
        message:
          "Speaker with this email already exists.",
      });
    }

    const speaker =
      await Speaker.create({
        name: name.trim(),
        email: email.trim(),
        phone: phone || "",
        organization:
          organization || "",
        designation:
          designation || "",
        bio: bio || "",
        expertise:
          expertise || [],
        topics:
          topics || [],
        sessionPreferences:
          sessionPreferences || [],
        availability:
          availability || [],
        notes:
          notes || "",
      });

    return res.status(201).json({
      success: true,
      message:
        "Speaker created successfully.",
      data: speaker,
    });
  } catch (error) {
    console.error(
      "Create Speaker Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET ALL SPEAKERS
// GET /api/speakers
// ==========================================

export const getAllSpeakers = async (
  req,
  res
) => {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status =
        req.query.status;
    }

    const speakers =
      await Speaker.find(filter)
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: speakers.length,
      data: speakers,
    });
  } catch (error) {
    console.error(
      "Get Speakers Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET SPEAKER BY ID
// GET /api/speakers/:id
// ==========================================

export const getSpeakerById =
  async (req, res) => {
    try {
      const speaker =
        await Speaker.findById(
          req.params.id
        );

      if (!speaker) {
        return res.status(404).json({
          success: false,
          message:
            "Speaker not found.",
        });
      }

      return res.status(200).json({
        success: true,
        data: speaker,
      });
    } catch (error) {
      console.error(
        "Get Speaker Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

// ==========================================
// UPDATE SPEAKER
// PUT /api/speakers/:id
// ==========================================

export const updateSpeaker =
  async (req, res) => {
    try {
      // Prevent eventId from being added
      // through update requests
      const {
        eventId,
        ...updateData
      } = req.body;

      const speaker =
        await Speaker.findByIdAndUpdate(
          req.params.id,
          updateData,
          {
            new: true,
            runValidators: true,
          }
        );

      if (!speaker) {
        return res.status(404).json({
          success: false,
          message:
            "Speaker not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Speaker updated successfully.",
        data: speaker,
      });
    } catch (error) {
      console.error(
        "Update Speaker Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

// ==========================================
// DELETE SPEAKER
// DELETE /api/speakers/:id
// ==========================================

export const deleteSpeaker =
  async (req, res) => {
    try {
      const speaker =
        await Speaker.findById(
          req.params.id
        );

      if (!speaker) {
        return res.status(404).json({
          success: false,
          message:
            "Speaker not found.",
        });
      }

      const assignedSession =
        await Session.findOne({
          speakerId: speaker._id,
          status: {
            $ne: "Cancelled",
          },
        });

      if (assignedSession) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot delete speaker because they are assigned to a session.",
        });
      }

      await Speaker.findByIdAndDelete(
        req.params.id
      );

      return res.status(200).json({
        success: true,
        message:
          "Speaker deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete Speaker Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

// ==========================================
// FIND SUITABLE SPEAKERS
// GET /api/speakers/search
// ==========================================

export const findSuitableSpeakers =
  async (req, res) => {
    try {
      const {
        expertise,
        topic,
        startTime,
        endTime,
      } = req.query;

      // ==========================================
      // BUILD SEARCH TERMS
      // ==========================================

      const searchTerms = [];

      if (expertise) {
        searchTerms.push(
          ...expertise
            .split(",")
            .map((item) =>
              normalize(item)
            )
            .filter(Boolean)
        );
      }

      if (topic) {
        searchTerms.push(
          normalize(topic)
        );
      }

      // ==========================================
      // GET AVAILABLE SPEAKERS
      // ==========================================

      let speakers =
        await Speaker.find({
          status: {
            $ne: "Unavailable",
          },
        }).lean();

      // ==========================================
      // FILTER BY EXPERTISE / TOPIC
      // ==========================================

      if (searchTerms.length > 0) {
        speakers =
          speakers.filter(
            (speaker) => {
              const speakerExpertise =
                (
                  speaker.expertise ||
                  []
                ).map(normalize);

              const speakerTopics =
                (
                  speaker.topics ||
                  []
                ).map(normalize);

              return searchTerms.some(
                (term) =>
                  speakerExpertise.some(
                    (item) =>
                      item.includes(term) ||
                      term.includes(item)
                  ) ||
                  speakerTopics.some(
                    (item) =>
                      item.includes(term) ||
                      term.includes(item)
                  )
              );
            }
          );
      }

      // ==========================================
      // FILTER BY REQUESTED TIME
      // ==========================================

      if (
        startTime &&
        endTime
      ) {
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
              "startTime must be before endTime.",
          });
        }

        const availableSpeakers =
          [];

        for (
          const speaker of speakers
        ) {
          // Check existing session conflict
          const conflict =
            await Session.findOne({
              speakerId:
                speaker._id,

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

          if (conflict) {
            continue;
          }

          // Check declared availability
          const available =
            isSpeakerAvailableAtTime(
              speaker,
              requestedStart,
              requestedEnd
            );

          if (available) {
            availableSpeakers.push(
              speaker
            );
          }
        }

        speakers =
          availableSpeakers;
      }

      return res.status(200).json({
        success: true,
        count: speakers.length,
        data: speakers,
      });
    } catch (error) {
      console.error(
        "Find Suitable Speakers Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

// ==========================================
// CHECK SPEAKER AVAILABILITY
// GET /api/speakers/:id/availability
// ==========================================

export const checkSpeakerAvailability =
  async (req, res) => {
    try {
      const {
        startTime,
        endTime,
      } = req.query;

      if (
        !startTime ||
        !endTime
      ) {
        return res.status(400).json({
          success: false,
          message:
            "startTime and endTime are required.",
        });
      }

      const speaker =
        await Speaker.findById(
          req.params.id
        );

      if (!speaker) {
        return res.status(404).json({
          success: false,
          message:
            "Speaker not found.",
        });
      }

      if (
        speaker.status ===
        "Unavailable"
      ) {
        return res.status(200).json({
          success: true,
          available: false,
          message:
            "Speaker is unavailable.",
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
            "startTime must be before endTime.",
        });
      }

      // ==========================================
      // CHECK SESSION CONFLICT
      // ==========================================

      const conflict =
        await Session.findOne({
          speakerId:
            speaker._id,

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

      if (conflict) {
        return res.status(200).json({
          success: true,
          available: false,
          message:
            "Speaker is already assigned to another session during this time.",
          conflict: {
            sessionId:
              conflict._id,
            title:
              conflict.title,
            startTime:
              conflict.startTime,
            endTime:
              conflict.endTime,
          },
        });
      }

      // ==========================================
      // CHECK DECLARED AVAILABILITY
      // ==========================================

      const available =
        isSpeakerAvailableAtTime(
          speaker,
          requestedStart,
          requestedEnd
        );

      if (!available) {
        return res.status(200).json({
          success: true,
          available: false,
          message:
            "Speaker is not available during the requested time.",
        });
      }

      return res.status(200).json({
        success: true,
        available: true,
        message:
          "Speaker is available.",
        conflict: null,
      });
    } catch (error) {
      console.error(
        "Speaker Availability Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };