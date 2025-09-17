import Appointment from "../models/Appointment.js";
import Notification from "../models/Notification.js";

/**
 * Doctor starts video consultation
 */
export const startVideoConsultation = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Find appointment
    const appointment = await Appointment.findById(appointmentId).populate("patientId");
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // Generate Jitsi meeting link if not exists
    if (!appointment.videoLink) {
      appointment.videoLink = `https://meet.jit.si/${appointment._id}-${Date.now()}`;
    }

    appointment.status = "booked"; // still ongoing
    await appointment.save();

    // ✅ Notify patient that meeting is live
    await Notification.create({
      userId: appointment.patientId._id,
      message: "Your doctor has started the video consultation. Tap to join.",
      type: "video-started",
      metadata: { videoLink: appointment.videoLink },
    });

    res.json({ videoLink: appointment.videoLink });
  } catch (err) {
    console.error("Error starting video consultation:", err);
    res.status(500).json({ message: "Error starting video consultation" });
  }
};

/**
 * End video consultation
 */
export const endVideoConsultation = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = "completed";
    await appointment.save();

    res.json({ message: "Video consultation ended", appointment });
  } catch (err) {
    console.error("Error ending video consultation:", err);
    res.status(500).json({ message: "Error ending video consultation" });
  }
};
