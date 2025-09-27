import express from "express";
import {
  createAppointment,
  getAppointmentsByDoctor,
  getAppointmentsByPatient,
  updateAppointmentDecision,
   getCompletedAppointmentsByPatient,
  getPrescriptionByAppointment
} from "../controllers/appointmentController.js";

const router = express.Router();

// Patient creates
router.post("/", createAppointment);

// Get appointments
router.get("/patient/:uid", getAppointmentsByPatient);
router.get("/doctor/:doctorId", getAppointmentsByDoctor);

// Doctor decision
router.put("/:id/decision", updateAppointmentDecision);
router.get('/patient/:uid/completed', getCompletedAppointmentsByPatient);
router.get('/prescriptions/:appointmentId', getPrescriptionByAppointment);

export default router;
