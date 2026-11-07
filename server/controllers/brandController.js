
import { uploadFile } from "../config/cloudinary.js";
import Brand from "../models/Brand.js";
import { handleResponseError } from "../utils/errorUtils.js"
import { destroyFile } from "../config/cloudinary.js"

export const createBrand = async (req, res) => {
    try {
        const { name, description } = req.body
        if (!name) {
            return res.status(200).json({ message: "Name is required" })
        }
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

        if (req.files) {
            let image = req.files.image
            const result = await uploadFile(image.tempFilePath, "ecommerce_platform/brand")
            if (!result) {
                return res.status(400).json({ message: "Image upload failed" })
            }
            image = {
                url: result.secure_url,
                public_id: result.public_id
            }
            await Brand.create({ name, description, image, slug })
        }
        else {
            await Brand.create({ name, description, slug })
        }
        return res.status(200).json({ message: "Brand created successfully" })
    }
    catch (error) {
        return handleResponseError(error, res)
    }
}

export const updateBrand = async (req, res) => {
    try {
        const { id } = req.params
        const brand = await Brand.findOne({ _id: id })
        if (!brand) {
            return res.status(400).json({ message: "Brand not found" })
        }
        const { name, description, existingImage } = req.body
        if (!name) {
            return res.status(200).json({ message: "Name is required" })
        }
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

        if (!existingImage) {
            await destroyFile(brand.image.public_id)
            await Brand.updateOne({ _id: id }, { $unset: { image: "" } })
        }

        if (req.files) {
            let image = req.files.image
            await destroyFile(brand.image.public_id)
            const result = await uploadFile(image.tempFilePath, "ecommerce_platform/brand")
            if (!result) {
                return res.status(400).json({ message: "Image upload failed" })
            }
            image = {
                url: result.secure_url,
                public_id: result.public_id
            }
            const updated = await Brand.updateOne({ _id: id }, { name, description, image, slug })
            return res.status(200).json({ message: "Brand updated successfully", brand: updated })
        }
        else {
            const updated = await Brand.updateOne({ _id: id }, { name, description, slug })
            return res.status(200).json({ message: "Brand updated successfully", brand: updated })
        }

    }
    catch (error) {
        return handleResponseError(error, res)
    }
}

export const getBrands = async (req, res) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);

        const limit = Math.min(
            Math.max(Number(req.query.limit) || 10, 1),
            100
        );

        const search = req.query.search?.trim() || "";

        const filter = {};

        if (search) {
            const escapedSearch = search.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            filter.$or = [
                {
                    name: {
                        $regex: escapedSearch,
                        $options: "i",
                    },
                },
                {
                    slug: {
                        $regex: escapedSearch,
                        $options: "i",
                    },
                },
            ];
        }

        const [
            totalBrands,
            activeBrands,
            inactiveBrands,
            filteredCount,
        ] = await Promise.all([
            Brand.countDocuments(),

            Brand.countDocuments({
                status: "active",
            }),

            Brand.countDocuments({
                status: "inactive",
            }),

            Brand.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(filteredCount / limit);

        // Keep the requested page within the available range.
        const currentPage = Math.min(
            page,
            Math.max(totalPages, 1)
        );

        const brands = await Brand.find(filter)
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * limit)
            .limit(limit);

        return res.status(200).json({
            brands,
            totalBrands,
            activeBrands,
            inactiveBrands,
            filteredCount,
            totalPages,
            currentPage,
            limit,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

export const getBrandById = async (req, res) => {
    try {
        const { id } = req.params
        const brand = await Brand.findOne({ _id: id })
        if (!brand) {
            return res.status(404).json({ message: "Brand not found" })
        }
        return res.status(200).json({ brand })
    }
    catch (error) {
        return handleResponseError(error, res)
    }
}

export const updateBrandStatus = async (req, res) => {
    try {
        const { id } = req.params
        const brand = await Brand.findOne({ _id: id })
        if (!brand) {
            return res.status(404).json({ message: "Brand not found" })
        }
        if (brand.status == "active") {
            await Brand.updateOne({ _id: id }, { status: "inactive" })
        }
        else {
            await Brand.updateOne({ _id: id }, { status: "active" })
        }
        return res.status(200).json({ message: "Status changed successfully" })
    }
    catch (error) {
        return handleResponseError(error, res)
    }
}

export const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params
        const brand = await Brand.findOne({ _id: id })
        if (!brand) {
            return res.status(404).json({ message: "Brand not found" })
        }
        await destroyFile(brand.image.public_id)
        await Brand.deleteOne({ _id: id })
        return res.status(200).json({ message: "Brand deleted successfully" })
    }
    catch (error) {
        return handleResponseError(error, res)
    }
}