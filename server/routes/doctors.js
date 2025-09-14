import express from "express";
import { doctorLogin, getAllDoctors, getDoctorById } from "../controllers/doctorController.js";

const router = express.Router();

// Doctor login route
router.post("/login", doctorLogin);

// All doctors list
router.get("/", getAllDoctors);

// ✅ Unique doctor dashboard (doctor/:doctorId)
router.get("/:doctorId", getDoctorById);

export default router;
