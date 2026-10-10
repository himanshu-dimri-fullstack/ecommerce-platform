import express from "express";

import {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
    updateRoleStatus,
} from "../controllers/roleController.js";

const router = express.Router();

router.get("/admin/role", getRoles);

router.post("/admin/role", createRole);

router.put("/admin/role/:id", updateRole);

router.delete("/admin/role/:id", deleteRole);

router.patch("/admin/roles/status/:id", updateRoleStatus);

export default router;