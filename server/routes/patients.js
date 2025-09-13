import express from "express";
import Patient from "../models/Patient.js";

const router = express.Router();

// @route   POST /api/patients/register-patient
// @desc    Register new patient (after signup) - max 5 profiles per account
// @access  Public
// @route   POST /api/patients/register-patient
// @desc    Register new patient (family profile under accountId)
// @access  Public
router.post("/register-patient", async (req, res) => {
  try {
    let { uid, code, accountId, email, phone, name, gender } = req.body;

    if (!accountId) {
      return res.status(400).json({ success: false, message: "accountId is required" });
    }

    // Ensure max 5 profiles per account
    const count = await Patient.countDocuments({ accountId });
    if (count >= 5) {
      return res.status(400).json({ success: false, message: "Maximum 5 profiles allowed per account" });
    }

    // ✅ Ensure uid is unique
    let existingUid = await Patient.findOne({ uid });
    if (existingUid) {
      uid = `UID-${Date.now()}`; // regenerate uid
    }

    // ✅ Ensure code is unique
    let existingCode = await Patient.findOne({ code });
    if (existingCode) {
      code = `PAT-${Date.now()}`;
    }

    const newPatient = new Patient({
      uid,
      code,
      accountId,
      email: email || null,
      phone: phone || null,
      name: name || null,
      gender: gender || null,
    });

    await newPatient.save();
    res.status(201).json({ success: true, patient: newPatient });
  } catch (err) {
    console.error("Patient Registration Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/patients/family/:accountId
// @desc    Get all family profiles linked to an account
// @access  Public
router.get("/family/:accountId", async (req, res) => {
  try {
    const profiles = await Patient.find({ accountId: req.params.accountId });
    res.json(profiles); // ✅ return plain array
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/patients/profile/:uid
// @desc    Get patient profile by UID
// @access  Public
router.get("/profile/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const patient = await Patient.findOne({ uid });
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// @route   PUT /api/patients/profile/:uid
// @desc    Update patient profile
// @access  Public
router.put("/profile/:uid", async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { uid: req.params.uid },
      { $set: req.body },
      { new: true }
    );
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }
    res.json({ success: true, patient });
  } catch (err) {
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
