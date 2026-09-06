import Venue from "../models/Venue.js";
import { askVenueAI } from "../ai/venueAgent.js";

// ==========================================
// HELPERS
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
// FACILITY ALIAS NORMALIZATION
// ==========================================

const normalizeFacility = (value) => {
  const facility = normalize(value);

  const aliases = {
    wifi: "wifi",
    "wi fi": "wifi",
    "wi-fi": "wifi",

    projector: "projector",
    "projector screen": "projector",

    "audio system": "audio",
    audio: "audio",

    microphone: "microphone",
    "wireless microphone": "microphone",
    mic: "microphone",

    parking: "parking",
    "free parking": "parking",

    ac: "air conditioning",
    "air conditioning": "air conditioning",
    "air conditioner": "air conditioning",

    whiteboard: "whiteboard",
    stage: "stage",
    catering: "catering",
  };

  return aliases[facility] || facility;
};

// ==========================================
// FACILITY MATCH
// ==========================================

const facilityMatches = (
  requiredFacility,
  availableFacility
) => {
  const required =
    normalizeFacility(requiredFacility);

  const available =
    normalizeFacility(availableFacility);

  if (!required || !available) {
    return false;
  }

  if (required === available) {
    return true;
  }

  if (
    required.includes(available) ||
    available.includes(required)
  ) {
    return true;
  }

  const requiredWords =
    required.split(" ");

  const availableWords =
    available.split(" ");

  return requiredWords.every(
    (requiredWord) =>
      availableWords.some(
        (availableWord) =>
          availableWord.includes(requiredWord) ||
          requiredWord.includes(availableWord)
      )
  );
};

// ==========================================
// CHECK ALL REQUIRED FACILITIES
// ==========================================

const hasAllRequiredFacilities = (
  venue,
  requirements
) => {
  if (
    !requirements.facilities ||
    requirements.facilities.length === 0
  ) {
    return true;
  }

  const venueFacilities =
    venue.facilities || [];

  return requirements.facilities.every(
    (requiredFacility) =>
      venueFacilities.some(
        (availableFacility) =>
          facilityMatches(
            requiredFacility,
            availableFacility
          )
      )
  );
};

// ==========================================
// CALCULATE VENUE SCORE
// ==========================================

const calculateVenueScore = (
  venue,
  requirements
) => {
  let score = 0;

  // CAPACITY
  if (requirements.capacity) {
    const requiredCapacity =
      Number(requirements.capacity);

    const venueCapacity =
      Number(venue.capacity || 0);

    if (
      venueCapacity >= requiredCapacity
    ) {
      score += 40;

      const extraCapacity =
        venueCapacity -
        requiredCapacity;

      const extraPercentage =
        extraCapacity /
        requiredCapacity;

      if (extraPercentage <= 0.25) {
        score += 10;
      } else if (
        extraPercentage <= 0.5
      ) {
        score += 5;
      }
    } else {
      const shortage =
        requiredCapacity -
        venueCapacity;

      const shortagePercentage =
        shortage /
        requiredCapacity;

      if (shortagePercentage <= 0.10) {
        score += 30;
      } else if (
        shortagePercentage <= 0.20
      ) {
        score += 20;
      } else if (
        shortagePercentage <= 0.40
      ) {
        score += 10;
      }
    }
  } else {
    score += 20;
  }

  // LOCATION
  if (
    requirements.location &&
    requirements.location.trim()
  ) {
    const requestedLocation =
      normalize(
        requirements.location
      );

    const venueLocation =
      normalize(venue.location);

    if (
      venueLocation.includes(
        requestedLocation
      ) ||
      requestedLocation.includes(
        venueLocation
      )
    ) {
      score += 20;
    }
  } else {
    score += 10;
  }

  // VENUE TYPE
  if (
    requirements.venueType &&
    requirements.venueType.trim()
  ) {
    const requestedType =
      normalize(
        requirements.venueType
      );

    const venueType =
      normalize(venue.venueType);

    if (
      venueType.includes(
        requestedType
      ) ||
      requestedType.includes(
        venueType
      )
    ) {
      score += 15;
    }
  } else {
    score += 10;
  }

  // FACILITIES
  if (
    requirements.facilities &&
    requirements.facilities.length > 0
  ) {
    const matchedFacilities =
      requirements.facilities.filter(
        (requiredFacility) =>
          (venue.facilities || []).some(
            (availableFacility) =>
              facilityMatches(
                requiredFacility,
                availableFacility
              )
          )
      ).length;

    const totalFacilities =
      requirements.facilities.length;

    const facilityPercentage =
      matchedFacilities /
      totalFacilities;

    if (facilityPercentage === 1) {
      score += 20;
    } else if (
      facilityPercentage >= 0.75
    ) {
      score += 15;
    } else if (
      facilityPercentage >= 0.5
    ) {
      score += 10;
    } else if (
      facilityPercentage > 0
    ) {
      score += 5;
    }
  } else {
    score += 10;
  }

  return score;
};

// ==========================================
// CHECK EXACT MATCH
// ==========================================

const isExactMatch = (
  venue,
  requirements
) => {
  if (requirements.capacity) {
    if (
      Number(venue.capacity || 0) <
      Number(requirements.capacity)
    ) {
      return false;
    }
  }

  if (
    requirements.location &&
    requirements.location.trim()
  ) {
    const requestedLocation =
      normalize(
        requirements.location
      );

    const venueLocation =
      normalize(venue.location);

    if (
      !venueLocation.includes(
        requestedLocation
      ) &&
      !requestedLocation.includes(
        venueLocation
      )
    ) {
      return false;
    }
  }

  if (
    requirements.venueType &&
    requirements.venueType.trim()
  ) {
    const requestedType =
      normalize(
        requirements.venueType
      );

    const venueType =
      normalize(venue.venueType);

    if (
      !venueType.includes(
        requestedType
      ) &&
      !requestedType.includes(
        venueType
      )
    ) {
      return false;
    }
  }

  if (
    !hasAllRequiredFacilities(
      venue,
      requirements
    )
  ) {
    return false;
  }

  return true;
};

// ==========================================
// VENUE AGENT CHAT
// POST /api/venue-agent/chat
// ==========================================

export const venueAgentChat = async (
  req,
  res
) => {
  try {
    const { message } = req.body;

    if (
      !message ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    // ==========================================
    // EXTRACT REQUIREMENTS
    // ==========================================

    const extractionInstruction = `
The organizer sent this venue request:

"${message}"

Extract the venue requirements from the organizer's message.

The organizer will provide the session/event details directly in the request.

Return ONLY valid JSON in this exact format:

{
  "title": string or null,
  "capacity": number or null,
  "location": string or null,
  "venueType": string or null,
  "facilities": [],
  "startTime": string or null,
  "endTime": string or null,
  "sessionType": string or null

Allowed sessionType values are ONLY:
"Workshop",
"Talk",
"Panel",
"Keynote",
"Presentation",
"Networking",
"Other"

If the user's request does not clearly match one of these,
return "Other".
}

Rules:

- Extract only information actually provided or clearly implied.
- Do not invent requirements.
- If something is unknown, return null.
- facilities must always be an array.
- Use simple facility names such as:
  "WiFi",
  "Projector",
  "Parking",
  "Audio System",
  "Microphone",
  "Air Conditioning",
  "Stage",
  "Whiteboard",
  "Catering"
- Extract date and time information into startTime and endTime.
- Preserve the actual requested date.
- Do not use any event database date or time.
- Do not include markdown.
- Do not include explanations.
`;

    const extractionResponse =
      await askVenueAI(
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

      requirements.capacity =
        requirements.capacity
          ? Number(
              requirements.capacity
            )
          : null;

      requirements.facilities =
        Array.isArray(
          requirements.facilities
        )
          ? requirements.facilities
          : [];
    } catch (error) {
      console.log(
        "Venue requirement parsing error:",
        extractionResponse
      );

      return res.status(200).json({
        success: true,
        message:
          "I understood your request, but I couldn't determine the venue requirements clearly. Please mention the session title, capacity, facilities, date, and timing.",
        venues: [],
      });
    }

    // ==========================================
    // GET ALL ACTIVE VENUES
    // ==========================================

    const allVenues =
      await Venue.find({
        status: "Active",
      }).lean();

    if (!allVenues.length) {
      return res.status(200).json({
        success: true,
        message:
          "I couldn't find any venues in the venue database yet. Please add some venues and I'll help you find the best match.",
        venues: [],
        requirements,
      });
    }

    // ==========================================
    // SCORE ALL VENUES
    // ==========================================

    const scoredVenues =
      allVenues.map((venue) => {
        const matchScore =
          calculateVenueScore(
            venue,
            requirements
          );

        const exactMatch =
          isExactMatch(
            venue,
            requirements
          );

        return {
          ...venue,
          matchScore,
          exactMatch,
        };
      });

    // ==========================================
    // SORT
    // ==========================================

    scoredVenues.sort((a, b) => {
      if (
        a.exactMatch &&
        !b.exactMatch
      ) {
        return -1;
      }

      if (
        !a.exactMatch &&
        b.exactMatch
      ) {
        return 1;
      }

      return (
        b.matchScore -
        a.matchScore
      );
    });

    const recommendedVenues =
      scoredVenues.slice(0, 6);

    // ==========================================
    // RESULT TYPE
    // ==========================================

    const exactMatches =
      recommendedVenues.filter(
        (venue) => venue.exactMatch
      );

    let recommendationType;

    if (exactMatches.length > 0) {
      recommendationType =
        "EXACT_MATCH";
    } else {
      const bestScore =
        recommendedVenues[0]
          ?.matchScore || 0;

      recommendationType =
        bestScore >= 60
          ? "CLOSE_MATCH"
          : "BEST_AVAILABLE";
    }

    // ==========================================
    // BOOKING DATA
    // ==========================================

    const venuesWithBookingData =
      recommendedVenues.map(
        (venue) => ({
          ...venue,

          bookingData: {
            title:
              requirements.title ||
              "",

            startTime:
              requirements.startTime ||
              "",

            endTime:
              requirements.endTime ||
              "",

            expectedAttendance:
              requirements.capacity ||
              "",

            requiredFacilities:
              requirements.facilities ||
              [],

            sessionType:
              requirements.sessionType ||
              "",
          },
        })
      );

    // ==========================================
    // FINAL AI RESPONSE
    // ==========================================

    let responseInstruction = "";

    if (
      recommendationType ===
      "EXACT_MATCH"
    ) {
      responseInstruction = `
Matching venues were found.

Recommend the best option first and briefly explain why it matches.
Do not claim that the venue is booked.
`;
    } else if (
      recommendationType ===
      "CLOSE_MATCH"
    ) {
      responseInstruction = `
No venue satisfies every requirement exactly.

Say:
"I couldn't find an exact match, but I found some close alternatives based on your requirements."

Mention the most important difference and recommend the closest option first.

Do not tell the organizer to try again.
`;
    } else {
      responseInstruction = `
No exact or particularly close match was found.

Say:
"I couldn't find a close match, but here are the best available options in the venue database."

Recommend the best available venue first.
Do not invent information.
`;
    }

    const finalResponse =
      await askVenueAI(`
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

Recommended venues:

${JSON.stringify(
  venuesWithBookingData.map(
    (venue) => ({
      name: venue.name,
      capacity: venue.capacity,
      location: venue.location,
      venueType:
        venue.venueType,
      facilities:
        venue.facilities,
      matchScore:
        venue.matchScore,
      exactMatch:
        venue.exactMatch,
    })
  ),
  null,
  2
)}

${responseInstruction}

IMPORTANT:

- Never say a venue is booked.
- Never invent venue details.
- Never invent availability.
- Never tell the user to repeatedly change parameters.
- Recommend the best option first.
- Be concise and helpful.
- Use clean Markdown formatting.
`);

    return res.status(200).json({
      success: true,
      message: finalResponse,
      venues:
        venuesWithBookingData,
      requirements,
      recommendationType,
    });
  } catch (error) {
    console.error(
      "Venue Agent Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Something went wrong with the Venue Agent.",
    });
  }
};