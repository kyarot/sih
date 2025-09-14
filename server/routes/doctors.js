import express from "express";
import { doctorLogin, getAllDoctors, getDoctorById, updateDoctorProfile } from "../controllers/doctorController.js";

const router = express.Router();

// Doctor login route
router.post("/login", doctorLogin);

// All doctors list
router.get("/", getAllDoctors);

// Unique doctor dashboard (doctor/:doctorId)
router.get("/:doctorId", getDoctorById);

// ✅ Update doctor profile (PUT)
router.put("/:doctorId", updateDoctorProfile);

export default router;
