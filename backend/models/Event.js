import mongoose from "mongoose";

const registrationFieldSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "text",
        "email",
        "phone",
        "number",
        "dropdown",
        "multiselect",
        "date",
        "textarea",
        "url",
      ],
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    options: [String],
    validation: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    aiHints: [String],
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    category: String,

    organizer: {
      id: String,
      name: String,
      email: String,
    },

    venue: {
      name: String,
      address: String,
      city: String,
      state: String,
      country: String,
    },

    startDate: Date,
    endDate: Date,
    registrationDeadline: Date,

    capacity: Number,
    registeredCount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed"],
      default: "Upcoming",
    },

    registrationFields: [registrationFieldSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Event", eventSchema);