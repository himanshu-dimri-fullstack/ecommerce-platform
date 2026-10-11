import express from "express"

import {
    createUser,
    getAllUsers, changeUserStatus, deleteUser, getUserById, updateUser
} from "../controllers/adminController.js"

import { Auth } from "../middlewares/Auth.js";

const router = express.Router()

router.post("/admin/user", Auth, createUser)
router.put("/admin/user/:id", Auth, updateUser)
router.get("/admin/user", Auth, getAllUsers)
router.get("/admin/user/:id", Auth, getUserById)
router.patch("/admin/user/status", Auth, changeUserStatus)
router.delete("/admin/user/:id", Auth, deleteUser)

export default router
