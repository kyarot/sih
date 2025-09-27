import express from "express";
import { doctorLogin, getAllDoctors, getDoctorById, updateDoctorProfile,updateDoctorStatus } from "../controllers/doctorController.js";

const router = express.Router();

// Doctor login route
router.post("/login", doctorLogin);

// All doctors list
router.get("/", getAllDoctors);

// Unique doctor dashboard (doctor/:doctorId)
router.get("/:doctorId", getDoctorById);

// ✅ Update doctor profile (PUT)
router.put("/:doctorId", updateDoctorProfile);

// update online/offline status
router.put("/:id/status", updateDoctorStatus);

export default router;
