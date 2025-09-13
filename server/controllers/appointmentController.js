import express from "express";
import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";

const router = express.Router();

/**
 * Create new appointment using patient UID
 */
router.post("/", async (req, res) => {
  try {
    const { uid, doctorId, date, time, notes } = req.body;

    // Find patient ObjectId from UID
    const patient = await Patient.findOne({ uid }); // or { email }
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const appointment = new Appointment({
      patientId: patient._id, // store ObjectId automatically
      doctorId,
      date,
      time,
      notes,
      status: "booked",
    });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error creating appointment" });
  }
});

/**
 * Get all appointments for a patient using UID
 */
router.get("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    const patient = await Patient.findOne({ uid });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const appointments = await Appointment.find({ patientId: patient._id })
      .populate("doctorId", "name specialization experience available rating")
      .sort({ date: -1 });

    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching appointments" });
  }
});

export default router;
