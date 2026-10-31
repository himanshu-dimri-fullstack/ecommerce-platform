
import mongoose from "mongoose";
import Banner from "../models/Banner.js";

// Create Banner
export const createBanner = async (req, res) => {
    try {
        const { htmlContent } = req.body;

        if (!htmlContent || !htmlContent.trim()) {
            return res.status(400).json({
                success: false,
                message: "HTML content is required",
            });
        }

        const banner = await Banner.create({
            htmlContent,
        });

        return res.status(201).json({
            success: true,
            message: "Banner created successfully",
            banner,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get All Banners
export const getBanners = async (req, res) => {
    try {
        const banners = await Banner.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            total: banners.length,
            banners,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get Single Banner
export const getBanner = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid banner ID",
            });
        }

        const banner = await Banner.findById(id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found",
            });
        }

        return res.status(200).json({
            success: true,
            banner,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update Banner
export const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { htmlContent } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid banner ID",
            });
        }

        if (!htmlContent || !htmlContent.trim()) {
            return res.status(400).json({
                success: false,
                message: "HTML content is required",
            });
        }

        const banner = await Banner.findByIdAndUpdate(
            id,
            { htmlContent },
            { new: true, runValidators: true }
        );

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Banner updated successfully",
            banner,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete Banner
export const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid banner ID",
            });
        }

        const banner = await Banner.findByIdAndDelete(id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Banner deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
