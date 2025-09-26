import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true },
    code: { type: String, required: true },
    accountId: { type: String, required: true },

    name: { type: String, default: null },
    age: { type: Number, default: null },
    gender: { type: String, enum: ["Male", "Female", "Other", null], default: null },

    email: { type: String, default: null },
    phone: { type: String, default: null },

    weight: { type: Number, default: null },
    height: { type: Number, default: null },
    bloodGroup: { type: String, default: null },
    address: { type: String, default: null },

    emergencyContact: {
      name: { type: String, default: null },
      phone: { type: String, default: null },
      relation: { type: String, default: null },
    },

    // 📍 GeoJSON location
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
  },
  { timestamps: true }
);

// ✅ Add 2dsphere index
patientSchema.index({ location: "2dsphere" });

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
