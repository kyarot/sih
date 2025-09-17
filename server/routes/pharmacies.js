import express from "express";
import {
  registerPharmacy,
  getPharmacyById,
  getPharmacyByUid,
  updatePharmacy,
  deletePharmacy,
  updatePharmacyLocation,
  updatePharmacyStatus
} from "../controllers/pharmacyController.js";
import verifyToken from "../middleware/verifyToken.js";
import Patient from "../models/Patient.js";
import Pharmacy from "../models/Pharmacy.js";
const router = express.Router();
// ✅ Nearby Pharmacies
import mongoose from "mongoose";

router.get("/nearby/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!mongoose.isValidObjectId(patientId)) {
      return res.status(400).json({ success: false, message: "Invalid patientId" });
    }

    const patient = await Patient.findById(patientId);
    if (!patient || !patient.location || !patient.location.coordinates) {
      return res.status(400).json({ success: false, message: "Patient location not found" });
    }

    const [lng, lat] = patient.location.coordinates;

    const pharmacies = await Pharmacy.find({
      isOnline: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: 5000, // within 5km radius
        },
      },
    }).limit(5);

    res.json({ success: true, pharmacies });
  } catch (err) {
    console.error("Nearby Pharmacies Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// Get by ID
router.get("/:id", getPharmacyById);
router.put("/:id/status", updatePharmacyStatus);

// Get by UID (owner) — fallback to token if missing
router.get("/owner/:uid", verifyToken, getPharmacyByUid);
router.post("/update-location",updatePharmacyLocation)
// Protected routes
router.post("/register-pharmacy", verifyToken, registerPharmacy);
router.put("/:id", verifyToken, updatePharmacy);
router.delete("/:id", verifyToken, deletePharmacy);

export default router;
