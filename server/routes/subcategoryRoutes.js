import express from "express"
import {
    createSubcategory, getAllSubcategory, getSubcategoryById,
    deleteSubcategoryById, updateSubcategory, changeSubcategoryStatus
} from "../controllers/subcategoryController.js";
import { Auth } from "../middlewares/Auth.js";
import { Permission } from "../middlewares/Permission.js";

const router = express.Router();

router.get("/get", getAllSubcategory)
router.get("/get/:id", getSubcategoryById);
router.post("/add", Auth, Permission("subcategory:add"), createSubcategory)
router.put("/update/:id", Auth, Permission("subcategory:update"), updateSubcategory)
router.delete("/delete/:id", Auth, Permission("subcategory:delete"), deleteSubcategoryById)
router.patch("/update/status", Auth, changeSubcategoryStatus);

export default router