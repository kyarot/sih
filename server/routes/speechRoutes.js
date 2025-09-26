import express from "express";
import { transcribeAudio } from "../controllers/speechController.js";

const router = express.Router();

// POST /api/speech/transcribe
router.post("/transcribe", transcribeAudio);

export default router;
