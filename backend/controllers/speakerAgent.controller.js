import Speaker from "../models/Speaker.js";
import Session from "../models/Session.js";
import nodemailer from "nodemailer";
import { askSpeakerAI } from "../ai/speakerAgent.js";

// ==========================================
// HELPERS
// ==========================================

const ALLOWED_SESSION_TYPES = [
  "Workshop",
  "Talk",
  "Panel",
  "Keynote",
  "Presentation",
  "Networking",
  "Other",
];

const normalizeSessionType = (value) => {
  if (!value) return "Other";

  const normalized = String(value)
    .trim()
    .toLowerCase();

  return (
    ALLOWED_SESSION_TYPES.find(
      (type) =>
        type.toLowerCase() === normalized
    ) || "Other"
  );
};

// ==========================================
// SPEAKER AGENT CHAT
// POST /api/speaker-agent/chat
// ==========================================

export const speakerAgentChat = async (req, res) => {
  try {
    const { message } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    // ==========================================
    // EXTRACT REQUIREMENTS
    // ==========================================

    const extractionInstruction = `
Organizer request:

"${message}"

Extract the speaker requirements from the organizer's message.

Return ONLY valid JSON in this exact format:

{
  "title": null,
  "expertise": [],
  "topics": [],
  "sessionType": null,
  "startTime": null,
  "endTime": null,
  "expectedAttendance": null
}

Rules:

- Extract only information actually provided.
- Do not invent information.
- If something is unknown, return null.
- expertise must always be an array.
- topics must always be an array.
- startTime should contain the requested date and time if provided.
- endTime should contain the requested date and time if provided.
- expectedAttendance must be a number or null.
- sessionType must be one of:
  Workshop,
  Talk,
  Panel,
  Keynote,
  Presentation,
  Networking,
  Other
- If the organizer says something such as "conference", use "Other".
- Do not use "General".
- Do not include markdown.
- Do not include explanations.
`;

    const extractionResponse =
      await askSpeakerAI(
        extractionInstruction
      );

    // ==========================================
    // PARSE REQUIREMENTS
    // ==========================================

    let requirements;

    try {
      const cleanedResponse =
        extractionResponse
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

      requirements =
        JSON.parse(cleanedResponse);

      requirements.expertise =
        Array.isArray(
          requirements.expertise
        )
          ? requirements.expertise
          : [];

      requirements.topics =
        Array.isArray(
          requirements.topics
        )
          ? requirements.topics
          : [];

      requirements.sessionType =
        normalizeSessionType(
          requirements.sessionType
        );

      requirements.expectedAttendance =
        requirements.expectedAttendance
          ? Number(
              requirements.expectedAttendance
            )
          : null;
    } catch (error) {
      console.log(
        "Speaker requirement parsing error:",
        extractionResponse
      );

      return res.status(200).json({
        success: true,
        message:
          "I understood your request, but I couldn't determine the speaker requirements clearly. Please mention the topic, expertise, session type, date, timing and expected attendance.",
        speakers: [],
      });
    }

    // ==========================================
    // GET ALL AVAILABLE SPEAKERS
    // ==========================================

    let speakers =
      await Speaker.find({
        status: {
          $ne: "Unavailable",
        },
      })
        .limit(50)
        .lean();

    if (!speakers.length) {
      return res.status(200).json({
        success: true,
        message:
          "I couldn't find any available speakers in the speaker database.",
        speakers: [],
        requirements,
      });
    }

    // ==========================================
    // MATCH SPEAKERS
    // ==========================================

    const requestedExpertise =
      requirements.expertise.map(
        (item) =>
          String(item)
            .trim()
            .toLowerCase()
      );

    const requestedTopics =
      requirements.topics.map(
        (item) =>
          String(item)
            .trim()
            .toLowerCase()
      );

    const requestedSessionType =
      String(
        requirements.sessionType || ""
      )
        .trim()
        .toLowerCase();

    speakers = speakers
      .map((speaker) => {
        const expertise =
          (speaker.expertise || []).map(
            (item) =>
              String(item)
                .trim()
                .toLowerCase()
          );

        const topics =
          (speaker.topics || []).map(
            (item) =>
              String(item)
                .trim()
                .toLowerCase()
          );

        const preferences =
          (
            speaker.sessionPreferences ||
            []
          ).map(
            (item) =>
              String(item)
                .trim()
                .toLowerCase()
          );

        let matchScore = 0;

        // Expertise match
        requestedExpertise.forEach(
          (required) => {
            if (
              expertise.some(
                (item) =>
                  item.includes(required) ||
                  required.includes(item)
              )
            ) {
              matchScore += 3;
            }
          }
        );

        // Topic match
        requestedTopics.forEach(
          (required) => {
            if (
              topics.some(
                (item) =>
                  item.includes(required) ||
                  required.includes(item)
              )
            ) {
              matchScore += 2;
            }
          }
        );

        // Session preference match
        if (
          requestedSessionType &&
          preferences.some(
            (item) =>
              item.includes(
                requestedSessionType
              ) ||
              requestedSessionType.includes(
                item
              )
          )
        ) {
          matchScore += 2;
        }

        return {
          ...speaker,
          matchScore,
        };
      })
      .sort(
        (a, b) =>
          b.matchScore - a.matchScore
      )
      .slice(0, 10);

    // ==========================================
    // ADD ASSIGNMENT DATA
    // ==========================================

    const speakersWithAssignmentData =
      speakers.map((speaker) => ({
        ...speaker,

        assignmentData: {
          title:
            requirements.title || "",

          startTime:
            requirements.startTime || "",

          endTime:
            requirements.endTime || "",

          expectedAttendance:
            requirements.expectedAttendance ||
            "",

          sessionType:
            requirements.sessionType ||
            "Other",

          topic:
            requirements.topics?.[0] ||
            "",

          requiredExpertise:
            requirements.expertise || [],
        },
      }));

    // ==========================================
    // RECOMMENDATION TYPE
    // ==========================================

    const bestScore =
      speakersWithAssignmentData[0]
        ?.matchScore || 0;

    let recommendationType;

    if (bestScore >= 5) {
      recommendationType =
        "STRONG_MATCH";
    } else if (bestScore >= 2) {
      recommendationType =
        "CLOSE_MATCH";
    } else {
      recommendationType =
        "BEST_AVAILABLE";
    }

    // ==========================================
    // FINAL AI RESPONSE
    // ==========================================

    let responseInstruction = "";

    if (
      recommendationType ===
      "STRONG_MATCH"
    ) {
      responseInstruction = `
Strong speaker matches were found.

Recommend the best matching speaker first
and briefly explain why.
`;
    } else if (
      recommendationType ===
      "CLOSE_MATCH"
    ) {
      responseInstruction = `
No very strong match was found, but there are
some close alternatives.

Recommend the closest speaker first and
mention the relevant matching expertise or topic.
`;
    } else {
      responseInstruction = `
No strong match was found.

Recommend the best available speaker from
the database without inventing information.
`;
    }

    const finalResponse =
      await askSpeakerAI(`
Organizer request:

"${message}"

Extracted requirements:

${JSON.stringify(
  requirements,
  null,
  2
)}

Recommendation type:

${recommendationType}

Recommended speakers:

${JSON.stringify(
  speakersWithAssignmentData.map(
    (speaker) => ({
      name: speaker.name,
      organization:
        speaker.organization,
      designation:
        speaker.designation,
      expertise:
        speaker.expertise,
      topics:
        speaker.topics,
      sessionPreferences:
        speaker.sessionPreferences,
      matchScore:
        speaker.matchScore,
    })
  ),
  null,
  2
)}

${responseInstruction}

IMPORTANT:

- Never claim that a speaker has been assigned.
- Never claim that a speaker is available at the requested time unless availability has actually been checked.
- Never invent speaker details.
- Never invent availability.
- Recommend the strongest match first.
- Keep the response concise.
- Do not use ** or ## markdown.
`);

    return res.status(200).json({
      success: true,

      message: finalResponse,

      speakers:
        speakersWithAssignmentData,

      requirements,

      recommendationType,
    });
  } catch (error) {
    console.error(
      "Speaker Agent Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Something went wrong with the Speaker Agent.",
    });
  }
};

// ==========================================
// ASSIGN SPEAKER
// POST /api/speaker-agent/assign/:speakerId
// ==========================================

export const assignSpeaker = async (
  req,
  res
) => {
  try {
    const { speakerId } =
      req.params;

    const {
      title,
      startTime,
      endTime,
      sessionType,
      topic,
      expectedAttendance,
      requiredFacilities,
      description,
      notes,
    } = req.body;

    // ==========================================
    // REQUIRED FIELDS
    // ==========================================

    if (
      !speakerId ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "speakerId, startTime and endTime are required.",
      });
    }

    // ==========================================
    // FIND SPEAKER
    // ==========================================

    const speaker =
      await Speaker.findById(
        speakerId
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
      return res.status(400).json({
        success: false,
        message:
          "Speaker is currently unavailable.",
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
          "Start time must be before end time.",
      });
    }

    // ==========================================
    // CHECK DECLARED SPEAKER AVAILABILITY
    // ==========================================

    if (
      speaker.availability &&
      speaker.availability.length > 0
    ) {
      const requestedYear =
        requestedStart.getFullYear();

      const requestedMonth =
        requestedStart.getMonth();

      const requestedDay =
        requestedStart.getDate();

      const requestedStartMinutes =
        requestedStart.getHours() *
          60 +
        requestedStart.getMinutes();

      const requestedEndMinutes =
        requestedEnd.getHours() *
          60 +
        requestedEnd.getMinutes();

      const hasAvailability =
        speaker.availability.some(
          (slot) => {
            const slotDate =
              new Date(slot.date);

            const sameDate =
              slotDate.getFullYear() ===
                requestedYear &&
              slotDate.getMonth() ===
                requestedMonth &&
              slotDate.getDate() ===
                requestedDay;

            if (!sameDate) {
              return false;
            }

            const [
              startHour,
              startMinute,
            ] = String(
              slot.startTime
            )
              .split(":")
              .map(Number);

            const [
              endHour,
              endMinute,
            ] = String(
              slot.endTime
            )
              .split(":")
              .map(Number);

            const slotStartMinutes =
              startHour * 60 +
              startMinute;

            const slotEndMinutes =
              endHour * 60 +
              endMinute;

            return (
              requestedStartMinutes >=
                slotStartMinutes &&
              requestedEndMinutes <=
                slotEndMinutes
            );
          }
        );

      if (!hasAvailability) {
        return res.status(409).json({
          success: false,
          message:
            `Speaker is not available during the selected time (${requestedStart.toLocaleDateString(
              "en-IN"
            )}, ${requestedStart.toLocaleTimeString(
              "en-IN",
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )} - ${requestedEnd.toLocaleTimeString(
              "en-IN",
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )}).`,
        });
      }
    }

    // ==========================================
    // CHECK EXISTING SESSION CONFLICT
    // ==========================================

    const conflict =
      await Session.findOne({
        speakerId: speaker._id,

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
      return res.status(409).json({
        success: false,
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
    // NORMALIZE SESSION TYPE
    // ==========================================

    const normalizedSessionType =
      normalizeSessionType(
        sessionType
      );

    // ==========================================
    // CREATE SESSION
    // ==========================================

    const session =
      await Session.create({
        title:
          title?.trim() ||
          topic?.trim() ||
          "Speaker Session",

        description:
          description || "",

        sessionType:
          normalizedSessionType,

        topic:
          topic || "",

        startTime:
          requestedStart,

        endTime:
          requestedEnd,

        expectedAttendance:
          Number(
            expectedAttendance
          ) || 0,

        actualAttendance: 0,

        venueId: null,

        speakerId:
          speaker._id,

        requiredFacilities:
          Array.isArray(
            requiredFacilities
          )
            ? requiredFacilities
            : [],

        status:
          "Scheduled",

        notes:
          notes || "",
      });

    // ==========================================
    // UPDATE SPEAKER STATUS
    // ==========================================

    speaker.status = "Assigned";

    await speaker.save();

    // ==========================================
    // SEND EMAIL
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

      await transporter.sendMail({
        from:
          `"EventMind" <${process.env.EMAIL_USER}>`,

        to: speaker.email,

        subject:
          `Session Assignment - ${
            title ||
            topic ||
            "Event Session"
          }`,

        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              max-width: 700px;
              margin: auto;
              padding: 25px;
            "
          >

            <h2 style="color:#4F46E5;">
              Speaker Assignment Confirmed 🎤
            </h2>

            <p>
              Dear <strong>${speaker.name}</strong>,
            </p>

            <p>
              You have been successfully assigned
              to the following session.
            </p>

            <hr>

            <h3>Session Details</h3>

            <p>
              <strong>Session:</strong>
              ${
                title ||
                topic ||
                "Event Session"
              }
            </p>

            <p>
              <strong>Topic:</strong>
              ${topic || "Not specified"}
            </p>

            <p>
              <strong>Date:</strong>
              ${requestedStart.toLocaleDateString(
                "en-IN"
              )}
            </p>

            <p>
              <strong>Time:</strong>
              ${requestedStart.toLocaleTimeString(
                "en-IN",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
              -
              ${requestedEnd.toLocaleTimeString(
                "en-IN",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </p>

            <p>
              <strong>Session Type:</strong>
              ${normalizedSessionType}
            </p>

            <p>
              <strong>Expected Attendance:</strong>
              ${Number(
                expectedAttendance
              ) || 0}
            </p>

            <hr>

            <p>
              Please be available at the scheduled time.
            </p>

            <p>
              Regards,<br>
              <strong>EventMind Team</strong>
            </p>

          </div>
        `,
      });

      emailSent = true;
    } catch (emailError) {
      console.error(
        "Speaker Email Error:",
        emailError.message
      );
    }

    // ==========================================
    // SUCCESS
    // ==========================================

    return res.status(201).json({
      success: true,

      message:
        "Speaker assigned successfully.",

      emailSent,

      data: {
        session,

        speaker: {
          id: speaker._id,
          name: speaker.name,
          email: speaker.email,
        },
      },
    });
  } catch (error) {
    console.error(
      "Assign Speaker Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Speaker assignment failed.",
    });
  }
};