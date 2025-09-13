import Doctor from "../models/Doctor.js";

// Doctor login with uniqueKey
export const doctorLogin = async (req, res) => {
  try {
    const { uniqueKey } = req.body;

    if (!uniqueKey) {
      return res.status(400).json({ success: false, message: "Unique key required" });
    }

    const doctor = await Doctor.findOne({ uniqueKey });
    if (!doctor) {
      return res.status(401).json({ success: false, message: "Invalid key" });
    }

    res.json({
      success: true,
      message: "Login successful",
      doctor,
    });
  } catch (err) {
    console.error("doctorLogin error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
