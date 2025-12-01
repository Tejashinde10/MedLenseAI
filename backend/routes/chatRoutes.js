import express from "express";
import axios from "axios";

const router = express.Router();

//  ---------- FIXED ROUTE ----------
router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Google API key missing" });
    }

    //  ---------- FIXED MODEL NAME + API VERSION ----------
    const geminiURL =
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=" +
      apiKey;

    //  ---------- FIXED REQUEST FORMAT ----------
    const response = await axios.post(geminiURL, {
      contents: [
        {
          parts: [{ text: message }],
        },
      ],
    });

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response.";

    res.json({ reply });
  } catch (error) {
    console.error("Chat API Error:", error.response?.data || error.message);

    res.status(500).json({
      error: "Chatbot error",
      details: error.response?.data || error.message,
    });
  }
});

export default router;
