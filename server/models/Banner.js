import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
    {
        htmlContent: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;