import express from "express";
import {
    getAllProducts,
    addProduct,
    getProductById,
    updateProduct,
    deleteProduct,
    changeStatus,
    getAvailableCategoryProducts,
    getSearchSuggestions
} from "../controllers/productController.js";
import { Auth } from "../middlewares/Auth.js";
import { Permission } from "../middlewares/Permission.js";


const router = express.Router();

router.post(
    "/add",
    Auth, Permission("product:add"),
    addProduct
);

router.get("/get", getAllProducts);

router.get("/get/:id", Auth, Permission("product:read"), getProductById);

router.put(
    "/update/:id",
    Auth, Permission("product:update"),
    updateProduct
);

router.delete("/delete/:id", Auth, Permission("product:delete"), deleteProduct);
router.patch("/update/status", changeStatus);

router.get(
    "/available/category/:categorySlug",
    getAvailableCategoryProducts
);

router.get("/search-suggestions", getSearchSuggestions);

export default router;