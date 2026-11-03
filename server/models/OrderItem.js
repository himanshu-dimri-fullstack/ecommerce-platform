
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
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
            default: null,
        },

        productName: {
            type: String,
            required: true,
            trim: true,
        },

        variantName: {
            type: String,
            default: null,
            trim: true,
        },

        sku: {
            type: String,
            default: null,
            trim: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        discount: {
            type: Number,
            default: 0,
            min: 0,
        },

        tax: {
            type: Number,
            default: 0,
            min: 0,
        },

        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: {
            createdAt: true,
            updatedAt: false,
        },
    }
);

orderItemSchema.index({ order: 1 });
orderItemSchema.index({ product: 1 });

const OrderItem = mongoose.model("OrderItem", orderItemSchema);

export default OrderItem;
