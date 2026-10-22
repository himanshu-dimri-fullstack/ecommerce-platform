import express from "express"
import { Auth } from "../middlewares/Auth.js";
import {
    createUser,
    getAllUsers, changeUserStatus, deleteUser, getUserById, updateUser
} from "../controllers/adminController.js"

import {
    signup, verifyEmail, verifyOTP, login, logout, resetPassword,
} from "../controllers/userController.js"


const router = express.Router()

router.post("/add", Auth, createUser)
router.put("/update/:id", Auth, updateUser)
router.get("/get", Auth, getAllUsers)
router.get("/get/:id", Auth, getUserById)
router.patch("/update/status", Auth, changeUserStatus)
router.delete("/delete/:id", Auth, deleteUser)

router.post("/signup", signup)
router.post("/verify-email", verifyEmail)
router.post("/verify-otp", verifyOTP)
router.post("/login", login)
router.post("/logout", logout)
router.post("/reset-password", resetPassword)

export default router
