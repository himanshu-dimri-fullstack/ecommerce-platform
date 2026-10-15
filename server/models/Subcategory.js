import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
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
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        status: {
            type: String,
            default: "active"
        }
    },
    { timestamps: true }
);

// subCategorySchema.index({ slug: 1 });
// subCategorySchema.index({ category: 1, slug: 1 }, { unique: true });

// subCategorySchema.pre("findOneAndDelete", async function () {

//     const subcategory = await this.model.findOne(this.getFilter());
//     if (subcategory) {
//         await Product.deleteMany({
//             subcategory: subcategory._id
//         });
//     }

// });

export default mongoose.model("Subcategory", subCategorySchema);