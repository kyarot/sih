import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUID: { type: String, required: true },
    role: { type: String, enum: ["Doctor", "Patient", "Pharmacy"], required: true },
    email: { type: String },
    phone: { type: String },
    uniqueCode: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
