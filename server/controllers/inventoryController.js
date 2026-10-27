import StoreInventory from "../models/Inventory.js";

// CREATE INVENTORY
export const createStoreInventory = async (req, res) => {
    try {
        const inventory = await StoreInventory.create(req.body);

        res.status(201).json({
            success: true,
            message: "Store inventory created successfully",
            inventory,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET ALL INVENTORIES
export const getStoreInventories = async (req, res) => {
    try {
        const inventories = await StoreInventory.find()
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
export const getStoreInventoryById = async (req, res) => {
    try {
        const inventory = await StoreInventory.findById(req.params.id)
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
export const updateStoreInventory = async (req, res) => {
    try {
        const inventory = await StoreInventory.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

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
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// DELETE INVENTORY
export const deleteStoreInventory = async (req, res) => {
    try {
        const inventory = await StoreInventory.findByIdAndDelete(
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