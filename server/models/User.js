import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            required: true,
            default: "customer"
        },

        firstName: {
            type: String,
            required: true,
            trim: true,
        },

        lastName: {
            type: String,
            // required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        profileImage: {
            secure_url: {
                type: String,
            },
            public_id: {
                type: String,
            },
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        isPhoneVerified: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
        lastLoginAt: {
            type: Date,
            default: null,
        },
        otp: {
            type: String
        },
        otpExpiresAt: {
            type: Date,
            default: null,
        },
        isOtpVerified: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("User", userSchema);