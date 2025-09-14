import Appointment from "../models/Appointment.js";
import Notification from "../models/Notification.js";
import Patient from "../models/Patient.js";

/** Create appointment */
export const createAppointment = async (req, res) => {
  try {
    const {
      uid,
      doctorId,
      symptomDuration,
      symptomsDescription,
      symptomSeverity,
      patientName,
      patientAge,
      patientGender,
    } = req.body;

    // ✅ Find patient by UID
    const patient = await Patient.findOne({ uid });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // ✅ Create new appointment with snapshot fields
    const appointment = new Appointment({
      patientId: patient._id,
      doctorId,
      patientName: patientName || patient.name,   // fallback from Patient model
      patientAge: patientAge || patient.age,
      patientGender: patientGender || patient.gender,
      symptomDuration,
      symptomsDescription,
      symptomSeverity,
      decision: "pending",
      status: "booked",
    });

    await appointment.save();

    // ✅ Notify doctor
    await Notification.create({
      userId: doctorId,
      message: `${appointment.patientName} has requested a consultation.`,
      type: "appointment",
    });

    res.status(201).json(appointment);
  } catch (err) {
    console.error("Error creating appointment:", err);
    res.status(500).json({ message: "Error creating appointment" });
  }
};


/** Get patient appointments */
export const getAppointmentsByPatient = async (req, res) => {
  try {
    const { uid } = req.params;
    const patient = await Patient.findOne({ uid });

    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const appts = await Appointment.find({ patientId: patient._id })
      .populate("doctorId", "name specialization experience")
      .sort({ createdAt: -1 });

    res.json(appts);
  } catch (err) {
    console.error("Error fetching patient appointments:", err);
    res.status(500).json({ message: "Error fetching patient appointments" });
  }
};

/** Get doctor appointments */
export const getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appts = await Appointment.find({ doctorId })
      .populate("patientId", "firstName lastName age gender email phone")
      .sort({ createdAt: -1 });

    res.json(appts);
  } catch (err) {
    console.error("Error fetching doctor appointments:", err);
    res.status(500).json({ message: "Error fetching doctor appointments" });
  }
};

/** Doctor updates decision (accept/reject/later) */
export const updateAppointmentDecision = async (req, res) => {
  try {
    const { decision, scheduledDateTime } = req.body;
    const appointment = await Appointment.findById(req.params.id).populate("patientId");

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.decision = decision;

    if (decision === "accepted") {
      appointment.scheduledDateTime = new Date(scheduledDateTime);
      appointment.videoLink = `https://meet.jit.si/${appointment._id}`;
    }

    if (decision === "completed") {
      appointment.status = "completed";
    }

    await appointment.save();

    // ✅ Notify patient about status change
    await Notification.create({
      userId: appointment.patientId._id,
      message: `Your appointment has been ${decision}`,
      type: "appointment-status",
    });

    res.json(appointment);
  } catch (err) {
    console.error("Error updating appointment decision:", err);
    res.status(500).json({ message: "Error updating decision" });
  }
};
