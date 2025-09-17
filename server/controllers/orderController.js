import Order from "../models/Order.js";
import Prescription from "../models/Prescription.js";
import mongoose from "mongoose";
export const createOrder = async (req, res) => {
  try {
    const { patientId, pharmacyId, prescriptionId } = req.body;

    if (!patientId || !pharmacyId || !prescriptionId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    
    // Fetch prescription details
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }
    
    // If an active order already exists (pending/confirmed/ready), return it instead of creating a duplicate
   const existing = await Order.findOne({
     patientId,
     pharmacyId,
     prescriptionId,
     status: { $in: ["pending", "confirmed", "ready"] },
   });

     if (existing) {
      return res.status(409).json({ message: "An active order already exists for this pharmacy", order: existing });
    }
    // Create order
    const order = new Order({
      patientId,
      pharmacyId,
      prescriptionId,
      medicines: prescription.medicines,
    });

    await order.save();

    res.status(201).json({ message: "Order created", order });
  } catch (err) {
    console.error("createOrder:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// export const getOrdersByPatient = async (req, res) => {
//   try {
//     const { patientId } = req.params;
//     const orders = await Order.find({ patientId }).populate("pharmacyId").populate("prescriptionId");
//     res.json({ orders });
//   } catch (err) {
//     console.error("getOrdersByPatient:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// ✅ Fetch pending orders for a pharmacy (Notifications tab)
export const getPendingOrdersByPharmacy = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const orders = await Order.find({ pharmacyId, status: "pending" })
      .populate("patientId")
      .populate("prescriptionId");
    res.json({ orders });
  } catch (err) {
    console.error("getPendingOrdersByPharmacy:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Fetch confirmed orders for a pharmacy (Orders tab)
export const getConfirmedOrdersByPharmacy = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const orders = await Order.find({ pharmacyId, status: "confirmed" })
      .populate("patientId")
      .populate("prescriptionId");
    res.json({ orders });
  } catch (err) {
    console.error("getConfirmedOrdersByPharmacy:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!["pending", "confirmed", "rejected", "ready", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    )
      .populate("patientId")
      .populate("prescriptionId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order updated", order });
  } catch (err) {
    console.error("updateOrderStatus:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { patientId, prescriptionId, pharmacyId } = req.query;

    if (!patientId) {
      return res.status(400).json({ message: "patientId query param is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: "Invalid patientId" });
    }

    const q = { patientId }; // let Mongoose auto-cast
    if (prescriptionId) {
      if (!mongoose.Types.ObjectId.isValid(prescriptionId)) {
        return res.status(400).json({ message: "Invalid prescriptionId" });
      }
      q.prescriptionId = prescriptionId;
    }
    if (pharmacyId) {
      if (!mongoose.Types.ObjectId.isValid(pharmacyId)) {
        return res.status(400).json({ message: "Invalid pharmacyId" });
      }
      q.pharmacyId = pharmacyId;
    }

    const orders = await Order.find(q)
      .sort({ createdAt: -1 })
      .populate("pharmacyId")
      .populate("prescriptionId")
      .populate("patientId");

    return res.json({ orders });
  } catch (err) {
    console.error("getOrders:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getLatestOrderPerPharmacy = async (req, res) => {
  try {
    const { patientId, prescriptionId } = req.query;

    if (!patientId) {
      return res.status(400).json({ message: "patientId query param is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: "Invalid patientId" });
    }

    // Explicitly cast to ObjectId for aggregation
    const match = { patientId: new mongoose.Types.ObjectId(patientId) };
    if (prescriptionId) {
      if (!mongoose.Types.ObjectId.isValid(prescriptionId)) {
        return res.status(400).json({ message: "Invalid prescriptionId" });
      }
      match.prescriptionId = new mongoose.Types.ObjectId(prescriptionId);
    }

    const pipeline = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$pharmacyId", order: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$order" } },

      // pharmacy
      {
        $lookup: {
          from: "pharmacies",
          localField: "pharmacyId",
          foreignField: "_id",
          as: "pharmacy",
        },
      },
      { $unwind: { path: "$pharmacy", preserveNullAndEmptyArrays: true } },

      // prescription
      {
        $lookup: {
          from: "prescriptions",
          localField: "prescriptionId",
          foreignField: "_id",
          as: "prescription",
        },
      },
      { $unwind: { path: "$prescription", preserveNullAndEmptyArrays: true } },

      // patient
      {
        $lookup: {
          from: "patients",
          localField: "patientId",
          foreignField: "_id",
          as: "patient",
        },
      },
      { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },
    ];

    const results = await Order.aggregate(pipeline);

    return res.json({ orders: results });
  } catch (err) {
    console.error("getLatestOrderPerPharmacy:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
