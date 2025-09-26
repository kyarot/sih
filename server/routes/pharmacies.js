import express from "express";
import {
  deletePharmacy,
  getPharmacyById,
  getPharmacyByUid,
  registerPharmacy,
  updatePharmacy,
  updatePharmacyLocation,
  updatePharmacyStatus
} from "../controllers/pharmacyController.js";
import verifyToken from "../middleware/verifyToken.js";
import Patient from "../models/Patient.js";
import Pharmacy from "../models/Pharmacy.js";
import Drug from "../models/Drug.js";
import Prescription from "../models/Prescription.js";
const router = express.Router();
// ✅ Nearby Pharmacies
import mongoose from "mongoose";
function escapeRegex(text = "") {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// router.get("/nearby/:patientId", async (req, res) => {
//   try {
//     const { patientId } = req.params;
//     if (!mongoose.isValidObjectId(patientId)) {
//       return res.status(400).json({ success: false, message: "Invalid patientId" });
//     }
//     console.log("patientId", patientId);
//     const patient = await Patient.findById(patientId);
//     if (!patient || !patient.location || !patient.location.coordinates) {
//       return res.status(400).json({ success: false, message: "Patient location not found" });
//     }

//     const [lng, lat] = patient.location.coordinates;
// console.log(lng,lat);
//     const pharmacies = await Pharmacy.find({
//       isOnline: true,
//       location: {
//         $near: {
//           $geometry: { type: "Point", coordinates: [lng, lat] },
//           $maxDistance: 5000, // within 5km radius
//         },
//       },
//     }).limit(5);

//     res.json({ success: true, pharmacies });
//   } catch (err) {
//     console.error("Nearby Pharmacies Error:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });


// Get by ID

router.get("/nearby/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;
    const {
      prescriptionId,
      maxDistance = 5000,
      limit = 5,
      fullMatch = "true",
    } = req.query;

    // validate patientId
    if (!mongoose.isValidObjectId(patientId)) {
      return res.status(400).json({ success: false, message: "Invalid patientId" });
    }

    // fetch patient with location
    const patient = await Patient.findById(patientId).lean();
    if (!patient || !patient.location || !patient.location.coordinates) {
      return res.status(400).json({ success: false, message: "Patient location not found" });
    }
    const [lng, lat] = patient.location.coordinates;

    // basic nearby pharmacies (online only)
    const pharmacies = await Pharmacy.find({
      isOnline: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: Number(maxDistance),
        },
      },
    })
      .limit(Number(limit))
      .lean();

    // if no prescriptionId supplied => return nearby pharmacies as before
    if (!prescriptionId) {
      return res.json({ success: true, pharmacies });
    }

    // validate prescriptionId
    if (!mongoose.isValidObjectId(String(prescriptionId))) {
      return res.status(400).json({ success: false, message: "Invalid prescriptionId" });
    }

    // load prescription
    const prescription = await Prescription.findById(prescriptionId).lean();
    if (!prescription || !Array.isArray(prescription.medicines) || prescription.medicines.length === 0) {
      return res.status(404).json({ success: false, message: "Prescription not found or has no medicines" });
    }

    // build required medicines list: normalize name + parse numeric qty fallback to 1
    const requiredMeds = prescription.medicines
      .map((m) => {
        const name = String(m.name || "").trim();
        // try to extract integer qty from the prescription quantity string (e.g. "10", "2 tablets", "1x10")
        const qtyStr = String(m.quantity ?? "");
        const mnum = qtyStr.match(/(\d+)/);
        const requiredQty = mnum ? parseInt(mnum[1], 10) : 1;
        return { name, requiredQty };
      })
      .filter((r) => r.name.length > 0);

    if (requiredMeds.length === 0) {
      return res.status(400).json({ success: false, message: "No valid medicines in prescription" });
    }

    // For each nearby pharmacy check availability
    const results = [];

    for (const pharm of pharmacies) {
      const matchedMedicines = [];
      const missingMedicines = [];

      // For each required medicine, sum all drug batches for that pharmacy and compare
      for (const reqMed of requiredMeds) {
        // exact-name match (case-insensitive) first
        let drugs = await Drug.find({
          pharmacyId: pharm._id,
          name: { $regex: new RegExp("^" + escapeRegex(reqMed.name) + "$", "i") },
        }).lean();

        // fallback: partial match by name or brand if exact not found
        if ((!drugs || drugs.length === 0)) {
          drugs = await Drug.find({
            pharmacyId: pharm._id,
            $or: [
              { name: { $regex: new RegExp(escapeRegex(reqMed.name), "i") } },
              { brand: { $regex: new RegExp(escapeRegex(reqMed.name), "i") } },
            ],
          }).lean();
        }

        // sum available quantity across batches (handles multiple batches)
        const availableQty = drugs.reduce((s, d) => s + (Number(d.quantity) || 0), 0);

        if (availableQty >= reqMed.requiredQty && availableQty > 0) {
          matchedMedicines.push({
            name: reqMed.name,
            requiredQty: reqMed.requiredQty,
            availableQty,
            drugs, // includes batch-level info (price, expiryDate, barcode) if client wants to display
          });
        } else {
          missingMedicines.push({
            name: reqMed.name,
            requiredQty: reqMed.requiredQty,
            availableQty,
            drugsCount: drugs.length,
          });

          // if we require a full match we can stop early for this pharmacy
          if (String(fullMatch).toLowerCase() === "true") break;
        }
      }

      const hasAll = missingMedicines.length === 0;

      // if fullMatch is true, only include pharmacies that satisfy all meds
      if (String(fullMatch).toLowerCase() === "true" && !hasAll) {
        continue;
      }

      // otherwise include pharmacy with metadata about matched/missing meds
      results.push({
        ...pharm,
        matchedMedicines,
        missingMedicines,
        hasAllMedicines: hasAll,
      });
    }

    return res.json({ success: true, pharmacies: results });
  } catch (err) {
    console.error("Nearby Pharmacies Error:", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

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
