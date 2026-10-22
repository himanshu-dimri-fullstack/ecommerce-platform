import express from "express"
import {
    createSubcategory, getAllSubcategory, getSubcategoryById,
    deleteSubcategoryById, updateSubcategory, changeSubcategoryStatus
} from "../controllers/subcategoryController.js";
import { Auth } from "../middlewares/Auth.js";

const router = express.Router();

router.get("/get", getAllSubcategory)
router.get("/get/:id", getSubcategoryById);
router.post("/add", Auth, createSubcategory)
router.put("/update/:id", Auth, updateSubcategory)
router.delete("/delete/:id", Auth, deleteSubcategoryById)
router.patch("/update/status", Auth, changeSubcategoryStatus);

export default router