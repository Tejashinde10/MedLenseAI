import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: String, // you can later change to ObjectId if you link to User model
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: false,
    },
    // 🔹 New field: whether it's a text document or an image
    type: {
      type: String,
      enum: ["document", "image"],
      default: "document",
    },
    // 🔹 New field: AI-generated caption (for images only)
    caption: {
      type: String,
      default: null,
    },
    // 🔹 New field: model used for AI analysis
    modelUsed: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model("Document", documentSchema);
export default Document;
