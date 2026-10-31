import Inventory from "../models/Inventory.js";
import { handleResponseError } from "../utils/errorUtils.js"

// CREATE INVENTORY
export const createInventory = async (req, res) => {
    try {
        const { product, store, variant, quantity, reservedQuantity,
            reorderLevel, maxStockLevel } = req.body

        if (!product) {
            return res.status(400).json({ message: "Product Id is required" })
        }
        if (!store) {
            return res.status(400).json({ message: "Store Id is required" })
        }
        if (!variant) {
            return res.status(400).json({ message: "Variant Id is required" })
        }
        if (!quantity) {
            return res.status(400).json({ message: "Quantity is required" })
        }

        let finalReorderLevel

        if (!reorderLevel) {
            finalReorderLevel = quantity * 10 / 100
        }
        else {
            finalReorderLevel = reorderLevel
        }

        let finalReservedQuantity

        if (!reservedQuantity) {
            finalReservedQuantity = quantity * 20 / 100
        }
        else {
            finalReservedQuantity = reservedQuantity
        }

        let availableQuantity = quantity - finalReservedQuantity

        const inventory = await Inventory.create({
            product, store, variant, quantity, reservedQuantity: finalReservedQuantity,
            reorderLevel: finalReorderLevel, maxStockLevel, availableQuantity
        });

        res.status(201).json({
            success: true,
            message: "Store inventory created successfully",
            inventory,
        });
    } catch (error) {
        return handleResponseError(error, res)
    }
};

// GET ALL INVENTORIES
export const getInventories = async (req, res) => {
    try {
        const inventories = await Inventory.find()
            .populate("store")
            .populate("product")
            .populate("variant")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: inventories.length,
            inventories,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET INVENTORY BY ID
export const getInventoryById = async (req, res) => {
    try {
        const inventory = await Inventory.findById(req.params.id)
            .populate("store")
            .populate("product")
            .populate("variant");

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: "Store inventory not found",
            });
        }

        res.status(200).json({
            success: true,
            inventory,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// UPDATE INVENTORY
export const updateInventory = async (req, res) => {
    try {
        const { product, store, variant, quantity, reservedQuantity,
            reorderLevel, maxStockLevel } = req.body

        if (!product) {
            return res.status(400).json({ message: "Product Id is required" })
        }
        if (!store) {
            return res.status(400).json({ message: "Store Id is required" })
        }
        if (!variant) {
            return res.status(400).json({ message: "Variant Id is required" })
        }
        if (!quantity) {
            return res.status(400).json({ message: "Quantity is required" })
        }

        let finalReorderLevel

        if (!reorderLevel) {
            finalReorderLevel = (10 / quantity) * 100
        }
        else {
            finalReorderLevel = reorderLevel
        }

        let finalReservedQuantity

        if (!reservedQuantity) {
            finalReservedQuantity = (20 / quantity) * 100
        }
        else {
            finalReservedQuantity = reservedQuantity
        }

        let availableQuantity = quantity - finalReservedQuantity

        const inventory = await Inventory.updateOne({ _id: req.params.id },
            {
                product, store, variant, quantity, reservedQuantity: finalReservedQuantity,
                reorderLevel: finalReorderLevel, maxStockLevel, availableQuantity
            })

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: "Store inventory not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Store inventory updated successfully",
            inventory,
        });
    } catch (error) {
        return handleResponseError(error, res)
    }
};

// DELETE INVENTORY
export const deleteInventory = async (req, res) => {
    try {
        const inventory = await Inventory.findByIdAndDelete(
            req.params.id
        );

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: "Store inventory not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Store inventory deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const changeStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const inventory = await Inventory.findById(id);

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: "Inventory not found",
            });
        }

        inventory.status =
            inventory.status === "active" ? "inactive" : "active";

        await inventory.save();

        return res.status(200).json({
            success: true,
            message: `Inventory ${inventory.status} successfully`,
            inventory,
        });
    } catch (error) {
        console.error("Change Inventory Status Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};