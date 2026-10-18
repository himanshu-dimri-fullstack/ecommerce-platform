import express from "express";
import {
    addProductVariant,
    getAllProductVariants,
    getProductVariantById,
    updateProductVariant,
    deleteProductVariant,
    updateProductVariantStatus,
    getProductVariantBySlug
} from "../controllers/productVariantController.js";

const router = express.Router();

// Get all product variants
router.get("/admin/product/variant", getAllProductVariants);

// Get single product variant
router.get("/admin/product/variant/:id", getProductVariantById);
router.get("/admin/product/variant/slug/:slug", getProductVariantBySlug);

// Add product variant
router.post("/admin/product/variant", addProductVariant);

// Update product variant
router.put("/admin/product/variant/:id", updateProductVariant);

// Update product variant status
router.patch("/admin/product/variant/status", updateProductVariantStatus);

// Delete product variant
router.delete("/admin/product/variant/:id", deleteProductVariant);

export default router;