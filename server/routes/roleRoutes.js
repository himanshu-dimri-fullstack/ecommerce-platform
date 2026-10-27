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
import { Permission } from "../middlewares/Permission.js";

const router = express.Router();

router.get("/get", Auth, getRoles);

router.post("/add", Auth, Permission("role:add"), createRole);

router.put("/update/:id", Auth, Permission("role:update"), updateRole);

router.get("/get/:id", Auth, Permission("role:read"), getRoleById);

router.delete("/delete/:id", Permission("role:delete"), Auth, deleteRole);

router.patch("/update/:id", Auth, updateRoleStatus);

export default router;