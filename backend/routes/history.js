import express from "express";
import Report from "../models/report.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Save report
router.post("/save-history", protect, async (req, res) => {
  try {
    const report = new Report({
      user: req.user._id, // ⬅️ save user ID
      image: req.body.image,
      explanation: req.body.explanation,
      precautions: req.body.precautions,
      ocr_text: req.body.ocr_text,
      caption: req.body.caption,
    });

    await report.save();
    res.json({ message: "History saved", report });
  } catch (error) {
    console.error("Save history error:", error);
    res.status(500).json({ error: "Failed to save history" });
  }
});

// Get history of logged-in user ONLY
router.get("/history/me", protect, async (req, res) => {
  try {
    const history = await Report.find({ user: req.user._id }).sort({
      timestamp: -1,
    });

    res.json(history);
  } catch (error) {
    console.error("History fetch error:", error);
    res.status(500).json({ error: "Failed to load history" });
  }
});

// Get single report (ONLY if it belongs to user)
router.get("/history/:id", protect, async (req, res) => {
  try {
    const item = await Report.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!item) return res.status(404).json({ error: "Not found" });

    res.json(item);
  } catch (error) {
    console.error("Single report fetch error:", error);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

export default router;
