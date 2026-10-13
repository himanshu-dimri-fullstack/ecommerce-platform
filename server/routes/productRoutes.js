import express from "express";
import {
    getAllProducts,
    addProduct,
    getProductById,
    updateProduct,
    deleteProduct,
} from "../controllers/productController.js";


const router = express.Router();

router.post(
    "/admin/products",
    addProduct
);

router.get("/admin/products", getAllProducts);

router.get("/admin/products/:id", getProductById);

router.put(
    "/admin/products/:id",
    updateProduct
);

router.delete("/admin/products/:id", deleteProduct);

export default router;