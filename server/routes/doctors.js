import express from "express";
import { doctorLogin } from "../controllers/doctorController.js";
import { getAllDoctors } from "../controllers/doctorController.js";
const router = express.Router();

// Doctor login route
router.post("/login", doctorLogin);
router.get("/", getAllDoctors);

export default router;
