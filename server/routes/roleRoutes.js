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

router.get("/admin/role", Auth, getRoles);

router.post("/admin/role", Auth, createRole);

router.put("/admin/role/:id", Auth, updateRole);

router.get("/admin/role/:id", Auth, getRoleById);

router.delete("/admin/role/:id", Auth, deleteRole);

router.patch("/admin/role/status/:id", Auth, updateRoleStatus);

export default router;