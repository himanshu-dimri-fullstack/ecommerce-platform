
import { uploadFile } from "../config/cloudinary.js";
import Brand from "../models/Brand.js";
import { handleResponseError } from "../utils/errorUtils.js"

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
            await Brand.updateOne({ _id: id }, { name, description, image, slug })
        }
        else {
            await Brand.updateOne({ _id: id }, { name, description, slug })
        }
        return res.status(200).json({ message: "Brand updated successfully" })
    }
    catch (error) {
        return handleResponseError(error, res)
    }
}

export const getBrands = async (_, res) => {
    try {
        const brands = await Brand.find().sort({ createdAt: -1 })
        return res.status(200).json({ brands })
    }
    catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

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
        await Brand.deleteOne({ _id: id })
        return res.status(200).json({ message: "Brand deleted successfully" })
    }
    catch (error) {
        return handleResponseError(error, res)
    }
}