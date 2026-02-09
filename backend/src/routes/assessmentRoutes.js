import express from "express";
import { authRequired } from "../middleware/auth.js";
import { assessRisk } from "../ai/triageEngine.js";
import { Assessment } from "../models/Assessment.js";

const router = express.Router();

router.post("/", authRequired, async (req, res) => {
  try {
    const { symptomText, selectedSymptoms, durationDays, severity, ageGroup } =
      req.body;

    if (
      typeof symptomText !== "string" ||
      typeof durationDays !== "number" ||
      typeof severity !== "number" ||
      !ageGroup
    ) {
      return res.status(400).json({
        message:
          "symptomText (string), durationDays (number), severity (number), and ageGroup are required"
      });
    }

    const aiResult = assessRisk({
      symptomText,
      selectedSymptoms: Array.isArray(selectedSymptoms)
        ? selectedSymptoms
        : [],
      durationDays,
      severity,
      ageGroup
    });

    const record = await Assessment.create({
      userId: req.user.id,
      symptomText,
      selectedSymptoms: Array.isArray(selectedSymptoms)
        ? selectedSymptoms
        : [],
      durationDays,
      severity,
      ageGroup,
      ...aiResult
    });

    res.json({
      id: record._id,
      riskLevel: aiResult.riskLevel,
      explanation: aiResult.explanation,
      possibleConditions: aiResult.possibleConditions,
      recommendedAction: aiResult.recommendedAction,
      actionType: aiResult.actionType,
      disclaimer:
        "This is NOT a diagnostic tool. It does not replace a medical professional. If you feel unsafe or very unwell, seek emergency care immediately."
    });
  } catch (err) {
    console.error("Assessment error", err);
    res.status(500).json({ message: "Failed to assess risk" });
  }
});

router.get("/history", authRequired, async (req, res) => {
  try {
    const history = await Assessment.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.json({ history });
  } catch (err) {
    console.error("History error", err);
    res.status(500).json({ message: "Failed to load history" });
  }
});

export default router;

