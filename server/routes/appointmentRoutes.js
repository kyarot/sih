import express from "express";
import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";

const router = express.Router();

/**
 * GET all appointments of a patient using UID
 * Frontend sends `uid` instead of ObjectId
 */
router.get("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    // Find patient ObjectId from UID
    const patient = await Patient.findOne({ uid });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const appointments = await Appointment.find({ patientId: patient._id })
      .populate("doctorId", "name specialization contact experience available rating")
      .populate("patientId", "name age gender email phone"); // include patient info

    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST a new appointment using patient UID
 * Frontend sends `uid` instead of ObjectId
 */
router.post("/", async (req, res) => {
  try {
    const { uid, doctorId, date, time, notes } = req.body;

    // Find patient ObjectId from UID
    const patient = await Patient.findOne({ uid });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const newAppointment = new Appointment({
      patientId: patient._id,
      doctorId,
      date,
      time,
      notes,
      status: "booked", // optional default
    });

    const savedAppointment = await newAppointment.save();
    res.status(201).json(savedAppointment);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

export default router; // ✅ ESM default export
