
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        paymentGateway: {
            type: String,
            enum: ["razorpay", "stripe", "cashfree", "cod"],
            required: true,
            lowercase: true,
        },

        transactionId: {
            type: String,
            trim: true,
            default: null,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        currency: {
            type: String,
            default: "INR",
            uppercase: true,
            trim: true,
        },

        method: {
            type: String,
            enum: [
                "upi",
                "card",
                "netbanking",
                "wallet",
                "emi",
                "cod",
                "other",
            ],
            default: "other",
            lowercase: true,
        },

        status: {
            type: String,
            enum: [
                "pending",
                "success",
                "failed",
                "refunded",
                "partially_refunded",
            ],
            default: "pending",
        },

        gatewayResponse: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },

        paidAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ transactionId: 1 }, { sparse: true });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
