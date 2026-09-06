import mongoose from "mongoose";

const speakerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      default: "",
    },

    organization: {
      type: String,
      default: "",
    },

    designation: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    expertise: {
      type: [String],
      default: [],
    },

    topics: {
      type: [String],
      default: [],
    },

    sessionPreferences: {
      type: [String],
      default: [],
    },

    availability: [
      {
        date: {
          type: Date,
          required: true,
        },

        startTime: {
          type: String,
          required: true,
        },

        endTime: {
          type: String,
          required: true,
        },
      },
    ],

    status: {
      type: String,
      enum: [
        "Available",
        "Assigned",
        "Unavailable",
      ],
      default: "Available",
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

export default mongoose.model("Speaker", speakerSchema);