import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  image: String,
  explanation: String,
  precautions: String,
  ocr_text: String,
  caption: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Report", ReportSchema);
