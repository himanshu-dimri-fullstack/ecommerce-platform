import express from "express"
import { createCategory, updateCategory, getCategory, getCategoryBySlug, getCategoryByID, changeCategoryStatus, getCategoryById, deleteCategoryById } from "../controllers/categoryController.js";
import { Auth } from "../middlewares/Auth.js";

const router = express.Router();

router.post("/add", Auth, createCategory)
router.get("/get", getCategory)
// router.get("/admin/categories/:slug", getCategoryBySlug);
router.get("/get/:id", Auth, getCategoryByID);
router.patch("/update/status", Auth, changeCategoryStatus);
router.put("/update/:id", Auth, updateCategory)
router.delete("/delete/:id", Auth, deleteCategoryById)

export default router