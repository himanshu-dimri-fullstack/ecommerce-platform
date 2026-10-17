
import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        },

        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        phone: {
            type: String,
            required: true,
            trim: true,
        },

        address: {
            type: String,
            required: true,
            trim: true,
        },

        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number],
                default: undefined,
            },
        },

        serviceRadius: {
            type: Number,
            required: true,
            min: 0,
            default: 10,
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

storeSchema.index({ location: "2dsphere" });

const Store = mongoose.model("Store", storeSchema);

export default Store;
