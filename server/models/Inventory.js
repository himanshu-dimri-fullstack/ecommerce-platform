import mongoose from "mongoose";

const storeInventorySchema = new mongoose.Schema(
    {
        store: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            required: true,
        },

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        variant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProductVariant",
            required: true,
        },

        quantity: {
            type: Number,
            // required: true,
            default: 0,
            min: 0,
        },

        reservedQuantity: {
            type: Number,
            default: 0,
            min: 0,
        },

        availableQuantity: {
            type: Number,
            default: 0,
            min: 0,
        },

        reorderLevel: {
            type: Number,
            default: 10,
            min: 0,
        },

        maxStockLevel: {
            type: Number,
            default: 100,
            min: 0,
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },

        lastRestockedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

storeInventorySchema.index(
    { store: 1, product: 1, variant: 1 },
    { unique: true }
);

const StoreInventory = mongoose.model(
    "Inventory",
    storeInventorySchema
);

export default StoreInventory;