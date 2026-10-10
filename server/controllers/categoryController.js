import { uploadFile } from "../config/cloudinary.js";
import Category from "../models/Category.js";


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

        let image = req.files.image

        if (image) {
            const result = await uploadFile(image.tempFilePath, "ecommerce_platform/category")
            if (!result) {
                return res.json(400).json({ message: "Image upload failed" })
            }
            image = { url: result.secure_url, public_id: result.public_id }
        }

        const category = await Category.create({ name, slug, image, description, status: "active" });
        res.status(201).json({ message: "Category created successfully" });
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

        const { name, description } = req.body

        if (!name) {
            return res.status(400).json({ message: "Name is required" })
        }
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

        if (req.files) {
            let image = req.files.image
            const result = await uploadFile(image.tempFilePath, "ecommerce_platform/category")
            if (!result) {
                return res.json(400).json({ message: "Image upload failed" })
            }
            image = { url: result.secure_url, public_id: result.public_id }
            await Category.updateOne({ _id: id }, { name, slug, image, description, });
        }
        else {
            await Category.updateOne({ _id: id }, { name, slug, description, });
        }

        res.status(201).json({ message: "Category updated successfully" });
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
        console.log(error)
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