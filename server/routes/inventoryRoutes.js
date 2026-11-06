import express from "express";
import {
    createInventory,
    getInventories,
    getStoreInventory,
    getInventoryById,
    updateInventory,
    deleteInventory,
    changeStatus,
    getAvailableStoreInventory
} from "../controllers/inventoryController.js";

import { Auth } from "../middlewares/Auth.js";
import { Permission } from "../middlewares/Permission.js";

const router = express.Router();

// Create inventory
router.post("/add", Auth, Permission("inventory:add"), createInventory);

// Get all stores with inventory summary
router.get("/get", Auth, Permission("inventory:read"), getInventories);

// Get inventory of a particular store
router.get("/store/:storeId", Auth, Permission("inventory:read"), getStoreInventory);

// Get inventory by ID
router.get("/get/:id", Auth, Permission("inventory:read"), getInventoryById);

// Update inventory
router.put("/update/:id", Auth, Permission("inventory:update"), updateInventory);

// Change inventory status
router.patch("/update/status/:id", Auth, Permission("inventory:status"), changeStatus);

// Delete inventory
router.delete("/delete/:id", Auth, Permission("inventory:delete"), deleteInventory);

router.get(
    "/store/:storeId/available",
    getAvailableStoreInventory
);

export default router;