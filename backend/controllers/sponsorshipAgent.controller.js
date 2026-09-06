import Sponsor from "../models/Sponsor.js";
import { askSponsorshipAI } from "../ai/sponsorshipAgent.js";

// ==========================================
// SPONSORSHIP AGENT CHAT
// POST /api/sponsorship-agent/chat
// ==========================================

export const sponsorshipAgentChat = async (
  req,
  res
) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    // ==========================================
    // GET SPONSORS
    // ==========================================

    const sponsors = await Sponsor.find({})
      .lean();

    if (!sponsors.length) {
      return res.status(200).json({
        success: true,
        message:
          "There are currently no sponsors in the database.",
        sponsors: [],
      });
    }

    // ==========================================
    // CALCULATE USEFUL METRICS
    // ==========================================

    const totalSponsors = sponsors.length;

    const pendingDeliverables =
      sponsors.flatMap((sponsor) =>
        (sponsor.deliverables || [])
          .filter(
            (item) =>
              item.status !== "Completed"
          )
          .map((item) => ({
            sponsor:
              sponsor.name,
            deliverable:
              item.name,
            status:
              item.status,
          }))
      );

    const pendingPayments =
      sponsors
        .filter(
          (sponsor) =>
            Number(
              sponsor.pendingAmount || 0
            ) > 0
        )
        .map((sponsor) => ({
          name: sponsor.name,
          pendingAmount:
            sponsor.pendingAmount,
        }));

    const highestEngagementSponsor =
      [...sponsors].sort(
        (a, b) =>
          (
            Number(
              b.attendeeInteractions || 0
            ) +
            Number(
              b.boothVisits || 0
            ) +
            Number(
              b.socialMediaEngagement || 0
            )
          ) -
          (
            Number(
              a.attendeeInteractions || 0
            ) +
            Number(
              a.boothVisits || 0
            ) +
            Number(
              a.socialMediaEngagement || 0
            )
          )
      )[0];

    // ==========================================
    // AI
    // ==========================================

    const instruction = `
Organizer request:

"${message}"

Sponsor database:

${JSON.stringify(
  sponsors,
  null,
  2
)}

Calculated information:

Total sponsors:
${totalSponsors}

Pending deliverables:
${JSON.stringify(
  pendingDeliverables,
  null,
  2
)}

Sponsors with pending payments:
${JSON.stringify(
  pendingPayments,
  null,
  2
)}

Highest engagement sponsor:

${JSON.stringify(
  highestEngagementSponsor
    ? {
        name:
          highestEngagementSponsor.name,
        boothVisits:
          highestEngagementSponsor.boothVisits,
        attendeeInteractions:
          highestEngagementSponsor.attendeeInteractions,
        socialMediaEngagement:
          highestEngagementSponsor.socialMediaEngagement,
      }
    : null,
  null,
  2
)}

Analyze the organizer's request and provide
a concise answer based only on the supplied data.

If the organizer asks for recommendations,
identify the most relevant sponsors based on
their actual data.

Do not invent information.
`;

    const response =
      await askSponsorshipAI(
        instruction
      );

    return res.status(200).json({
      success: true,
      message: response,
      sponsors,
      analytics: {
        totalSponsors,
        pendingDeliverables,
        pendingPayments,
        highestEngagementSponsor:
          highestEngagementSponsor
            ? highestEngagementSponsor.name
            : null,
      },
    });
  } catch (error) {
    console.error(
      "Sponsorship Agent Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Something went wrong with the Sponsorship Agent.",
    });
  }
};