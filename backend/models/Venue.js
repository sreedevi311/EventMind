import mongoose from "mongoose";

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    venueType: {
      type: String,
      enum: [
        "Hall",
        "Conference Room",
        "Auditorium",
        "Meeting Room",
        "Open Space",
        "Classroom",
        "Other",
      ],
      default: "Hall",
    },

    facilities: {
      type: [String],
      default: [],
    },

    availability: {
      type: String,
      enum: ["Available", "Occupied", "Unavailable"],
      default: "Available",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
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

export default mongoose.model("Venue", venueSchema);