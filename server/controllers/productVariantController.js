import mongoose from "mongoose";
import ProductVariant from "../models/ProductVariant.js"
import Product from "../models/Product.js";
import { destroyFile, uploadFile } from "../config/cloudinary.js";
import { handleResponseError } from "../utils/errorUtils.js"

// Normalize single/multiple uploaded images
const getUploadedImages = (files) => {
    if (!files?.images) return [];
    return Array.isArray(files.images)
        ? files.images
        : [files.images];
};

// Parse dimensions safely
const parseDimensions = (dimensions) => {
    if (!dimensions) {
        return { length: null, width: null, height: null };
    }
    return typeof dimensions === "string"
        ? JSON.parse(dimensions)
        : dimensions;
};

// Calculate discount percentage
const calculateDiscount = (mrp, sellingPrice) => {
    if (!Number(mrp) || Number(mrp) <= 0) return 0;

    return Math.round(
        ((Number(mrp) - Number(sellingPrice)) / Number(mrp)) * 100
    );
};

// Add Product Variant
export const addProductVariant = async (req, res) => {
    try {
        const {
            product,
            name,
            barcode,
            unitValue,
            unit,
            mrp,
            sellingPrice,
            weight,
            dimensions,
        } = req.body;

        // Validate pricing
        const parsedMRP = Number(mrp);
        const parsedSellingPrice = Number(sellingPrice);
        const parsedUnitValue = Number(unitValue);
        const parsedWeight =
            weight === "" || weight === undefined
                ? null
                : Number(weight);
        if (
            !Number.isFinite(parsedMRP) ||
            !Number.isFinite(parsedSellingPrice) ||
            !Number.isFinite(parsedUnitValue) ||
            parsedMRP <= 0 ||
            parsedSellingPrice < 0 ||
            parsedSellingPrice > parsedMRP ||
            parsedUnitValue <= 0 ||
            (parsedWeight !== null &&
                (!Number.isFinite(parsedWeight) || parsedWeight < 0))
        ) {
            return res.status(400).json({
                message: "Please provide valid pricing, unit value and weight",
            });
        }

        // Parse dimensions
        let parsedDimensions;

        try {
            parsedDimensions = parseDimensions(dimensions);
        } catch {
            return res.status(400).json({
                message: "Invalid dimensions format",
            });
        }

        // Upload images
        const files = getUploadedImages(req.files);
        const images = await Promise.all(
            files.map((file) => uploadFile(file.tempFilePath, "ecommerce_platform/product_variant"))
        );

        const finalImages = images.map((image) => {
            return {
                url: image.secure_url,
                public_id: image.public_id
            }
        })

        const sku = () => {
            const prefix = "VAR";
            const timestamp = Date.now().toString(36).toUpperCase();
            const random = Math.random().toString(36).substring(2, 6).toUpperCase();

            return `${prefix}-${timestamp}-${random}`;
        };

        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

        const variant = await ProductVariant.create({
            product,
            name: name.trim(),
            slug,
            sku: sku(),
            barcode: barcode?.trim() || null,
            unitValue: parsedUnitValue,
            unit: unit.trim(),
            mrp: parsedMRP,
            sellingPrice: parsedSellingPrice,
            discountPercentage: calculateDiscount(
                parsedMRP,
                parsedSellingPrice
            ),
            weight: parsedWeight,
            dimensions: parsedDimensions,
            images: finalImages,
        });

        const populatedVariant = await ProductVariant.findById(variant._id)
            .populate("product", "name");

        return res.status(201).json({
            message: "Product variant added successfully",
            variant: populatedVariant,
        });
    } catch (error) {
        console.error("Add Product Variant Error:", error);
        return handleResponseError(error, res)
    }
};

// Get All Product Variants
export const getAllProductVariants = async (req, res) => {
    try {
        const variants = await ProductVariant.find()
            .populate("product", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Product variants fetched successfully",
            variants,
        });
    } catch (error) {
        console.error("Get Product Variants Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch product variants",
        });
    }
};

// Get Single Product Variant
export const getProductVariantById = async (req, res) => {
    try {
        const { id } = req.params;

        const variant = await ProductVariant.findById(id)
            .populate("product", "name");

        if (!variant) {
            return res.status(404).json({
                message: "Product variant not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product variant fetched successfully",
            variant,
        });
    } catch (error) {
        console.error("Get Product Variant Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch product variant",
        });
    }
};

// Update Product Variant
export const updateProductVariant = async (req, res) => {
    try {
        const { id } = req.params;

        const variant = await ProductVariant.findById(id);

        if (!variant) {
            return res.status(404).json({
                message: "Product variant not found",
            });
        }

        const {
            product,
            name,
            barcode,
            unitValue,
            unit,
            mrp,
            sellingPrice,
            weight,
            dimensions,
            existingImages,
        } = req.body;

        // Validate pricing
        const nextMRP =
            mrp !== undefined ? Number(mrp) : variant.mrp;

        const nextSellingPrice =
            sellingPrice !== undefined
                ? Number(sellingPrice)
                : variant.sellingPrice;

        const nextUnitValue =
            unitValue !== undefined
                ? Number(unitValue)
                : variant.unitValue;

        const nextWeight =
            weight !== undefined
                ? weight === ""
                    ? null
                    : Number(weight)
                : variant.weight;

        if (
            !Number.isFinite(nextMRP) ||
            !Number.isFinite(nextSellingPrice) ||
            !Number.isFinite(nextUnitValue) ||
            nextMRP <= 0 ||
            nextSellingPrice < 0 ||
            nextSellingPrice > nextMRP ||
            nextUnitValue <= 0 ||
            (nextWeight !== null &&
                nextWeight !== undefined &&
                (!Number.isFinite(nextWeight) || nextWeight < 0))
        ) {
            return res.status(400).json({
                message: "Please provide valid pricing, unit value and weight",
            });
        }

        // Preserve only existing images selected by the user
        let retainedImages = []
        if (existingImages) {
            retainedImages = JSON.parse(existingImages)
            // console.log(retainedImages)
            for (let i = 0; i < variant.images.length; i++) {
                const existing = retainedImages.find((image) => {
                    return image.url === variant.images[i].url
                })
                if (!existing) {
                    await destroyFile(variant.images[i].public_id)
                }
            }
        }
        else {
            for (let i = 0; i < variant.images.length; i++) {
                await destroyFile(variant.images[i].public_id)
            }
        }
        // return


        // Upload newly selected images
        const files = getUploadedImages(req.files);
        const newImages = await Promise.all(
            files.map((file) => uploadFile(file.tempFilePath, "ecommerce_platform/product_variant"))
        );

        let finalImages = newImages.map((image) => {
            return {
                url: image.secure_url,
                public_id: image.public_id
            }
        })

        // Update fields
        if (product !== undefined) variant.product = product;
        if (name !== undefined) variant.name = name.trim();

        if (barcode !== undefined) {
            variant.barcode = barcode.trim() || null;
        }

        if (unitValue !== undefined) {
            variant.unitValue = nextUnitValue;
        }

        if (unit !== undefined) variant.unit = unit.trim();

        variant.mrp = nextMRP;
        variant.sellingPrice = nextSellingPrice;
        variant.discountPercentage = calculateDiscount(
            nextMRP,
            nextSellingPrice
        );

        if (weight !== undefined) {
            variant.weight = nextWeight;
        }

        if (dimensions !== undefined) {
            try {
                variant.dimensions = parseDimensions(dimensions);
            } catch {
                return res.status(400).json({
                    success: false,
                    message: "Invalid dimensions format",
                });
            }
        }

        variant.images = [...retainedImages, ...finalImages];

        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

        variant.slug = slug

        await variant.save();

        const updatedVariant = await ProductVariant.findById(id)
            .populate("product", "name");

        return res.status(200).json({
            message: "Product variant updated successfully",
            variant: updatedVariant,
        });
    } catch (error) {
        console.error("Update Product Variant Error:", error);

        return handleResponseError(error, res)
    }
};

// Update Product Variant Status
export const updateProductVariantStatus = async (req, res) => {
    try {
        const { id } = req.body;

        const variant = await ProductVariant.findById(id);

        if (!variant) {
            return res.status(404).json({
                message: "Product variant not found",
            });
        }

        variant.status =
            variant.status === "active" ? "inactive" : "active";

        await variant.save();

        return res.status(200).json({
            message: `Status changed successfully`,
            variant,
        });
    } catch (error) {
        console.error("Update Variant Status Error:", error);

        return handleResponseError(error, res)
    }
};

// Delete Product Variant
export const deleteProductVariant = async (req, res) => {
    try {
        const { id } = req.params;

        const variant = await ProductVariant.findByIdAndDelete(id);

        if (!variant) {
            return res.status(404).json({
                message: "Product variant not found",
            });
        }

        for (let i = 0; i < variant.images?.length; i++) {
            await destroyFile(variant.images[i].public_id)
        }

        return res.status(200).json({
            success: true,
            message: "Product variant deleted successfully",
        });
    } catch (error) {
        console.error("Delete Product Variant Error:", error);
        return res.status(500).json({
            message: "Failed to delete product variant",
        });
    }
};