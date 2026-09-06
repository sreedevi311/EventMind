import mongoose from "mongoose";

const responseSchema = new mongoose.Schema(
  {
    key: String,
    label: String,
    value: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    status: String,
    timestamp: Date,
  },
  { _id: false }
);

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    registrationId: {
      type: String,
      required: true,
      unique: true,
    },

    registrationSource: {
      type: String,
      enum: [
        "WEBSITE",
        "GOOGLE_FORM",
        "EXCEL_UPLOAD",
        "API",
        "CHAT_AGENT",
      ],
      default: "CHAT_AGENT",
    },

    responses: [responseSchema],

    registrationStatus: {
      type: String,
      enum: [
        "REGISTERED",
        "CONFIRMED",
        "CHECKED_IN",
        "CANCELLED",
      ],
      default: "REGISTERED",
    },

    qrCode: {
      type: String,
      default: "",
    },

    registrationTimeline: {
      type: [timelineSchema],
      default: [
        {
          status: "REGISTERED",
          timestamp: new Date(),
        },
      ],
    },

    checkIn: {
      checkedIn: {
        type: Boolean,
        default: false,
      },

      checkedInAt: {
        type: Date,
        default: null,
      },

      checkedInBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      location: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Registration", registrationSchema);