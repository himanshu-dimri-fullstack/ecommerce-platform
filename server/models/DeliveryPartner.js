
import mongoose from "mongoose";

const deliveryPartnerSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        vehicleType: {
            type: String,
            enum: ["bike", "scooter", "cycle", "other"],
            required: true,
        },

        vehicleNumber: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },

        drivingLicenseNumber: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },

        currentLocation: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number],
                default: [0, 0],
            },
        },

        isOnline: {
            type: Boolean,
            default: false,
        },

        isAvailable: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["active", "inactive", "blocked"],
            default: "active",
        },

        totalDeliveries: {
            type: Number,
            default: 0,
            min: 0,
        },

        totalEarnings: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

deliveryPartnerSchema.index({ currentLocation: "2dsphere" });

const DeliveryPartner = mongoose.model(
    "DeliveryPartner",
    deliveryPartnerSchema
);

export default DeliveryPartner;
