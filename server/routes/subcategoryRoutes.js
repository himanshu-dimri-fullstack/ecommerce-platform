import express from "express"
import {
    createSubcategory, getAllSubcategory, getSubcategoryById,
    deleteSubcategoryById, updateSubcategory, changeSubcategoryStatus
} from "../controllers/subcategoryController.js";
import { Auth } from "../middlewares/Auth.js";

const router = express.Router();

router.get("/admin/subcategories", getAllSubcategory)
router.get("/admin/subcategories/:id", getSubcategoryById);
router.post("/admin/subcategories", Auth, createSubcategory)
router.put("/admin/subcategories/:id", Auth, updateSubcategory)
router.delete("/admin/subcategories/:id", Auth, deleteSubcategoryById)
router.patch("/admin/subcategory/status", Auth, changeSubcategoryStatus);

export default router