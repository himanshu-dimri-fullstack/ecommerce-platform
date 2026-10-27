import express from "express"
import { createCategory, updateCategory, getCategory, getCategoryBySlug, getCategoryByID, changeCategoryStatus, getCategoryById, deleteCategoryById } from "../controllers/categoryController.js";
import { Auth } from "../middlewares/Auth.js";
import { Permission } from "../middlewares/Permission.js";

const router = express.Router();

router.post("/add", Auth, Permission("category:add"), createCategory)
router.get("/get", getCategory)
// router.get("/admin/categories/:slug", getCategoryBySlug);
router.get("/get/:id", Auth, Permission("category:read"), getCategoryByID);
router.patch("/update/status", Auth, changeCategoryStatus);
router.put("/update/:id", Auth, Permission("category:update"), updateCategory)
router.delete("/delete/:id", Auth, Permission("category:delete"), deleteCategoryById)

export default router