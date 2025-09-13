import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String },
  contact: { type: String },
  uniqueKey: { type: String, required: true, unique: true }, // login credential
});

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
