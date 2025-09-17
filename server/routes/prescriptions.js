// server/routes/prescriptions.js
import express from "express";
import Prescription from "../models/Prescription.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import cloudinary from "../config/cloudinaryConfig.js";
import mongoose from "mongoose";

const router = express.Router();

// helper to wait for PDF write finish
function writePdfToFile(doc, outputPath) {
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);
    doc.end();
    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });
}

// POST /api/prescriptions
router.post("/", async (req, res) => {
  try {
    const { doctorId, patientId, medicines } = req.body;

    if (!doctorId || !patientId || !Array.isArray(medicines) || medicines.length === 0)
      return res.status(400).json({ message: "doctorId, patientId and medicines required" });

    // Validate ObjectId
    if (!mongoose.isValidObjectId(doctorId) || !mongoose.isValidObjectId(patientId)) {
      return res.status(400).json({ message: "doctorId and patientId must be valid MongoDB ObjectId (24 hex chars)" });
    }

    // make temp folder
    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const fileName = `prescription_${Date.now()}.pdf`;
    const filePath = path.join(tmpDir, fileName);

    // Generate PDF with pdfkit
    const doc = new PDFDocument({ margin: 40 });
    doc.fontSize(18).text("Prescription", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Doctor ID: ${doctorId}`);
    doc.text(`Patient ID: ${patientId}`);
    doc.text(`Date: ${new Date().toLocaleString()}`);
    doc.moveDown();

    medicines.forEach((m, i) => {
      doc.fontSize(14).text(`Medicine ${i + 1}`, { underline: true });
      doc.fontSize(12).list([
        `Name: ${m.name || "-"}`,
        `Quantity: ${m.quantity || "-"}`,
        `Dosage: ${m.dosage || "-"}`,
        `Duration: ${m.duration || "-"}`,
        `Instructions: ${m.instructions || "-"}`,
        `When: ${m.morning ? "Morning " : ""}${m.afternoon ? "Afternoon " : ""}${m.night ? "Night" : ""}`,
      ]);
      doc.moveDown();
    });

    // Wait for PDF file to be written
    await writePdfToFile(doc, filePath);

    // Upload to Cloudinary
    const cloudRes = await cloudinary.uploader.upload(filePath, {
      resource_type: "raw",
      folder: "prescriptions",
      format:"pdf",
      use_filename: true,
      unique_filename: false,
    });

    // remove temp file
    fs.unlinkSync(filePath);

    // Save to DB
    const newPrescription = await Prescription.create({
      doctorId,
      patientId,
      medicines,
      pdfUrl: cloudRes.secure_url,
    });

    return res.status(201).json({
      message: "Prescription saved",
      prescription: newPrescription,
      pdfUrl: cloudRes.secure_url,
    });
  } catch (err) {
    console.error("prescription route error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }

  
});

/**
 * GET /api/prescriptions/patient/:patientId
 * Returns all prescriptions for a patient (most recent first). Populates doctor name & specialization.
 */
router.get("/patient/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!mongoose.isValidObjectId(patientId))
      return res.status(400).json({ message: "Invalid patientId" });

    const prescriptions = await Prescription.find({ patientId })
      .sort({ createdAt: -1 })
      .populate("doctorId", "name specialization")
      .lean();

    return res.json(prescriptions);
  } catch (err) {
    console.error("GET /api/prescriptions/patient/:patientId error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * GET /api/prescriptions/:id/pdf
 * Redirects to cloudinary pdf URL (so clients can hit a stable server endpoint).
 */
router.get("/:id/pdf", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid prescription id" });

    const pres = await Prescription.findById(id).lean();
    if (!pres) return res.status(404).json({ message: "Prescription not found" });

    if (pres.pdfUrl) {
      return res.redirect(pres.pdfUrl);
    } else {
      return res.status(404).json({ message: "PDF not found for this prescription" });
    }
  } catch (err) {
    console.error("GET /api/prescriptions/:id/pdf error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
