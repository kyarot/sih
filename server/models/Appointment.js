import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },

    // Store snapshot of patient info
     patientName: { type: String, default: null },
    patientAge: { type: Number, default: null },
    patientGender: { type: String, enum: ["Male", "Female", "Other", null], default: null },
    requestedDate: { type: String },
    requestedTime: { type: String },

    // Symptoms info
    symptomDuration: { type: String },
    symptomsDescription: { type: String },
    symptomSeverity: { type: String },

    decision: {
      type: String,
      enum: ["pending", "accepted", "later", "declined", "completed", "missed"],
      default: "pending",
    },

    scheduledDateTime: { type: Date },
    videoLink: { type: String },
    notes: { type: String },

    status: {
      type: String,
      enum: ["booked", "completed", "cancelled"],
      default: "booked",
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
