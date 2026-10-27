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
import { Auth } from "../middlewares/Auth.js";
import { Permission } from "../middlewares/Permission.js";

const router = express.Router();

router.get("/get", getAllProductVariants);

router.get("/get/:id", Auth, Permission("productVariant:read"), getProductVariantById);
router.get("/get/slug/:slug", getProductVariantBySlug);

router.post("/add", Auth, Permission("productVariant:add"), addProductVariant);

router.put("/update/:id", Auth, Permission("productVariant:update"), updateProductVariant);

router.patch("/update/status", updateProductVariantStatus);

router.delete("/delete/:id", Auth, Permission("productVariant:delete"), deleteProductVariant);

export default router;