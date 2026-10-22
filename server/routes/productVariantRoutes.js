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
router.get("/get", getAllProductVariants);

// Get single product variant
router.get("/get/:id", getProductVariantById);
router.get("/get/slug/:slug", getProductVariantBySlug);

// Add product variant
router.post("/add", addProductVariant);

// Update product variant
router.put("/update/:id", updateProductVariant);

// Update product variant status
router.patch("/update/status", updateProductVariantStatus);

// Delete product variant
router.delete("/delete/:id", deleteProductVariant);

export default router;