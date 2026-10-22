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

router.get("/get", getAllProductVariants);

router.get("/get/:id", getProductVariantById);
router.get("/get/slug/:slug", getProductVariantBySlug);

router.post("/add", addProductVariant);

router.put("/update/:id", updateProductVariant);

router.patch("/update/status", updateProductVariantStatus);

router.delete("/delete/:id", deleteProductVariant);

export default router;