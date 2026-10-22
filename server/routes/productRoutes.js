import express from "express";
import {
    getAllProducts,
    addProduct,
    getProductById,
    updateProduct,
    deleteProduct,
    changeStatus
} from "../controllers/productController.js";


const router = express.Router();

router.post(
    "/add",
    addProduct
);

router.get("/get", getAllProducts);

router.get("/get/:id", getProductById);

router.put(
    "/update/:id",
    updateProduct
);

router.delete("/delete/:id", deleteProduct);
router.patch("/update/status", changeStatus);

export default router;