import mongoose from "mongoose";

const drugSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiryDate: {
      type: Date,
    },
    barcode: {
      type: String,
      unique: false, // can keep same for multiple batches
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy", // each drug belongs to a pharmacy
      required: true,
    },
  },
  { timestamps: true }
);

const Drug= mongoose.model("Drug", drugSchema);
export default Drug