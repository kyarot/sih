
// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import verifyToken from "./middleware/verifyToken.js";
//>>>>>>> 50b84d7c1002cb667b26ecb88edc69d27a7f1bd9
import orderRoutes from "./routes/orderRoutes.js";
import drugRoutes from "./routes/drugs.js";
import router from "./routes/appointmentRoutes.js";
import doctorRoutes from "./routes/doctors.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import prescriptionsRoute from "./routes/prescriptions.js";
import prescriptionsFileRoute from "./routes/prescriptions-file.js";
import patientRoutes from "./routes/patients.js";
import pharmacyRoutes from "./routes/pharmacies.js";
import { diagnose } from "./diagnose.js";
import videoRoutes from "./routes/videoRoutes.js";
//50b84d7c1002cb667b26ecb88edc69d27a7f1bd9
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

// Routes

app.use("/api/patients", patientRoutes);
app.use("/api/pharmacies", pharmacyRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/prescriptions", prescriptionsRoute); // new
app.use("/api/prescriptions", prescriptionsFileRoute); // /upload-file
app.use("/api/orders", orderRoutes);

// Health chek
app.use("/api/appointments", router);
// Health check route (optional, for debugging)
// 50b84d7c1002cb667b26ecb88edc69d27a7f1bd9
app.get("/", (req, res) => {
  res.send("API is running...");
});
app.get("/test-auth", verifyToken, (req, res) => {
  res.json({ msg: "auth ok", user: req.user });
});

//aichat
app.post("/diagnose", async (req, res) => {
  try {
    const { symptoms } = req.body;
    const answer = await diagnose(symptoms);
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});
app.use("/api/video", videoRoutes);

//pharmacy routes
app.use("/api/drugs", drugRoutes);
// Start server
const PORT = process.env.PORT || 8082;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
