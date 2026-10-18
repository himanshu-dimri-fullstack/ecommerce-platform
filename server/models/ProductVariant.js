import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },

        sku: {
            type: String,
            // required: true,
            unique: true,
            trim: true,
        },

        barcode: {
            type: String,
            trim: true,
            default: null,
        },

        unitValue: {
            type: Number,
            required: true,
            min: 0,
        },

        unit: {
            type: String,
            required: true,
            trim: true,
        },

        mrp: {
            type: Number,
            required: true,
            min: 0,
        },

        sellingPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        discountPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },

        weight: {
            type: Number,
            default: null,
            min: 0,
        },

        dimensions: {
            length: {
                type: Number,
                default: null,
                min: 0,
            },
            width: {
                type: Number,
                default: null,
                min: 0,
            },
            height: {
                type: Number,
                default: null,
                min: 0,
            },
        },

        images: [
            {
                url: {
                    type: String,
                },
                public_id: {
                    type: String,
                },
            },
        ],

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

const ProductVariant = mongoose.model(
    "ProductVariant",
    productVariantSchema
);

export default ProductVariant