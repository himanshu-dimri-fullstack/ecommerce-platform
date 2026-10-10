import express from "express"
import { createCategory, updateCategory, getCategory, getCategoryBySlug, getCategoryByID, changeCategoryStatus, getCategoryById, deleteCategoryById } from "../controllers/categoryController.js";
import { Auth } from "../middlewares/Auth.js";

const router = express.Router();

router.post("/admin/categories", Auth, createCategory)
router.get("/admin/categories", getCategory)
// router.get("/admin/categories/:slug", getCategoryBySlug);
router.get("/admin/categories/:id", Auth, getCategoryByID);
router.patch("/admin/category/status", Auth, changeCategoryStatus);
router.put("/admin/categories/:id", Auth, updateCategory)
router.delete("/admin/categories/:id", Auth, deleteCategoryById)

export default router