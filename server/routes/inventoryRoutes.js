import express from "express";
import {
    createInventory,
    getInventories,
    getInventoryById,
    updateInventory,
    deleteInventory,
    changeStatus
} from "../controllers/inventoryController.js";
import { Auth } from "../middlewares/Auth.js";
import { Permission } from "../middlewares/Permission.js";

const router = express.Router();

// Create inventory
router.post("/add", Auth, Permission("inventory:add"), createInventory);

// Get all inventories
router.get("/get", getInventories);

// Get inventory by ID
router.get("/get/:id", Auth, Permission("inventory:read"), getInventoryById);

// Update inventory
router.put("/update/:id", Auth, Permission("inventory:update"), updateInventory);
router.patch("/update/status/:id", changeStatus);

// Delete inventory
router.delete("/delete/:id", Auth, Permission("inventory:delete"), deleteInventory);

export default router;