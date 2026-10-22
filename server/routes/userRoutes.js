import express from "express";
import {
    signup, verifyEmail, verifyOTP, login, logout, resetPassword,
} from "../controllers/userController.js"
import jwt from "jsonwebtoken"
import User from "../models/User.js";


const router = express.Router()

router.post("/signup", signup)
router.post("/verify-email", verifyEmail)
router.post("/verify-otp", verifyOTP)
router.post("/login", login)
router.post("/logout", logout)
router.post("/reset-password", resetPassword)

router.get("/admin/check-user", async (req, res) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(200).json({
                user: null,
                message: "No Token"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id)
            .select("firstName lastName email role")
            .populate("role", "name permissions");

        if (!user) {
            return res.status(401).json({
                user: null,
                message: "User not found"
            });
        }

        return res.status(200).json({
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
                    ? {
                        id: user.role._id,
                        name: user.role.name,
                        permissions: user.role.permissions
                    }
                    : null
            }
        });
    } catch (error) {
        return res.status(401).json({
            user: null,
            message: "Invalid or expired token"
        });
    }
});


export default router