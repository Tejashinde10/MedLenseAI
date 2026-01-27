import mongoose from "mongoose";

const verificationRecordSchema = new mongoose.Schema(
  {
    // which document was verified
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    // who did the verification (optional: could be null if public scan)
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // method of verification (QR code scan, API check, manual review, etc.)
    verificationMethod: {
      type: String,
      enum: ["qr_scan", "api_check", "manual", "other"],
      default: "qr_scan",
    },
    // was it authentic or not?
    status: {
      type: String,
      enum: ["authentic", "not_authentic", "pending"],
      required: true,
    },
    // notes or reason (why failed, etc.)
    remarks: {
      type: String,
      trim: true,
    },
    // optional: blockchain tx id or hash at time of verification
    blockchainTxId: {
      type: String,
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const VerificationRecord = mongoose.model(
  "VerificationRecord",
  verificationRecordSchema
);

export default VerificationRecord;
