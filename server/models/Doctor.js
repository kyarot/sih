import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String },
  experience: { type: String }, // e.g., "12 years"
  bio: { type: String },
  certifications: { type: [String], default: [] },
  hospital: { type: String },
  license: { type: String },
  languages: { type: [String], default: [] },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  availability: { type: String }, // e.g., "Mon - Fri, 9:00 AM - 5:00 PM"
  rating: { type: Number, default: 0 },
  patients: { type: Number, default: 0 },
  uniqueKey: { type: String, required: true, unique: true }, // login credential
  is_online: { type: Boolean, default: false }, // availability
}, { timestamps: true });

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
