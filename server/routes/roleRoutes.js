import express from "express";

import {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
    updateRoleStatus,
    getRoleById
} from "../controllers/roleController.js";
import { Auth } from "../middlewares/Auth.js";

const router = express.Router();

router.get("/get", Auth, getRoles);

router.post("/add", Auth, createRole);

router.put("/update/:id", Auth, updateRole);

router.get("/get/:id", Auth, getRoleById);

router.delete("/delete/:id", Auth, deleteRole);

router.patch("/update/:id", Auth, updateRoleStatus);

export default router;