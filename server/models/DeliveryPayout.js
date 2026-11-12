
import mongoose from "mongoose";

const deliveryPayoutSchema = new mongoose.Schema(
    {
        // ORDER REFERENCE
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            unique: true,
        },

        // DELIVERY REFERENCE
        delivery: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Delivery",
            required: true,
            unique: true,
        },

        // DELIVERY PARTNER
        deliveryPartner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliveryPartner",
            required: true,
            index: true,
        },

        // STORE REFERENCE
        store: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            required: true,
        },

        // ROAD DISTANCE SNAPSHOT
        distanceMeters: {
            type: Number,
            required: true,
            min: 0,
        },

        distanceKm: {
            type: Number,
            required: true,
            min: 0,
        },

        // ROUTE DURATION SNAPSHOT
        durationSeconds: {
            type: Number,
            required: true,
            min: 0,
        },

        // DELIVERY PARTNER EARNING
        baseEarning: {
            type: Number,
            required: true,
            min: 0,
        },

        // FINAL TOTAL EARNING
        totalEarning: {
            type: Number,
            required: true,
            min: 0,
        },

        // PAYOUT STATUS
        payoutStatus: {
            type: String,
            enum: [
                "pending",
                "payable",
                "paid",
                "failed",
            ],
            default: "pending",
            index: true,
        },

        // DELIVERY COMPLETION
        payableAt: {
            type: Date,
            default: null,
        },

        // SETTLEMENT DETAILS
        paidAt: {
            type: Date,
            default: null,
        },

        paymentReference: {
            type: String,
            trim: true,
            default: null,
        },

        settlementNote: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

// PARTNER PAYOUT HISTORY
deliveryPayoutSchema.index({
    deliveryPartner: 1,
    payoutStatus: 1,
    createdAt: -1,
});

// ADMIN PAYOUT HISTORY
deliveryPayoutSchema.index({
    payoutStatus: 1,
    createdAt: -1,
});

const DeliveryPayout = mongoose.model(
    "DeliveryPayout",
    deliveryPayoutSchema
);

export default DeliveryPayout;
