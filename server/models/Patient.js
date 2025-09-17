import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true }, // unique per profile
    code: { type: String, required: true, unique : false }, // patient code
    accountId: { type: String, required: true }, // main Firebase UID

    // Basic info (filled later in profile)
    name: { type: String, default: null },
    age: { type: Number, default: null },
    gender: { type: String, enum: ["Male", "Female", "Other", null], default: null },

    // Contact
    email: { type: String, default: null },
    phone: { type: String, default: null },

    // Health info (also filled later)
    weight: { type: Number, default: null },
    height: { type: Number, default: null },
    bloodGroup: { type: String, default: null },
    address: { type: String, default: null },

    // Emergency contact (later)
    emergencyContact: {
      name: { type: String, default: null },
      phone: { type: String, default: null },
      relation: { type: String, default: null },
    },
    // 📍 new location field
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
  },
  { timestamps: true }
);

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
