import Doctor from "../models/Doctor.js";

// Doctor login with uniqueKey
export const doctorLogin = async (req, res) => {
  try {
    const { uniqueKey } = req.body;
    const doctor = await Doctor.findOne({ uniqueKey });

    if (!doctor) 
      return res.status(404).json({ success: false, message: "Doctor not found" });

    // Send success explicitly
    res.json({ success: true, doctor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** Get all doctors */
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/** Get doctor by ID (dashboard) */
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/** Update doctor profile */
export const updateDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const updatedData = req.body;

    const doctor = await Doctor.findByIdAndUpdate(doctorId, updatedData, { new: true });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.json(doctor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating profile" });
  }
};

// Toggle doctor online/offline
export const updateDoctorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_online } = req.body;
 console.log("Updating status:", id, is_online);  
    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { is_online },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};