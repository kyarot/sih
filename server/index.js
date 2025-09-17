import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";


import router from "./routes/appointmentRoutes.js";
import doctorRoutes from "./routes/doctors.js";
import patientRoutes from "./routes/patients.js";
import pharmacyRoutes from "./routes/pharmacies.js";
import bhashiniRoutes from "./routes/bhashiniRoutes.js"
import videoRoutes from "./routes/videoRoutes.js";
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));
console.log("Bhashini Endpoint:", process.env.BHASHINI_ENDPOINT);

// Routes

app.use("/api/patients", patientRoutes);
app.use("/api/pharmacies", pharmacyRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", router);
app.use("/api/bhashini", bhashiniRoutes);
app.use("/api/video", videoRoutes);
// Health check route (optional, for debugging)
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

