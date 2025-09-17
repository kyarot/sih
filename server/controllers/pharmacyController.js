import Pharmacy from "../models/Pharmacy.js";

// ---------------- Register Pharmacy ----------------
export const registerPharmacy = async (req, res) => {
  try {
    const uid = req.uid; // always from middleware
    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      licenseNumber,
      licenseImageURL,
      openingHours,
      services,
    } = req.body;

    if (!uid || !name || !licenseNumber) {
      return res.status(400).json({ success: false, message: "uid, name and licenseNumber required" });
    }

    // Check duplicates
    if (await Pharmacy.findOne({ uid })) {
      return res.status(400).json({ success: false, message: "Pharmacy already registered for this UID" });
    }

    if (await Pharmacy.findOne({ licenseNumber })) {
      return res.status(400).json({ success: false, message: "License number already registered" });
    }

    const pharmacy = new Pharmacy({
      uid,
      ownerUid: uid,
      name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      licenseNumber,
      licenseImageURL,
      openingHours,
      services: services || [],
    });

    await pharmacy.save();
    res.status(201).json({ success: true, pharmacy });
  } catch (err) {
    console.error("registerPharmacy error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- Get by ID ----------------
export const getPharmacyById = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) return res.status(404).json({ success: false, message: "Pharmacy not found" });
    res.json({ success: true, pharmacy });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- Update Pharmacy Location ----------------
export const updatePharmacyLocation = async (req, res) => {
  try {
    const { pharmacyId, coordinates } = req.body; // [lng, lat]

    if (!pharmacyId || !coordinates || coordinates.length !== 2) {
      return res.status(400).json({ success: false, message: "pharmacyId and valid coordinates required" });
    }

    const pharmacy = await Pharmacy.findByIdAndUpdate(
      pharmacyId,
      { location: { type: "Point", coordinates } },
      { new: true }
    );

    if (!pharmacy) {
      return res.status(404).json({ success: false, message: "Pharmacy not found" });
    }

    res.json({ success: true, pharmacy });
  } catch (err) {
    console.error("updatePharmacyLocation error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- Update Pharmacy Status ----------------
export const updatePharmacyStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;
    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      { isOnline },
      { new: true }
    );
    if (!pharmacy) return res.status(404).json({ message: "Pharmacy not found" });
    res.json({ pharmacy });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- Get by UID ----------------
export const getPharmacyByUid = async (req, res) => {
  try {
    const uid = req.params.uid || req.uid; // fallback to token
    if (!uid) return res.status(400).json({ success: false, message: "uid required" });

    const pharmacy = await Pharmacy.findOne({ uid });
    if (!pharmacy) return res.status(404).json({ success: false, message: "Pharmacy not found" });
    res.json({ success: true, pharmacy });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- Update Pharmacy ----------------
export const updatePharmacy = async (req, res) => {
  try {
    const uid = req.uid;
    const pharmacyId = req.params.id;

    if (!uid) return res.status(401).json({ success: false, message: "Unauthorized" });

    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) return res.status(404).json({ success: false, message: "Pharmacy not found" });
    if (pharmacy.uid !== uid) return res.status(403).json({ success: false, message: "Forbidden" });

    Object.assign(pharmacy, req.body);
    await pharmacy.save();

    res.json({ success: true, pharmacy });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- Delete Pharmacy ----------------
export const deletePharmacy = async (req, res) => {
  try {
    const uid = req.uid;
    const pharmacyId = req.params.id;

    if (!uid) return res.status(401).json({ success: false, message: "Unauthorized" });

    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) return res.status(404).json({ success: false, message: "Pharmacy not found" });
    if (pharmacy.uid !== uid) return res.status(403).json({ success: false, message: "Forbidden" });

    await pharmacy.remove();
    res.json({ success: true, message: "Pharmacy deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
