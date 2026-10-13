import express from "express";
import {
    signup, verifyEmail, verifyOTP, login, logout, resetPassword,
} from "../controllers/userController.js"
import jwt from "jsonwebtoken"


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
            return res.status(200).json({ user: null, message: "No Token" })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" })
        }
        res.status(200).json({ user: decoded })
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
})


export default router