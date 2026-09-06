import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    eventId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Event",
  default: null,
},
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    sessionType: {
      type: String,
      enum: [
        "Workshop",
        "Talk",
        "Panel",
        "Keynote",
        "Presentation",
        "Networking",
        "Other",
      ],
      default: "Talk",
    },

    topic: {
      type: String,
      default: "",
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    expectedAttendance: {
      type: Number,
      default: 0,
      min: 0,
    },

    actualAttendance: {
      type: Number,
      default: 0,
      min: 0,
    },

    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      default: null,
    },

    speakerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Speaker",
      default: null,
    },

    requiredFacilities: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: [
        "Scheduled",
        "Ongoing",
        "Completed",
        "Cancelled",
      ],
      default: "Scheduled",
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    feedbackCount: {
      type: Number,
      default: 0,
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Session", sessionSchema);