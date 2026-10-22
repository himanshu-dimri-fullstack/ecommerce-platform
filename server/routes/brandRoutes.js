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

router.get("/get", Auth, getBrands);

router.post("/add", Auth, Permission("brand:add"), createBrand);

router.put("/update/:id", Auth, updateBrand);

router.get("/get/:id", Auth, getBrandById);

router.delete("/delete/:id", Auth, deleteBrand);

router.patch("/update/status/:id", Auth, updateBrandStatus);

export default router;