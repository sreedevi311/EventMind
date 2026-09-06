import mongoose from "mongoose";

const deliverableSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },

    dueDate: {
      type: Date,
    },
  },
  { _id: false }
);

const sponsorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    organization: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    package: {
      type: String,
      enum: [
        "Platinum",
        "Gold",
        "Silver",
        "Bronze",
        "Other",
      ],
      default: "Other",
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    pendingAmount: {
      type: Number,
      default: 0,
    },

    deliverables: {
      type: [deliverableSchema],
      default: [],
    },

    brandingRequirements: {
      type: [String],
      default: [],
    },

    brandingCompleted: {
      type: Boolean,
      default: false,
    },

    boothAllocated: {
      type: Boolean,
      default: false,
    },

    boothNumber: {
      type: String,
      default: "",
    },

    boothVisits: {
      type: Number,
      default: 0,
    },

    attendeeInteractions: {
      type: Number,
      default: 0,
    },

    leadsGenerated: {
      type: Number,
      default: 0,
    },

    sessionParticipation: {
      type: Number,
      default: 0,
    },

    promotionalActivity: {
      type: Number,
      default: 0,
    },

    socialMediaEngagement: {
      type: Number,
      default: 0,
    },

    satisfactionScore: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    conversionRate: {
      type: Number,
      default: 0,
    },

    roiIndicator: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Active", "Completed", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

// Automatically calculate pending payment
sponsorSchema.pre("save", function () {
  this.pendingAmount =
    Math.max(
      0,
      Number(this.totalAmount || 0) -
        Number(this.paidAmount || 0)
    );
});

export default mongoose.model("Sponsor", sponsorSchema);