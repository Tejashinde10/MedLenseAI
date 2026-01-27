import express from "express";
import multer from "multer";
import path from "path";

import { fileURLToPath } from "url";
import { uploadDocument } from "../controllers/documentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Ensure __dirname works with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// ✅ Accept both documents and images
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type. Upload PDF, DOCX, or image only."));
  }
};

const upload = multer({ storage, fileFilter });

/* -------------------------------------------------------------
   ✅ UPDATED: Protect this route so only logged-in users upload
------------------------------------------------------------- */
router.post("/upload", protect, upload.single("file"), uploadDocument);

/* -------------------------------------------------------------
   🔻 DO NOT REMOVE — your commented code stays exactly as is
------------------------------------------------------------- */

// router.post("/upload", upload.single("file"), (req, res) => {
//   console.log("Test upload file:", req.file);
//   res.json({
//     received: !!req.file,
//     file: req.file,
//     body: req.body,
//   });
// });

// router.post("/upload", upload.single("file"), (req, res) => {
//   console.log("req.file:", req.file); // Should show file object
//   console.log("req.body:", req.body); // Any extra fields

//   res.json({
//     received: !!req.file,
//     file: req.file?.filename || "",
//     body: req.body,
//   });
// });

export default router;
