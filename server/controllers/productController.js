import Product from "../models/Product.js";
import { uploadFile } from "../config/cloudinary.js"
import { destroyFile } from "../config/cloudinary.js"

export const getAllProducts = async (_, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 }).populate("category", "name")
            .populate("subcategory", "name")
            .populate("brand", "name")
        return res.status(200).json({ products })
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const addProduct = async (req, res) => {

    try {
        const {
            category,
            subcategory,
            brand,
            name,
            description,
            unit,
            isFeatured,
            tags
        } = req.body;

        if (!category) {
            return res.status(400).json({
                message: "Category is required.",
            });
        }
        if (!subcategory) {
            return res.status(400).json({
                message: "Subcategory is required.",
            });
        }
        if (!brand) {
            return res.status(400).json({
                message: "Brand is required.",
            });
        }
        if (!name) {
            return res.status(400).json({
                message: "Name is required.",
            });
        }

        let finalTags
        if (tags) {
            finalTags = JSON.parse(tags)
        }

        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

        let images = []

        if (req.files) {
            const files = req.files.images

            if (Array.isArray(files)) {
                for (const file of files) {
                    if (!file.mimetype?.startsWith("image/")) {
                        return res.status(400).json({
                            message: "Only image files are allowed.",
                        });
                    }

                    const result = await uploadFile(file.tempFilePath, "ecommerce_platform/products");
                    if (!result) {
                        return res.status(400).json({ message: "Image upload fails" })
                    }
                    images.push({
                        url: result.secure_url,
                        public_id: result.public_id,
                    });
                }
            }
            else {
                const result = await uploadFile(files.tempFilePath, "ecommerce_platform/products");
                if (!result) {
                    return res.status(400).json({ message: "Image upload fails" })
                }
                images.push({
                    url: result.secure_url,
                    public_id: result.public_id,
                });
            }

            await Product.create({
                category,
                subcategory,
                brand,
                name,
                slug,
                description,
                images,
                unit,
                tags: finalTags,
                isFeatured
            });
        }
        else {
            await Product.create({
                category,
                subcategory,
                brand,
                name,
                slug,
                description,
                unit,
                tags: finalTags,
                isFeatured
            });
        }

        return res.status(201).json({
            message: "Product created successfully.",
        });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            error: error.message,
        });
    }
};

export const updateProduct = async (req, res) => {

    try {
        const { id } = req.params
        const product = await Product.findOne({ _id: id })
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        const {
            category,
            subcategory,
            brand,
            name,
            description,
            unit,
            isFeatured,
            tags,
            existingImages
        } = req.body;

        if (!category) {
            return res.status(400).json({
                message: "Category is required.",
            });
        }
        if (!subcategory) {
            return res.status(400).json({
                message: "Subcategory is required.",
            });
        }
        if (!brand) {
            return res.status(400).json({
                message: "Brand is required.",
            });
        }
        if (!name) {
            return res.status(400).json({
                message: "Name is required.",
            });
        }

        let finalTags
        if (tags) {
            finalTags = JSON.parse(tags)
        }

        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");


        // DELETE EXISTING IMAGES

        let finalExistingImages = []
        if (existingImages) {
            finalExistingImages = JSON.parse(existingImages)
            console.log("mytype", typeof finalExistingImages)
            for (let i = 0; i < product.images.length; i++) {
                let image = finalExistingImages.find((item) => item.url === product.images[i].url)
                if (!image) {
                    await destroyFile(product.images[i].public_id)
                }
            }
        }
        else {
            if (product.images.length > 0) {
                for (let i = 0; i < product.images.length; i++) {
                    await destroyFile(product.images[i].public_id)
                }
                await Product.updateOne({ _id: id }, { $unset: { images: "" } })
            }
        }

        let images = finalExistingImages

        if (req.files || images.length > 0) {
            if (req.files) {
                const files = req.files?.images
                for (const file of files) {
                    if (!file.mimetype?.startsWith("image/")) {
                        return res.status(400).json({
                            message: "Only image files are allowed.",
                        });
                    }

                    const result = await uploadFile(file.tempFilePath, "ecommerce_platform/products");
                    if (!result) {
                        return res.status(400).json({ message: "Image upload fails" })
                    }
                    images.push({
                        url: result.secure_url,
                        public_id: result.public_id,
                    });
                }
            }

            await Product.updateOne({ _id: id }, {
                category,
                subcategory,
                brand,
                name,
                slug,
                description,
                images,
                unit,
                tags: finalTags,
                isFeatured
            });
        }
        else {
            await Product.updateOne({ _id: id }, {
                category,
                subcategory,
                brand,
                name,
                slug,
                description,
                unit,
                tags: finalTags,
                isFeatured
            });
        }
        return res.status(201).json({
            message: "Product updated successfully.",
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error.message,
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params
        const product = await Product.findOne({ _id: id }).populate("category", "name")
            .populate("subcategory", "name")
            .populate("brand", "name")
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }
        return res.status(200).json({ product })
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findOne({ _id: id });

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        for (let i = 0; i < product.images.length; i++) {
            await destroyFile(product.images[i].public_id)
        }

        await Product.deleteOne({ _id: id })

        return res.status(200).json({
            message: "Product deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
}