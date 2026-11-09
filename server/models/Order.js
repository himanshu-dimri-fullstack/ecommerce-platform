
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        store: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            required: true,
        },

        address: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
            required: true,
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },

        discount: {
            type: Number,
            default: 0,
            min: 0,
        },

        deliveryFee: {
            type: Number,
            default: 0,
            min: 0,
        },

        tax: {
            type: Number,
            default: 0,
            min: 0,
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        coupon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coupon",
            default: null,
        },

        paymentMethod: {
            type: String,
            enum: ["cod", "online"],
            required: true,
        },


        razorpayOrderId: {
            type: String,
            default: null,
            index: true,
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending",
        },

        orderStatus: {
            type: String,
            enum: [
                "placed",
                "confirmed",
                "processing",
                "packed",
                "shipped",
                "out_for_delivery",
                "delivered",
                "cancelled",
            ],
            default: "placed",
        },

        deliveryPartner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliveryPartner",
            default: null,
        },

        estimatedDeliveryTime: {
            type: Date,
            default: null,
        },

        placedAt: {
            type: Date,
            default: Date.now,
        },

        confirmedAt: {
            type: Date,
            default: null,
        },

        deliveredAt: {
            type: Date,
            default: null,
        },

        cancelledAt: {
            type: Date,
            default: null,
        },

        cancellationReason: {
            type: String,
            trim: true,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ store: 1, orderStatus: 1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
