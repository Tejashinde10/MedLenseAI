import fs from "fs/promises";
import axios from "axios";
import FormData from "form-data";
import Document from "../models/document.js";
import extractText from "../utils/extractText.js";
import preprocessText from "../utils/preprocess.js";
import { calculateSimilarity } from "../utils/similarity.js";

export const uploadDocument = async (req, res) => {
  try {
    // 🚨 MUST be protected route
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: "Unauthorized — login required." });
    }

    const userId = req.user.id; // ✅ FIX: always take actual logged-in user

    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const file = req.file;
    console.log("📂 File received:", file.originalname);

    let cleanText = "";
    let docType = "";
    let caption = "";
    let extractedText = "";

    // 🔍 Check file type
    if (file.mimetype.startsWith("image/")) {
      docType = "image";

      try {
        console.log("🚀 Sending image to FastAPI (caption + OCR)...");

        const formData = new FormData();
        formData.append(
          "file",
          await fs.readFile(file.path),
          file.originalname
        );

        // 🧠 Send image to Python API for both caption and OCR
        const response = await axios.post(
          "http://127.0.0.1:5000/analyze",
          formData,
          {
            headers: formData.getHeaders(),
          }
        );

        console.log("✅ Python API response:", response.data);

        caption = response.data.caption || "No caption generated.";
        extractedText = response.data.extracted_text || "";
        cleanText = preprocessText(extractedText);
      } catch (apiErr) {
        console.error("❌ Python API error:", apiErr.message);
        caption = "Error analyzing image.";
        extractedText = "";
      }
    } else {
      // 📄 Handle text-based documents (PDF, DOCX, etc.)
      docType = "document";
      const rawText = await extractText(file.path, file.mimetype);
      cleanText = preprocessText(rawText);
    }

    // 💾 Save to MongoDB with USER ID
    const newDoc = await Document.create({
      user: userId, // ✅ IMPORTANT
      title: file.originalname,
      filename: file.filename,
      text: cleanText,
      type: docType,
      caption: caption || null,
    });

    // 🔁 Run similarity only for text documents
    let results = [];
    if (docType === "document") {
      const allDocs = await Document.find({
        user: userId, // ✅ USER SPECIFIC similarity
        _id: { $ne: newDoc._id },
        type: "document",
      });

      results = allDocs
        .map((d) => ({
          docId: d._id,
          title: d.title,
          score: calculateSimilarity(cleanText, d.text),
        }))
        .filter((r) => r.score > 0.2)
        .sort((a, b) => b.score - a.score);
    }

    // 🧹 Delete temporary file
    await fs.unlink(file.path);

    // ✅ Send response
    res.json({
      message:
        docType === "image"
          ? "🧠 Image analyzed successfully (Caption + OCR)"
          : "📄 Document uploaded successfully",
      submitted: newDoc._id,
      caption,
      extractedText,
      matches: results.slice(0, 5),
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ msg: err.message });
  }
};
