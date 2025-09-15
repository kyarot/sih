// server/routes/prescriptions-file.js
import express from "express";
import Prescription from "../models/Prescription.js";
import multer from "multer";
import fs from "fs";
import cloudinary from "../config/cloudinaryConfig.js";
import mongoose from "mongoose";

const upload = multer({ dest: "tmp/" }); // simple disk storage
const router = express.Router();

router.post("/upload-file", upload.single("pdf"), async (req, res) => {
  try {
    const { doctorId, patientId } = req.body;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    if (!doctorId || !patientId) return res.status(400).json({ message: "doctorId & patientId required" });

    if (!mongoose.isValidObjectId(doctorId) || !mongoose.isValidObjectId(patientId)) {
      return res.status(400).json({ message: "doctorId and patientId must be valid ObjectId" });
    }

    const filePath = req.file.path;

    const cloudRes = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
      folder: "prescriptions",
      use_filename: true,
      unique_filename: false,
    });

    // delete temp file
    fs.unlinkSync(filePath);

    const newPrescription = await Prescription.create({
      doctorId,
      patientId,
      medicines: [], // if frontend also sends metadata, parse it from req.body
      pdfUrl: cloudRes.secure_url,
    });

    res.status(201).json({ message: "Uploaded", prescription: newPrescription, pdfUrl: cloudRes.secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
