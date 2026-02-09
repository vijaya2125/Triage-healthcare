import express from "express";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

// Mock endpoint representing an email/SMS alert trigger.
router.post("/mock", authRequired, async (req, res) => {
  try {
    const { riskLevel, message } = req.body || {};
    console.log(
      "[MOCK ALERT] High risk assessment alert",
      JSON.stringify(
        {
          userId: req.user?.id,
          riskLevel,
          message
        },
        null,
        2
      )
    );

    res.json({
      ok: true,
      message:
        "Mock alert triggered. In a production system this would send an SMS/email to emergency contacts or a healthcare provider."
    });
  } catch (err) {
    console.error("Mock alert error", err);
    res.status(500).json({ message: "Failed to trigger mock alert" });
  }
});

export default router;

