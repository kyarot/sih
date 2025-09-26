// server/routes/prescriptions.js
import express from "express";
import Prescription from "../models/Prescription.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import cloudinary from "../config/cloudinaryConfig.js";
import mongoose from "mongoose";
import multer from "multer";

const prescriptionRoutes = express.Router();
const upload = multer({ dest: "tmp/" });

// helper: wait until PDF written
function writePdfToFile(doc, outputPath) {
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);
    doc.end();
    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });
}

/**
 * POST /api/prescriptions
 * Create prescription from medicines array → PDF → Cloudinary → DB
 */
prescriptionRoutes.post("/", async (req, res) => {
  try {
    const { doctorId, patientId, medicines } = req.body;

    if (!doctorId || !patientId || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ message: "doctorId, patientId and medicines required" });
    }

    if (!mongoose.isValidObjectId(doctorId) || !mongoose.isValidObjectId(patientId)) {
      return res.status(400).json({ message: "doctorId and patientId must be valid ObjectId" });
    }

    // temp folder
    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const fileName = `prescription_${Date.now()}.pdf`;
    const filePath = path.join(tmpDir, fileName);

    // generate PDF
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

    await writePdfToFile(doc, filePath);

    // upload PDF
    const cloudRes = await cloudinary.uploader.upload(filePath, {
      resource_type: "raw",
      folder: "prescriptions",
      format: "pdf",
      use_filename: true,
      unique_filename: false,
    });

    fs.unlinkSync(filePath);

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
    console.error("POST /api/prescriptions error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * POST /api/prescriptions/upload-file
 * Upload existing PDF file directly
 */
prescriptionRoutes.post("/upload-file", upload.single("pdf"), async (req, res) => {
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

    fs.unlinkSync(filePath);

    const newPrescription = await Prescription.create({
      doctorId,
      patientId,
      medicines: [], // no structured medicines here
      pdfUrl: cloudRes.secure_url,
    });

    res.status(201).json({
      message: "Prescription uploaded",
      prescription: newPrescription,
      pdfUrl: cloudRes.secure_url,
    });
  } catch (err) {
    console.error("POST /api/prescriptions/upload-file error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/prescriptions/patient/:patientId
 * Fetch all prescriptions for a patient
 */
prescriptionRoutes.get("/patient/:patientId", async (req, res) => {
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
 * Redirect to cloudinary pdf URL
 */
prescriptionRoutes.get("/:id/pdf", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid prescription id" });

    const pres = await Prescription.findById(id).lean();
    if (!pres) return res.status(404).json({ message: "Prescription not found" });

    if (pres.pdfUrl) {
      return res.redirect(pres.pdfUrl);
    } else {
      return res.status(404).json({ message: "PDF not found" });
    }
  } catch (err) {
    console.error("GET /api/prescriptions/:id/pdf error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default prescriptionRoutes;
