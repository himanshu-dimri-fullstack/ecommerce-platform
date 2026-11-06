import { uploadFile } from "../config/cloudinary.js"
import { destroyFile } from "../config/cloudinary.js"
import Subcategory from "../models/Subcategory.js";
import mongoose from "mongoose";
import Category from "../models/Category.js";
import { handleResponseError } from "../utils/errorUtils.js";
import Inventory from "../models/Inventory.js";
import Store from "../models/Store.js";
import Product from "../models/Product.js";
import ProductVariant from "../models/ProductVariant.js";

export const getAllProducts = async (req, res) => {
    try {
        const { subcategory } = req.query
        if (subcategory) {
            const getSubcategory = await Subcategory.findOne({ slug: subcategory })
            const products = await Product.find({ subcategory: getSubcategory._id })
                .sort({ createdAt: -1 }).populate("category", "name")
                .populate("subcategory", "name")
                .populate("brand", "name")
            return res.status(200).json({ products })
        }

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
        // if (!subcategory) {
        //     return res.status(400).json({
        //         message: "Subcategory is required.",
        //     });
        // }
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
        // if (!subcategory) {
        //     return res.status(400).json({
        //         message: "Subcategory is required.",
        //     });
        // }
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
            }

            const updated = await Product.updateOne({ _id: id }, {
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
            return res.status(200).json({
                message: "Product updated successfully.",
                product: updated
            });
        }
        else {
            const updated = await Product.updateOne({ _id: id }, {
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
            return res.status(200).json({
                message: "Product updated successfully.",
                product: updated
            });
        }

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

export const changeStatus = async (req, res) => {
    try {
        const { id } = req.body
        const product = await Product.findOne({ _id: id })
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }
        if (product.isActive) {
            await Product.updateOne({ _id: id }, { isActive: false })
        }
        else {
            await Product.updateOne({ _id: id }, { isActive: true })
        }
        return res.status(200).json({ message: "Status updated successfully" })
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
}



// SEARCH CATEGORIES AND PRODUCTS
export const getSearchSuggestions = async (req, res) => {
    try {
        const { storeId, q } = req.query;

        // Validate store ID
        if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
            return res.status(400).json({
                success: false,
                message: "Valid store ID is required"
            });
        }

        // Validate search query
        const searchQuery = String(q || "").trim();

        if (!searchQuery) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        if (searchQuery.length > 80) {
            return res.status(400).json({
                success: false,
                message: "Search query is too long"
            });
        }

        if (searchQuery.length < 2) {
            return res.status(200).json({
                success: true,
                categories: [],
                products: []
            });
        }

        // Check active store
        const store = await Store.findOne({
            _id: storeId,
            status: "active"
        }).select("_id");

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Active store not found"
            });
        }

        // Escape regex special characters
        const escapeRegex = (value) =>
            value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const searchRegex = new RegExp(
            escapeRegex(searchQuery),
            "i"
        );

        const storeObjectId = new mongoose.Types.ObjectId(storeId);

        // Get only products available in selected store
        const availableProducts = await Inventory.aggregate([
            {
                $match: {
                    store: storeObjectId,
                    status: "active",
                    availableQuantity: { $gt: 0 }
                }
            },
            {
                $lookup: {
                    from: Product.collection.name,
                    localField: "product",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" },
            {
                $match: {
                    "product.isActive": true,
                    "product.name": searchRegex
                }
            },
            {
                $lookup: {
                    from: ProductVariant.collection.name,
                    localField: "variant",
                    foreignField: "_id",
                    as: "variant"
                }
            },
            { $unwind: "$variant" },
            {
                $match: {
                    "variant.status": "active",
                    $expr: {
                        $eq: ["$variant.product", "$product._id"]
                    }
                }
            },
            {
                $group: {
                    _id: "$product._id",
                    product: { $first: "$product" }
                }
            },
            {
                $lookup: {
                    from: Category.collection.name,
                    localField: "product.category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: "$category" },
            {
                $project: {
                    _id: "$product._id",
                    name: "$product.name",
                    slug: "$product.slug",
                    images: "$product.images",
                    category: {
                        _id: "$category._id",
                        name: "$category.name",
                        slug: "$category.slug"
                    }
                }
            },
            { $sort: { name: 1 } },
            { $limit: 10 }
        ]);

        // Get category IDs having available products in this store
        const availableCategoryIds = await Inventory.aggregate([
            {
                $match: {
                    store: storeObjectId,
                    status: "active",
                    availableQuantity: { $gt: 0 }
                }
            },
            {
                $lookup: {
                    from: Product.collection.name,
                    localField: "product",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" },
            {
                $match: {
                    "product.isActive": true
                }
            },
            {
                $lookup: {
                    from: ProductVariant.collection.name,
                    localField: "variant",
                    foreignField: "_id",
                    as: "variant"
                }
            },
            { $unwind: "$variant" },
            {
                $match: {
                    "variant.status": "active",
                    $expr: {
                        $eq: ["$variant.product", "$product._id"]
                    }
                }
            },
            {
                $group: {
                    _id: "$product.category"
                }
            }
        ]);

        const categoryIds = availableCategoryIds.map(
            (item) => item._id
        );

        // Search only categories that have available products
        const categories = await Category.find({
            _id: { $in: categoryIds },
            name: searchRegex
        })
            .select("_id name slug image")
            .limit(10)
            .lean();

        return res.status(200).json({
            success: true,
            message: "Search suggestions fetched successfully",
            categories,
            products: availableProducts
        });

    } catch (error) {
        return handleResponseError(error, res);
    }
};






export const getAvailableCategoryProducts = async (req, res) => {
    try {
        const { categorySlug } = req.params;
        const { storeId } = req.query;

        // Validate store ID
        if (!mongoose.Types.ObjectId.isValid(storeId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID"
            });
        }

        // Find category
        const category = await Category.findOne({
            slug: categorySlug,
            status: "active",
            isDeleted: { $ne: true }
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Check store
        const store = await Store.findOne({
            _id: storeId,
            status: "active"
        });

        if (!store) {
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
        }).distinct("product");

        // Fetch products belonging to this category
        const products = await Product.find({
            _id: { $in: inventories },
            category: category._id,
            isActive: true
        })
            .populate("category", "name slug")
            .populate("subcategory", "name slug")
            .populate("brand", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Available category products fetched successfully",
            category,
            count: products.length,
            products
        });

    } catch (error) {
        return handleResponseError(error, res);
    }
};