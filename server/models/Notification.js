// models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true }, // who receives
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    type: { type: String, enum: ["appointment", "general"], default: "appointment" },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
