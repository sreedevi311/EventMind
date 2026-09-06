import mongoose from "mongoose";

const checkInSchema = new mongoose.Schema(
  {
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    checkInDate: Date,

    checkInTime: String,

    location: String,

    gate: String,

    volunteer: String,

    status: {
      type: String,
      enum: ["Checked In", "Checked Out"],
      default: "Checked In",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("CheckIn", checkInSchema);