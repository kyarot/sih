import express from "express";
import {
  registerPharmacy,
  getPharmacyById,
  getPharmacyByUid,
  updatePharmacy,
  deletePharmacy,
} from "../controllers/pharmacyController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Get by ID
router.get("/:id", getPharmacyById);

// Get by UID (owner) — fallback to token if missing
router.get("/owner/:uid", verifyToken, getPharmacyByUid);

// Protected routes
router.post("/register-pharmacy", verifyToken, registerPharmacy);
router.put("/:id", verifyToken, updatePharmacy);
router.delete("/:id", verifyToken, deletePharmacy);

export default router;
