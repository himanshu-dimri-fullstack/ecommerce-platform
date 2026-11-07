import Subcategory from "../models/Subcategory.js";
import Category from "../models/Category.js";
import { uploadFile } from "../config/cloudinary.js"
import { destroyFile } from "../config/cloudinary.js"
import Product from "../models/Product.js"
import { handleResponseError } from "../utils/errorUtils.js"

export const createSubcategory = async (req, res) => {
    try {
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

        let image
        if (req.files) {
            image = req.files.image
            const result = await uploadFile(image.tempFilePath, "ecommerce_platform/subcategory")
            if (!result) {
                return res.json(400).json({ message: "Image upload failed" })
            }
            image = { url: result.secure_url, public_id: result.public_id }
            const subcategory = await Subcategory.create({ name, description, slug, category, image });
            res.status(201).json({ message: "Subcategory created successfully" }, subcategory);
        }
        else {
            const subcategory = await Subcategory.create({ name, description, slug, category });
            res.status(201).json({ message: "Subcategory created successfully" }, subcategory);
        }


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

        const { name, description, category, existingImage } = req.body

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

        if (!existingImage) {
            await destroyFile(subcategory.image.public_id)
            await Subcategory.updateOne({ _id: id }, { $unset: { image: "" } })
        }

        if (req.files) {
            await destroyFile(subcategory.image.public_id)
            let image = req.files.image
            const result = await uploadFile(image.tempFilePath, "ecommerce_platform/subcategory")
            if (!result) {
                return res.json(400).json({ message: "Image upload failed" })
            }
            image = { url: result.secure_url, public_id: result.public_id }
            const updated = await Subcategory.updateOne({ _id: id }, { name, description, slug, category, image, });
            res.status(200).json({ message: "Subcategory updated successfully", subcategory: updated });
        }
        else {
            const updated = await Subcategory.updateOne({ _id: id }, { name, description, slug, category });
            res.status(200).json({ message: "Subcategory updated successfully", subcategory: updated });
        }


    }
    catch (error) {
        console.log(error)
        return res.status(400).json({ message: error.message })
    }

}

export const getAllSubcategory = async (req, res) => {
    try {
        const {
            category,
            search = "",
            page,
            limit,
        } = req.query;

        const filter = {};

        // Category filter
        if (category) {
            const getCategory = await Category.findOne({
                slug: category,
            });

            if (!getCategory) {
                return res.status(200).json({
                    success: true,
                    subcategories: [],
                    totalSubcategories: 0,
                    activeSubcategories: 0,
                    inactiveSubcategories: 0,
                    totalPages: 0,
                    currentPage: Number(page) || 1,
                    limit: Number(limit) || 10,
                });
            }

            filter.category = getCategory._id;
        }

        // Search only by subcategory name
        if (search.trim()) {
            const escapedSearch = search.trim().replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            filter.name = {
                $regex: escapedSearch,
                $options: "i",
            };
        }

        // Pagination is optional to preserve existing API usage
        const shouldPaginate =
            page !== undefined || limit !== undefined;

        const currentPage = Math.max(1, Number(page) || 1);
        const pageLimit = Math.min(
            100,
            Math.max(1, Number(limit) || 10)
        );

        const skip = (currentPage - 1) * pageLimit;

        const [
            subcategories,
            totalSubcategories,
            activeSubcategories,
            inactiveSubcategories,
        ] = await Promise.all([
            Subcategory.find(filter)
                .populate("category", "name slug")
                .sort({ createdAt: -1 })
                .skip(shouldPaginate ? skip : 0)
                .limit(shouldPaginate ? pageLimit : 0),

            Subcategory.countDocuments(filter),

            Subcategory.countDocuments({
                ...filter,
                status: "active",
            }),

            Subcategory.countDocuments({
                ...filter,
                status: { $ne: "active" },
            }),
        ]);

        return res.status(200).json({
            success: true,
            message: "Subcategories fetched successfully",
            subcategories,
            totalSubcategories,
            activeSubcategories,
            inactiveSubcategories,
            currentPage,
            limit: pageLimit,
            totalPages: Math.ceil(
                totalSubcategories / pageLimit
            ),
        });

    } catch (error) {
        console.error("Get All Subcategories Error:", error);
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
        await destroyFile(subcategory.image.public_id)
        await Product.updateMany({ subcategory: subcategory._id }, { $unset: { subcategory: "" } })
        await Subcategory.deleteOne({ _id: id });
        res.status(200).json({ message: "Subcategory deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
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