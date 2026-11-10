import mongoose from "mongoose";
import Inventory from "../models/Inventory.js";
import Store from "../models/Store.js";
import { handleResponseError } from "../utils/errorUtils.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

// HELPER: VALIDATE NUMBER
const getNumber = (value, fieldName) => {
    const number = Number(value);

    if (value === undefined || value === null || value === "" || !Number.isFinite(number) || number < 0) {
        throw new Error(`${fieldName} must be a valid non-negative number`);
    }

    return number;
};

// HELPER: OPTIONAL NUMBER
const getOptionalNumber = (value, defaultValue) => {
    if (value === undefined || value === null || value === "") {
        return defaultValue;
    }

    const number = Number(value);

    if (!Number.isFinite(number) || number < 0) {
        throw new Error("Invalid numeric value");
    }

    return number;
};


// CREATE INVENTORY
export const createInventory = async (req, res) => {
    try {
        const {
            product,
            store,
            variant,
            quantity,
            reservedQuantity,
            reorderLevel,
            maxStockLevel
        } = req.body;

        if (!product) {
            return res.status(400).json({
                success: false,
                message: "Product is required"
            });
        }

        if (!store) {
            return res.status(400).json({
                success: false,
                message: "Store is required"
            });
        }

        if (!variant) {
            return res.status(400).json({
                success: false,
                message: "Variant is required"
            });
        }
        if (!quantity) {
            return res.status(400).json({
                success: false,
                message: "Quantity is required"
            });
        }

        if (!reservedQuantity) {
            return res.status(400).json({
                success: false,
                message: "Reserved quantity is required"
            });
        }

        if (!reorderLevel) {
            return res.status(400).json({
                success: false,
                message: "Reorder level is required"
            });
        }

        if (!maxStockLevel) {
            return res.status(400).json({
                success: false,
                message: "Maximum Stock is required"
            });
        }

        // CONVERT VALUES INTO NUMBERS
        const finalQuantity = Number(quantity);
        const finalReservedQuantity = Number(reservedQuantity);
        const finalReorderLevel = Number(reorderLevel);
        const finalMaxStockLevel = Number(maxStockLevel);

        // VALIDATE NON-NEGATIVE INTEGERS
        const values = [
            finalQuantity,
            finalReservedQuantity,
            finalReorderLevel,
            finalMaxStockLevel
        ];

        if (
            values.some(
                (value) =>
                    !Number.isFinite(value) ||
                    value < 0 ||
                    !Number.isInteger(value)
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Stock quantities must be valid non-negative integers"
            });
        }

        // RESERVED QUANTITY VALIDATION
        if (finalReservedQuantity > finalQuantity) {
            return res.status(400).json({
                success: false,
                message: "Reserved quantity cannot exceed total quantity"
            });
        }

        // REORDER LEVEL VALIDATION
        if (finalReorderLevel > finalReservedQuantity) {
            return res.status(400).json({
                success: false,
                message: "Reorder level cannot exceed reserved quantity"
            });
        }

        // MAX STOCK LEVEL VALIDATION
        if (finalQuantity > finalMaxStockLevel) {
            return res.status(400).json({
                success: false,
                message: "Quantity cannot exceed maximum stock level"
            });
        }

        // CHECK STORE
        const existingStore = await Store.findById(store);

        if (!existingStore) {
            return res.status(404).json({
                success: false,
                message: "Store not found"
            });
        }

        // PREVENT DUPLICATE INVENTORY
        const existingInventory = await Inventory.findOne({
            product,
            store,
            variant
        });

        if (existingInventory) {
            return res.status(409).json({
                success: false,
                message: "Inventory already exists for this product and variant in this store"
            });
        }

        // CALCULATE AVAILABLE QUANTITY
        const availableQuantity =
            finalQuantity - finalReservedQuantity;

        // CREATE INVENTORY
        const inventory = await Inventory.create({
            product,
            store,
            variant,
            quantity: finalQuantity,
            reservedQuantity: finalReservedQuantity,
            reorderLevel: finalReorderLevel,
            maxStockLevel: finalMaxStockLevel,
            availableQuantity
        });

        return res.status(201).json({
            success: true,
            message: "Store inventory created successfully",
            inventory
        });

    } catch (error) {
        return handleResponseError(error, res);
    }
};



// GET ALL STORES WITH INVENTORY SUMMARY
export const getInventories = async (req, res) => {
    try {
        // FETCH ALL STORES
        const stores = await Store.find()
            .select("name code address status")
            .sort({ createdAt: -1 });

        // INVENTORY SUMMARY
        const inventorySummary = await Inventory.aggregate([
            {
                $group: {
                    _id: "$store",

                    // UNIQUE PRODUCTS
                    totalProducts: {
                        $addToSet: "$product"
                    },

                    // UNIQUE ACTIVE PRODUCTS
                    activeProducts: {
                        $addToSet: {
                            $cond: [
                                { $eq: ["$status", "active"] },
                                "$product",
                                null
                            ]
                        }
                    },

                    // UNIQUE INACTIVE PRODUCTS
                    inactiveProducts: {
                        $addToSet: {
                            $cond: [
                                { $eq: ["$status", "inactive"] },
                                "$product",
                                null
                            ]
                        }
                    },

                    // LOW STOCK INVENTORY RECORDS
                    lowStockItems: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$status", "active"] },
                                        {
                                            $lte: [
                                                "$availableQuantity",
                                                "$reorderLevel"
                                            ]
                                        }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    // TOTAL INVENTORY RECORDS
                    totalRecords: {
                        $sum: 1
                    }
                }
            }
        ]);

        // CREATE SUMMARY MAP
        const summaryMap = new Map(
            inventorySummary.map((item) => [
                String(item._id),
                {
                    totalProducts: item.totalProducts.filter(Boolean).length,
                    activeProducts: item.activeProducts.filter(Boolean).length,
                    inactiveProducts: item.inactiveProducts.filter(Boolean).length,
                    lowStockItems: item.lowStockItems,
                    totalRecords: item.totalRecords
                }
            ])
        );

        // RETURN ALL STORES, INCLUDING STORES WITHOUT INVENTORY
        const result = stores.map((store) => ({
            ...store.toObject(),

            summary: summaryMap.get(String(store._id)) || {
                totalProducts: 0,
                activeProducts: 0,
                inactiveProducts: 0,
                lowStockItems: 0,
                totalRecords: 0
            }
        }));

        return res.status(200).json({
            success: true,
            count: result.length,
            stores: result
        });

    } catch (error) {
        return handleResponseError(error, res);
    }
};


// GET INVENTORY BY STORE ID WITH SEARCH, PAGINATION & STATISTICS
export const getStoreInventory = async (req, res) => {
    try {
        const { storeId } = req.params;

        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(
            Math.max(Number(req.query.limit) || 10, 1),
            100
        );

        const search = (req.query.search || "").trim();

        if (!mongoose.Types.ObjectId.isValid(storeId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID"
            });
        }

        // GET STORE
        const store = await Store.findById(storeId)
            .select("name code address status");

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found"
            });
        }

        // SEARCH FILTER
        const filter = {
            store: storeId
        };

        if (search) {
            const escapedSearch = search.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            const searchRegex = new RegExp(escapedSearch, "i");

            const productRef = Inventory.schema
                .path("product")
                ?.options?.ref;

            const variantRef = Inventory.schema
                .path("variant")
                ?.options?.ref;

            if (!productRef || !variantRef) {
                throw new Error(
                    "Product or Variant reference is missing in Inventory schema"
                );
            }

            const ProductModel = mongoose.model(productRef);
            const VariantModel = mongoose.model(variantRef);

            const [productIds, variantIds] = await Promise.all([
                ProductModel.find({
                    name: searchRegex
                }).distinct("_id"),

                VariantModel.find({
                    $or: [
                        { name: searchRegex },
                        { sku: searchRegex }
                    ]
                }).distinct("_id")
            ]);

            if (productIds.length || variantIds.length) {
                filter.$or = [];

                if (productIds.length) {
                    filter.$or.push({
                        product: { $in: productIds }
                    });
                }

                if (variantIds.length) {
                    filter.$or.push({
                        variant: { $in: variantIds }
                    });
                }
            } else {
                // No matching product or variant
                filter._id = { $exists: false };
            }
        }

        // ALL STORE STATISTICS
        // These queries are independent of search and pagination.
        const [
            totalInventory,
            activeInventory,
            inactiveInventory,
            lowStockInventory
        ] = await Promise.all([
            Inventory.countDocuments({
                store: storeId
            }),

            Inventory.countDocuments({
                store: storeId,
                status: "active"
            }),

            Inventory.countDocuments({
                store: storeId,
                status: "inactive"
            }),

            Inventory.countDocuments({
                store: storeId,
                status: "active",
                $expr: {
                    $lte: [
                        {
                            $subtract: [
                                "$quantity",
                                "$reservedQuantity"
                            ]
                        },
                        "$reorderLevel"
                    ]
                }
            })
        ]);

        // SEARCH RESULT COUNT
        const filteredCount = await Inventory.countDocuments(filter);

        const totalPages = Math.ceil(filteredCount / limit);

        // Prevent invalid page after deleting the last record
        const currentPage = Math.min(
            page,
            Math.max(totalPages, 1)
        );

        const skip = (currentPage - 1) * limit;

        // PAGINATED INVENTORY
        const inventories = await Inventory.find(filter)
            .populate("product")
            .populate("variant")
            .sort({ createdAt: -1, _id: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            message: "Store inventory fetched successfully",

            store,

            // ALL STORE COUNTS
            count: totalInventory,
            totalInventory,

            statistics: {
                totalInventory,
                activeInventory,
                inactiveInventory,
                lowStockInventory
            },

            // SEARCH + PAGINATION COUNTS
            filteredCount,
            totalPages,
            currentPage,
            limit,
            search,

            inventories
        });

    } catch (error) {
        console.error("Get Store Inventory Error:", error);
        return handleResponseError(error, res);
    }
};


// GET INVENTORY BY ID
export const getInventoryById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid inventory ID"
            });
        }

        const inventory = await Inventory.findById(id)
            .populate("store")
            .populate("product")
            .populate("variant");

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: "Store inventory not found"
            });
        }

        return res.status(200).json({
            success: true,
            inventory
        });

    } catch (error) {
        return handleResponseError(error, res);
    }
};


// UPDATE INVENTORY

// UPDATE INVENTORY
export const updateInventory = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            product,
            store,
            variant,
            quantity,
            reservedQuantity,
            reorderLevel,
            maxStockLevel
        } = req.body;

        // VALIDATE INVENTORY ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid inventory ID"
            });
        }

        // REQUIRED FIELD VALIDATIONS
        if (!product) {
            return res.status(400).json({
                success: false,
                message: "Product is required"
            });
        }

        if (!store) {
            return res.status(400).json({
                success: false,
                message: "Store is required"
            });
        }

        if (!variant) {
            return res.status(400).json({
                success: false,
                message: "Variant is required"
            });
        }

        if (!quantity) {
            return res.status(400).json({
                success: false,
                message: "Quantity is required"
            });
        }

        if (!reservedQuantity) {
            return res.status(400).json({
                success: false,
                message: "Reserved quantity is required"
            });
        }

        if (!reorderLevel) {
            return res.status(400).json({
                success: false,
                message: "Reorder level is required"
            });
        }

        if (!maxStockLevel) {
            return res.status(400).json({
                success: false,
                message: "Maximum Stock is required"
            });
        }

        // CONVERT VALUES INTO NUMBERS
        const finalQuantity = Number(quantity);
        const finalReservedQuantity = Number(reservedQuantity);
        const finalReorderLevel = Number(reorderLevel);
        const finalMaxStockLevel = Number(maxStockLevel);

        // VALIDATE NON-NEGATIVE INTEGERS
        const values = [
            finalQuantity,
            finalReservedQuantity,
            finalReorderLevel,
            finalMaxStockLevel
        ];

        if (
            values.some(
                (value) =>
                    !Number.isFinite(value) ||
                    value < 0 ||
                    !Number.isInteger(value)
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Stock quantities must be valid non-negative integers"
            });
        }

        // RESERVED QUANTITY VALIDATION
        if (finalReservedQuantity > finalQuantity) {
            return res.status(400).json({
                success: false,
                message: "Reserved quantity cannot exceed total quantity"
            });
        }

        // REORDER LEVEL VALIDATION
        if (finalReorderLevel > finalReservedQuantity) {
            return res.status(400).json({
                success: false,
                message: "Reorder level cannot exceed reserved quantity"
            });
        }

        // MAX STOCK LEVEL VALIDATION
        if (finalQuantity > finalMaxStockLevel) {
            return res.status(400).json({
                success: false,
                message: "Quantity cannot exceed maximum stock level"
            });
        }

        // CHECK STORE
        const existingStore = await Store.findById(store);

        if (!existingStore) {
            return res.status(404).json({
                success: false,
                message: "Store not found"
            });
        }

        // PREVENT DUPLICATE INVENTORY, EXCLUDING CURRENT RECORD
        const duplicateInventory = await Inventory.findOne({
            _id: { $ne: id },
            product,
            store,
            variant
        });

        if (duplicateInventory) {
            return res.status(409).json({
                success: false,
                message: "Inventory already exists for this product and variant in this store"
            });
        }

        // CALCULATE AVAILABLE QUANTITY
        const availableQuantity =
            finalQuantity - finalReservedQuantity;

        // UPDATE INVENTORY
        const inventory = await Inventory.findByIdAndUpdate(
            id,
            {
                $set: {
                    product,
                    store,
                    variant,
                    quantity: finalQuantity,
                    reservedQuantity: finalReservedQuantity,
                    reorderLevel: finalReorderLevel,
                    maxStockLevel: finalMaxStockLevel,
                    availableQuantity
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: "Store inventory not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Store inventory updated successfully",
            inventory
        });

    } catch (error) {
        return handleResponseError(error, res);
    }
};



// DELETE INVENTORY
export const deleteInventory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid inventory ID"
            });
        }

        const inventory = await Inventory.findByIdAndDelete(id);

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: "Store inventory not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Store inventory deleted successfully"
        });

    } catch (error) {
        return handleResponseError(error, res);
    }
};


// CHANGE INVENTORY STATUS
export const changeStatus = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid inventory ID"
            });
        }

        const inventory = await Inventory.findById(id);

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: "Inventory not found"
            });
        }

        inventory.status =
            inventory.status === "active" ? "inactive" : "active";

        await inventory.save();

        return res.status(200).json({
            success: true,
            message: `Inventory ${inventory.status} successfully`,
            inventory
        });

    } catch (error) {
        return handleResponseError(error, res);
    }
};



// GET AVAILABLE STORE INVENTORY (CUSTOMER)
// Returns ProductVariants, not Product documents.
export const getAvailableStoreInventory = async (req, res) => {
    try {
        const { storeId } = req.params;
        const {
            category: categorySlug,
            product: productSlug,
        } = req.query;

        // PAGINATION
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(
            Math.max(Number(req.query.limit) || 20, 1),
            50
        );
        const skip = (page - 1) * limit;

        // VALIDATE STORE ID
        if (!mongoose.Types.ObjectId.isValid(storeId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID",
            });
        }

        // CHECK STORE
        const store = await Store.findById(storeId).select(
            "_id name status"
        );

        if (!store || store.status !== "active") {
            return res.status(404).json({
                success: false,
                message: "Store not found or inactive",
            });
        }

        // BASE INVENTORY FILTER
        const inventoryFilter = {
            store: storeId,
            status: "active",
            availableQuantity: { $gt: 0 },
        };

        /*
         * CATEGORY + PRODUCT FILTER
         *
         * category only:
         *   all variants belonging to products in that category
         *
         * product only:
         *   all variants belonging to that product
         *
         * category + product:
         *   variants belonging to that product AND category
         */
        if (categorySlug || productSlug) {
            const productFilter = {};

            if (categorySlug) {
                const category = await Category.findOne({
                    slug: categorySlug,
                }).select("_id");

                if (!category) {
                    return res.status(200).json({
                        success: true,
                        message: "No variants found",
                        store: store.name,
                        count: 0,
                        pagination: {
                            currentPage: page,
                            limit,
                            totalVariants: 0,
                            totalPages: 0,
                            hasNextPage: false,
                            hasPreviousPage: page > 1,
                        },
                        variants: [],
                    });
                }

                productFilter.category = category._id;
            }

            if (productSlug) {
                productFilter.slug = productSlug;
            }

            // Product query combines category and product with AND.
            const productIds = await Product.find(productFilter)
                .distinct("_id");

            if (!productIds.length) {
                return res.status(200).json({
                    success: true,
                    message: "No variants found",
                    store: store.name,
                    count: 0,
                    pagination: {
                        currentPage: page,
                        limit,
                        totalVariants: 0,
                        totalPages: 0,
                        hasNextPage: false,
                        hasPreviousPage: page > 1,
                    },
                    variants: [],
                });
            }

            inventoryFilter.product = {
                $in: productIds,
            };
        }

        // COUNT MATCHING INVENTORY VARIANTS BEFORE PAGINATION
        const totalVariants = await Inventory.countDocuments(
            inventoryFilter
        );

        // FETCH ONLY THE REQUESTED PAGE
        const inventories = await Inventory.find(inventoryFilter)
            .populate("product")
            .populate("variant")
            .sort({ createdAt: -1, _id: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // RETURN VARIANT DATA WITH PRODUCT + STORE INVENTORY DETAILS
        const variants = inventories
            .filter((item) => item.product && item.variant)
            .map((item) => ({
                ...item.variant,
                product: item.product,
                availableQuantity: item.availableQuantity,
                inventoryId: item._id,
            }));

        const totalPages = Math.ceil(totalVariants / limit);

        return res.status(200).json({
            success: true,
            message: "Available store variants fetched successfully",
            store: store.name,
            count: variants.length,
            pagination: {
                currentPage: page,
                limit,
                totalVariants,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
            variants,
        });
    } catch (error) {
        console.error("Get available store inventory error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch available store variants",
            error: error.message,
        });
    }
};



// GET FEATURED PRODUCTS BY STORE ID (CUSTOMER)
export const getFeaturedStoreProducts = async (req, res) => {
    try {
        const { storeId } = req.params;

        // VALIDATE STORE ID
        if (!mongoose.Types.ObjectId.isValid(storeId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID",
            });
        }

        // CHECK STORE
        const store = await Store.findById(storeId)
            .select("name code address status");

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found",
            });
        }

        if (store.status !== "active") {
            return res.status(404).json({
                success: false,
                message: "Store is currently unavailable",
            });
        }

        // GET ACTIVE INVENTORY WITH AVAILABLE STOCK
        const inventories = await Inventory.find({
            store: storeId,
            status: "active",
            availableQuantity: { $gt: 0 },
        })
            .select("product variant")
            .populate("variant", "sellingPrice")
            .sort({ createdAt: -1 })
            .lean();

        // STORE MINIMUM AVAILABLE VARIANT PRICE PER PRODUCT
        const productPrices = new Map();

        inventories.forEach((item) => {
            if (!item.product || !item.variant) return;

            const productId = String(item.product);
            const price = Number(item.variant.sellingPrice);

            if (!Number.isFinite(price) || price < 0) return;

            const existingPrice = productPrices.get(productId);

            if (
                existingPrice === undefined ||
                price < existingPrice
            ) {
                productPrices.set(productId, price);
            }
        });

        const productIds = [...productPrices.keys()];

        if (!productIds.length) {
            return res.status(200).json({
                success: true,
                message: "Featured store products fetched successfully",
                store,
                count: 0,
                products: [],
            });
        }

        // GET FEATURED PRODUCTS
        const products = await Product.find({
            _id: { $in: productIds },
            isFeatured: true,
        })
            .populate("category")
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        // ATTACH STARTING PRICE
        const featuredProducts = products.map((product) => ({
            ...product,
            startingPrice: productPrices.get(
                String(product._id)
            ),
        }));

        return res.status(200).json({
            success: true,
            message: "Featured store products fetched successfully",
            store,
            count: featuredProducts.length,
            products: featuredProducts,
        });

    } catch (error) {
        console.error("Get Featured Store Products Error:", error);
        return handleResponseError(error, res);
    }
};
