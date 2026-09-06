import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Technical",
        "Registration",
        "Venue",
        "Speaker",
        "Medical",
        "Security",
        "Power",
        "Network",
        "Audio/Video",
        "Crowd",
        "Equipment",
        "VIP",
        "Other",
      ],
      default: "Other",
    },

    severity: {
      type: String,
      enum: [
        "Low",
        "Medium",
        "High",
        "Critical",
      ],
      default: "Medium",
    },

    priority: {
      type: String,
      enum: [
        "Low",
        "Medium",
        "High",
        "Critical",
      ],
      default: "Medium",
    },

    affectedArea: {
      type: String,
      default: "",
      trim: true,
    },

    responsibleTeam: {
      type: String,
      default: "",
      trim: true,
    },

    recommendedAction: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Reported",
        "Investigating",
        "In Progress",
        "Resolved",
        "Closed",
      ],
      default: "Reported",
    },

    reportedBy: {
      type: String,
      default: "Event Coordinator",
    },

    resolutionNotes: {
      type: String,
      default: "",
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Incident",
  incidentSchema
);