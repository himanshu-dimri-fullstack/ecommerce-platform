import express from "express";
import {
    createStoreInventory,
    getStoreInventories,
    getStoreInventoryById,
    updateStoreInventory,
    deleteStoreInventory,
} from "../controllers/inventoryController.js";

const router = express.Router();

// Create inventory
router.post("/add", createStoreInventory);

// Get all inventories
router.get("/get", getStoreInventories);

// Get inventory by ID
router.get("/get/:id", getStoreInventoryById);

// Update inventory
router.put("/update/:id", updateStoreInventory);

// Delete inventory
router.delete("/delete/:id", deleteStoreInventory);

export default router;