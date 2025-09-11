import express from "express";
import Patient from "../models/Patient.js";

const router = express.Router();

// @route   POST /api/patients/register-patient
// @desc    Register new patient (after signup)
// @access  Public
router.post("/register-patient", async (req, res) => {
  try {
    const { uid, code, email, phone } = req.body;

    if (!uid || !code) {
      return res.status(400).json({ success: false, message: "UID and code are required" });
    }

    // Avoid duplicates
    const existing = await Patient.findOne({ uid });
    if (existing) {
      return res.status(400).json({ success: false, message: "Patient already registered" });
    }

    const newPatient = new Patient({ uid, code, email, phone });
    await newPatient.save();

    res.status(201).json({ success: true, patient: newPatient });
  } catch (err) {
    console.error("Patient Registration Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/patients/:code
// @desc    Get patient by unique code (for login check)
// @access  Public
router.get("/:code", async (req, res) => {
  try {
    const patient = await Patient.findOne({ code: req.params.code });
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }
    res.json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
