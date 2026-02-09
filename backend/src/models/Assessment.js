import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    symptomText: { type: String, required: true },
    selectedSymptoms: [{ type: String }],
    durationDays: { type: Number, required: true },
    severity: { type: Number, min: 1, max: 10, required: true },
    ageGroup: {
      type: String,
      enum: ["child", "adult", "senior"],
      required: true
    },
    // AI outputs
    riskLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], required: true },
    explanation: [{ type: String }],
    possibleConditions: [{ type: String }],
    recommendedAction: { type: String },
    actionType: {
      type: String,
      enum: ["HOME", "DOCTOR", "EMERGENCY"],
      required: true
    },
    rulesMatched: [{ type: String }]
  },
  { timestamps: true }
);

export const Assessment = mongoose.model("Assessment", assessmentSchema);

