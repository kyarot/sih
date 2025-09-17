import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy", required: true },
    prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Prescription", required: true },
    medicines: [
      {
        name: String,
        quantity: Number,
        morning: Boolean,
        afternoon: Boolean,
        night: Boolean,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "delivered","completed","ready"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Order=mongoose.model("Order", orderSchema);
export default Order 
