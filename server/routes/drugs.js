import express from "express";
import { addDrug, deleteDrug, deleteDrugsByName, getAggregatedStock, getDrugs, lowStock, searchDrugs, updateDrug } from "../controllers/drugController.js";
import verifyToken from "../middleware/verifyToken.js";
const router = express.Router();

// Protected routes (only logged-in pharmacy)
router.post("/",verifyToken,addDrug);
router.get("/", verifyToken, getAggregatedStock); // Use aggregated stock by default
router.get("/raw", verifyToken, getDrugs); // Raw individual drugs
router.get("/search", verifyToken, searchDrugs);
router.put("/:id", verifyToken, updateDrug);
router.delete("/:id", verifyToken, deleteDrug);
router.delete("/by-name/:name/:brand", verifyToken, deleteDrugsByName); // Delete by name and optional brand
router.get("/low-stock", verifyToken, lowStock);

export default router;