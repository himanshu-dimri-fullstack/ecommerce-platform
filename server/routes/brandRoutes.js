import express from "express";

import {
    getBrands,
    createBrand,
    updateBrand,
    getBrandById,
    updateBrandStatus,
    deleteBrand
} from "../controllers/brandController.js";
import { Auth } from "../middlewares/Auth.js";
import { Permission } from "../middlewares/Permission.js";

const router = express.Router();

router.get("/admin/brands", Auth, getBrands);

router.post("/admin/brands", Auth, Permission("brands:add"), createBrand);

router.put("/admin/brands/:id", Auth, updateBrand);

router.get("/admin/brands/:id", Auth, getBrandById);

router.delete("/admin/brands/:id", Auth, deleteBrand);

router.patch("/admin/brands/status/:id", Auth, updateBrandStatus);

export default router;