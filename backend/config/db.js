import mongoose from "mongoose";

// Option 1: Hardcoded URI (quick fix)
const MONGO_URI =
  "mongodb+srv://shruti:shruti2005@cluster0.sokr5l5.mongodb.net/auth-validator";

// Option 2: Use environment variable (better for production)
// const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected ✅: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed ❌", error);
    process.exit(1);
  }
};

export default connectDB;
