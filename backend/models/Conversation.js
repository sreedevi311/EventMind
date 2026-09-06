import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },

    currentFieldIndex: {
      type: Number,
      default: -1,
    },

    collectedFields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },

    status: {
        type: String,
        enum: [
            "SELECTING_EVENT",
            "COLLECTING_DETAILS",
            "READY_FOR_REGISTRATION",
            "REGISTRATION_COMPLETED",
        ],
        default: "SELECTING_EVENT",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Conversation", conversationSchema);