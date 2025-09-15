import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
  name: String,
  quantity: String,
  dosage: String,
  duration: String,
  instructions: String,
  morning: Boolean,
  afternoon: Boolean,
  night: Boolean,
});

const prescriptionSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  medicines: [medicineSchema],
  createdAt: { type: Date, default: Date.now },
   pdfUrl: { type: String },
});
const Prescription = mongoose.model("Prescription", prescriptionSchema);
export default Prescription