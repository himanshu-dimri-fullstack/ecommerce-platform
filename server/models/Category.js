import mongoose from "mongoose";
import Subcategory from "./Subcategory.js";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        description: {
            type: String,
        },
        image: {
            url: {
                type: String,
            },
            public_id: {
                type: String,
            },
        },
        status: {
            type: String,
            default: "active"
        },
        isDeleted: {
            type: Boolean
        }
    },
    { timestamps: true }
);

// categorySchema.pre("findOneAndDelete", async function () {

//     const category = await this.model.findOne(this.getFilter());

//     if (!category) return next();

//     const subcategories = await Subcategory.find({ category: category._id });

//     const subcategoryIds = subcategories.map(sub => sub._id);

//     await Product.deleteMany({
//         subcategory: { $in: subcategoryIds }
//     });

//     await Subcategory.deleteMany({
//         category: category._id
//     });

// });


export default mongoose.model("Category", categorySchema);