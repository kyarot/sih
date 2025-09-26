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
import Prescription from "../models/Prescription.js";
import Drug from "../models/Drug.js";
import mongoose from "mongoose";

const router = express.Router();

// helper to escape regex safely
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ✅ Nearby pharmacies with medicine check
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

    // basic nearby pharmacies
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

    // if no prescriptionId supplied => return nearby pharmacies
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

    // normalize medicines
    const requiredMeds = prescription.medicines
      .map((m) => {
        const name = String(m.name || "").trim();
        const qtyStr = String(m.quantity ?? "");
        const mnum = qtyStr.match(/(\d+)/);
        const requiredQty = mnum ? parseInt(mnum[1], 10) : 1;
        return { name, requiredQty };
      })
      .filter((r) => r.name.length > 0);

    if (requiredMeds.length === 0) {
      return res.status(400).json({ success: false, message: "No valid medicines in prescription" });
    }

    // check each pharmacy’s inventory
    const results = [];

    for (const pharm of pharmacies) {
      const matchedMedicines = [];
      const missingMedicines = [];

      for (const reqMed of requiredMeds) {
        let drugs = await Drug.find({
          pharmacyId: pharm._id,
          name: { $regex: new RegExp("^" + escapeRegex(reqMed.name) + "$", "i") },
        }).lean();

        if (!drugs || drugs.length === 0) {
          drugs = await Drug.find({
            pharmacyId: pharm._id,
            $or: [
              { name: { $regex: new RegExp(escapeRegex(reqMed.name), "i") } },
              { brand: { $regex: new RegExp(escapeRegex(reqMed.name), "i") } },
            ],
          }).lean();
        }

        const availableQty = drugs.reduce((s, d) => s + (Number(d.quantity) || 0), 0);

        if (availableQty >= reqMed.requiredQty && availableQty > 0) {
          matchedMedicines.push({
            name: reqMed.name,
            requiredQty: reqMed.requiredQty,
            availableQty,
            drugs,
          });
        } else {
          missingMedicines.push({
            name: reqMed.name,
            requiredQty: reqMed.requiredQty,
            availableQty,
            drugsCount: drugs.length,
          });

          if (String(fullMatch).toLowerCase() === "true") break;
        }
      }

      const hasAll = missingMedicines.length === 0;

      if (String(fullMatch).toLowerCase() === "true" && !hasAll) {
        continue;
      }

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

// ✅ Other routes
router.get("/:id", getPharmacyById);
router.put("/:id/status", updatePharmacyStatus);
router.get("/owner/:uid", verifyToken, getPharmacyByUid);
router.post("/update-location", updatePharmacyLocation);
router.post("/register-pharmacy", verifyToken, registerPharmacy);
router.put("/:id", verifyToken, updatePharmacy);
router.delete("/:id", verifyToken, deletePharmacy);

export default router;
