import express from "express";
import admin from "../config/firebase.js";
import User from "../models/User.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Patient Signup
router.post("/signup", async (req, res) => {
  try {
    const { token, role } = req.body; // token = Firebase ID token

    // Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);

    let user = await User.findOne({ firebaseUID: decoded.uid });

    if (!user) {
      // Generate unique patient code
      const uniqueCode = uuidv4().slice(0, 8); // short unique code

      user = new User({
        firebaseUID: decoded.uid,
        role: role || "Patient",
        email: decoded.email || null,
        phone: decoded.phone_number || null,
        uniqueCode,
      });
      await user.save();
    }

    res.json({ success: true, uniqueCode: user.uniqueCode, role: user.role });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Patient Login
router.post("/login", async (req, res) => {
  try {
    const { token, uniqueCode } = req.body;

    const decoded = await admin.auth().verifyIdToken(token);

    const user = await User.findOne({
      firebaseUID: decoded.uid,
      uniqueCode,
    });

    if (!user) return res.status(401).json({ success: false, error: "Invalid login" });

    res.json({ success: true, role: user.role });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
