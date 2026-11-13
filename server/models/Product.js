
import mongoose from "mongoose";

// Embedded Review Schema
const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        comment: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const productSchema = new mongoose.Schema(
    {
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },

        subcategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subcategory",
        },

        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Brand",
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

        description: {
            type: String,
            trim: true,
        },

        images: [
            {
                url: String,
                public_id: String,
            },
        ],

        unit: {
            type: String,
            trim: true,
            default: "piece",
        },

        tags: [
            {
                type: String,
                trim: true,
                lowercase: true,
            },
        ],

        isFeatured: {
            type: Boolean,
            default: false,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        // Average rating of all reviews
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },

        // Total number of reviews
        totalReviews: {
            type: Number,
            default: 0,
            min: 0,
        },

        // All product reviews stored inside Product
        reviews: {
            type: [reviewSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
