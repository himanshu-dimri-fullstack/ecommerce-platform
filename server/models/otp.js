import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        otp: {
            type: String,
            required: true,
        },

        otpExpiresAt: {
            type: Date,
            required: true,
        },

        purpose: {
            type: String,
            enum: ["signup"],
            required: true,
        },

        isOtpVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

otpSchema.index(
    { email: 1, purpose: 1 },
    { unique: true }
);

export default mongoose.model("OTP", otpSchema);