import Subcategory from "../models/Subcategory.js";
import Category from "../models/Category.js";
import { uploadFile } from "../config/cloudinary.js"

export const createSubcategory = async (req, res) => {
    try {
        const { name, description, category } = req.body

        if (!name) {
            return res.status(400).json({ message: "Name is required" })
        }
        if (!category) {
            return res.status(400).json({ message: "Category is required" })
        }
        let image = req.files.image
        if (image) {
            const result = await uploadFile(image.tempFilePath, "ecommerce_platform/subcategory")
            if (!result) {
                return res.json(400).json({ message: "Image upload failed" })
            }
            image = { url: result.secure_url, public_id: result.public_id }
        }
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
        const subcategory = await Subcategory.create({ name, description, slug, category, image, status: "active" });
        res.status(201).json({ message: "Subcategory created successfully" }, subcategory);
    }
    catch (error) {
        return res.status(400).json({ message: error.message })
    }

}

export const updateSubcategory = async (req, res) => {
    try {
        const { id } = req.params

        const subcategory = await Subcategory.findOne({ _id: id })

        if (!subcategory) {
            return res.status(404).json({ message: "Subcategory not found" })
        }

        const { name, description, category } = req.body

        if (!name) {
            return res.status(400).json({ message: "Name is required" })
        }
        if (!category) {
            return res.status(400).json({ message: "Category is required" })
        }
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

        if (req.files) {
            let image = req.files.image
            const result = await uploadFile(image.tempFilePath, "ecommerce_platform/subcategory")
            if (!result) {
                return res.json(400).json({ message: "Image upload failed" })
            }
            image = { url: result.secure_url, public_id: result.public_id }
            await Subcategory.updateOne({ _id: id }, { name, description, slug, category, image, });
        }
        else {
            await Subcategory.updateOne({ _id: id }, { name, description, slug, category });
        }

        res.status(201).json({ message: "Subcategory updated successfully" }, subcategory);
    }
    catch (error) {
        console.log(error)
        return res.status(400).json({ message: error.message })
    }

}

export const getAllSubcategory = async (req, res) => {
    try {
        const subcategories = await Subcategory
            .find()
            .populate("category", "name").sort({ createdAt: -1 });

        res.status(200).json({ subcategories });

    } catch (error) {
        return handleResponseError(error, res);
    }
};

export const getSubcategoryById = async (req, res) => {
    try {
        const { id } = req.params

        const subcategory = await Subcategory.findOne({ _id: id }).populate("category", "name")

        if (!subcategory) {
            return res.status(404).json({ message: "Subcategory not found" });
        }

        res.status(200).json({ subcategory });
    }
    catch (error) {
        console.log(error)
        return res.status(400).json({ message: error.message })
    }
}

export const getSubcategoryBySlug = async (req, res) => {
    try {
        const subcategory = await Subcategory.findOne({ slug: req.params.slug });

        if (!subcategory) {
            return res.status(404).json({ message: "Subcategory not found" });
        }
        res.status(200).json(subcategory);
    }
    catch (error) {
        return handleResponseError(error, res, "Subcategory");
    }
}

export const getSubcategoryByIdAndUpdate = async (req, res) => {
    try {
        const subcategory = await Subcategory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!subcategory) {
            return res.status(404).json({ message: "Subcategory not found" });
        }
        res.status(200).json(subcategory);
    }
    catch (error) {
        return handleResponseError(error, res, "Subcategory");
    }
}

export const deleteSubcategoryById = async (req, res) => {
    try {
        const { id } = req.params
        const subcategory = await Subcategory.findOne({ _id: id })
        if (!subcategory) {
            return res.status(404).json({ message: "Subcategory not found" });
        }
        await Subcategory.deleteOne({ _id: id });
        res.status(200).json({ message: "Subcategory deleted successfully" });
    }
    catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

export const changeSubcategoryStatus = async (req, res) => {
    try {
        const { id, status } = req.body
        if (!id) {
            return res.status(400).json({ message: "Subcategory Id is required" })
        }
        if (status == "active") {
            await Subcategory.updateOne({ _id: id }, { status: "inactive" })
        }
        else {
            await Subcategory.updateOne({ _id: id }, { status: "active" })
        }
        return res.status(200).json({ message: "Status changes successfully" })
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
}