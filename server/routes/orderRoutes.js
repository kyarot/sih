import express from "express";
import { createOrder } from "../controllers/orderController.js";
import { getPendingOrdersByPharmacy, getConfirmedOrdersByPharmacy, updateOrderStatus ,getOrders,getLatestOrderPerPharmacy} from "../controllers/orderController.js";
const router = express.Router();

router.post("/", createOrder); // create new order
// router.get("/:patientId", getOrdersByPatient); // fetch all patient orders

// Pharmacy routes
router.get("/pharmacy/:pharmacyId/pending", getPendingOrdersByPharmacy);
router.get("/pharmacy/:pharmacyId/confirmed", getConfirmedOrdersByPharmacy);

// Update status (accept/reject/ready/complete)
router.put("/:orderId/status", updateOrderStatus);

router.get("/", getOrders); // query-based (used by frontend polling)
router.get("/latest", getLatestOrderPerPharmacy); // one-latest-per-pharmacy (optional, efficient)
export default router;
