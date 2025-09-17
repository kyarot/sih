import express from "express";
import { translateText, speechToText } from "../controllers/bhashiniController.js";

const router = express.Router();

// POST: Translate text (dynamic data like names, symptoms, etc.)
router.post("/translate", translateText);

// POST: Convert speech to text
router.post("/speech-to-text", speechToText);

export default router;
