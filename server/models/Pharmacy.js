import mongoose from "mongoose";

const pharmacySchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true },      // Firebase UID
    ownerUid: { type: String, required: true },               // duplicate for clarity

    name: { type: String, required: true },
    email: { type: String, default: null },
    phone: { type: String, default: null },
    address: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    pincode: { type: String, default: null },
    licenseNumber: { type: String, required: true, unique: true },
    licenseImageURL: { type: String, default: null },
    openingHours: { type: String, default: null },
    services: { type: [String], default: [] },
    isOnline: { type: Boolean, default: false },
    // 📍 new location field
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
  },
  { timestamps: true }
);

const Pharmacy = mongoose.model("Pharmacy", pharmacySchema);
export default Pharmacy;
