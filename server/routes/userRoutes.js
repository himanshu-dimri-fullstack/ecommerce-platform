import express from "express";
import {
    signup, verifyEmail, verifyOTP, login, logout, resetPassword, createUser,
    getAllUsers, changeUserStatus, deleteUser, getUserDetail, updateUser
} from "../controllers/userController.js"
import jwt from "jsonwebtoken"
import { Auth } from "../middlewares/Auth.js";


const router = express.Router()

router.post("/admin/signup", signup)
router.post("/admin/verify-email", verifyEmail)
router.post("/admin/verify-otp", verifyOTP)
router.post("/admin/login", login)
router.post("/admin/logout", logout)
router.post("/admin/reset-password", resetPassword)

router.get("/admin/check-user", async (req, res) => {
    try {
        const token = req?.cookies?.token
        if (!token) {
            return res.status(200).json({ message: "No Token" })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" })
        }
        res.status(200).json({ user: decoded })
    }
    catch (error) {
        console.log(error)
    }
})

{/* ================= USER CRUD ================= */ }

router.post("/admin/user", Auth, createUser)
router.put("/admin/user/:id", Auth, updateUser)
router.get("/admin/user", Auth, getAllUsers)
router.get("/admin/user/:id", Auth, getUserDetail)
router.patch("/admin/user/status", Auth, changeUserStatus)
router.delete("/admin/user/:id", Auth, deleteUser)

export default router