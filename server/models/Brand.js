import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        description: {
            type: String
        },
        image: {
            url: {
                type: String
            },
            public_id: {
                type: String
            }
        },
        status: {
            type: String,
            required: true,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    {
        timestamps: true,
    }
);

const Brand = mongoose.model("Brand", brandSchema);

export default Brand;