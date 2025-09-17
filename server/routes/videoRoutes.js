import express from "express";
import { startVideoConsultation, endVideoConsultation } from "../controllers/videoController.js";

const router = express.Router();

// Doctor starts meeting
router.post("/:appointmentId/start", startVideoConsultation);

// Doctor ends meeting
router.post("/:appointmentId/end", endVideoConsultation);

export default router;
