import { uploadFile } from "../config/cloudinary.js";
import Category from "../models/Category.js";
import { destroyFile } from "../config/cloudinary.js"
import Subcategory from "../models/Subcategory.js";
import Product from "../models/Product.js"
import { handleResponseError } from "../utils/errorUtils.js";
import Store from "../models/Store.js"
import mongoose from "mongoose";
import Inventory from "../models/Inventory.js"


export const createCategory = async (req, res) => {
    try {
        const { name, description, } = req.body
        if (!name) {
            return res.status(400).json({ message: "Name is required" })
        }
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

        let image

        if (req.files) {
            image = req.files.image
            const result = await uploadFile(image.tempFilePath, "ecommerce_platform/category")
            if (!result) {
                return res.json(400).json({ message: "Image upload failed" })
            }
            image = { url: result.secure_url, public_id: result.public_id }
            const category = await Category.create({ name, slug, image, description });
            res.status(201).json({ message: "Category created successfully", category });
        }
        else {
            const category = await Category.create({ name, slug, description });
            res.status(201).json({ message: "Category created successfully", category });
        }
    }
    catch (error) {
        console.log(error)
    }
}

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) {
            return res.status(400).json({ message: "Category ID is required" })
        }
        const category = await Category.findOne({ _id: id })

        if (!category) {
            return res.status(404).json({ message: "Category not found" })
        }

        const { name, description, existingImage } = req.body

        if (!name) {
            return res.status(400).json({ message: "Name is required" })
        }
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

        if (!existingImage) {
            await destroyFile(category.image.public_id)
            await Category.updateOne({ _id: id }, { $unset: { image: "" } })
        }


        if (req.files) {
            await destroyFile(category.image.public_id)
            let image = req.files.image
            const result = await uploadFile(image.tempFilePath, "ecommerce_platform/category")
            if (!result) {
                return res.json(400).json({ message: "Image upload failed" })
            }
            image = { url: result.secure_url, public_id: result.public_id }
            const updated = await Category.updateOne({ _id: id }, { name, slug, image, description, });
            res.status(200).json({ message: "Category updated successfully", category: updated });
        }
        else {
            const updated = await Category.updateOne({ _id: id }, { name, slug, description, });
            res.status(200).json({ message: "Category updated successfully", category: updated });
        }


    }
    catch (error) {
        res.json({ message: error.message })
    }
}

export const getCategory = async (_, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.status(200).json({ categories });
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json(category);
    }
    catch (error) {
        console.log(error)
    }
}

export const getCategoryBySlug = async (req, res) => {
    try {
        const category = await Category.findOne({ slug: req.params.slug });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json(category);
    }
    catch (error) {
        console.log(error)
    }
}

export const deleteCategoryById = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        await destroyFile(category.image.public_id)
        await Subcategory.updateMany({ category: category._id }, { $unset: { category: "" } })
        await Product.updateMany({ category: category._id }, { $unset: { category: "" } })
        res.status(200).json({ message: "Category deleted successfully" });
    }
    catch (error) {
        console.log(error)
    }
}

export const getCategoryByID = async (req, res) => {
    try {
        const { id } = req.params
        console.log(id)
        if (!id) {
            return res.status(400).json({ message: "Category Id is required" })
        }
        const category = await Category.findOne({ _id: id })
        if (!category) {
            return res.status(404).json({ message: "Category not found" })
        }
        return res.status(200).json({ category })
    }
    catch (error) {
        console.log(error)
    }
}

export const changeCategoryStatus = async (req, res) => {
    try {
        const { id, status } = req.body
        if (!id) {
            return res.status(400).json({ message: "Category Id is required" })
        }
        if (status == "active") {
            await Category.updateOne({ _id: id }, { status: "inactive" })
        }
        else {
            await Category.updateOne({ _id: id }, { status: "active" })
        }
        return res.status(200).json({ message: "Status changes successfully" })
    }
    catch (error) {
        console.log(error)
    }
}

export const getAvailableStoreCategories = async (req, res) => {
    try {
        const { storeId } = req.params;

        // Validate store ID
        if (!mongoose.Types.ObjectId.isValid(storeId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID"
            });
        }

        // Check store
        const store = await Store.findById(storeId);

        if (!store || store.status !== "active") {
            return res.status(404).json({
                success: false,
                message: "Store not found or inactive"
            });
        }

        // Get available inventory
        const inventories = await Inventory.find({
            store: storeId,
            status: "active",
            availableQuantity: { $gt: 0 }
        }).select("product");

        // Extract unique product IDs
        const productIds = [
            ...new Set(
                inventories.map(item => item.product.toString())
            )
        ];

        if (!productIds.length) {
            return res.status(200).json({
                success: true,
                count: 0,
                categories: []
            });
        }

        // Get active products
        const products = await Product.find({
            _id: { $in: productIds },
            isActive: true
        }).select("category");

        // Extract unique category IDs
        const categoryIds = [
            ...new Set(
                products.map(item => item.category.toString())
            )
        ];

        // Get active and non-deleted categories
        const categories = await Category.find({
            _id: { $in: categoryIds },
            status: "active",
            isDeleted: { $ne: true }
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Available store categories fetched successfully",
            count: categories.length,
            categories
        });

    } catch (error) {
        return handleResponseError(error, res);
    }
};