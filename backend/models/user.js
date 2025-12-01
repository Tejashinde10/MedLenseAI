import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, requred: true },
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["student", "faculty"], default: "student" },
});
// const userShemaLogin = new Schema({
//   email: { type: String, unique: true },
//   password: String,
// });

export default mongoose.model("User", userSchema);
