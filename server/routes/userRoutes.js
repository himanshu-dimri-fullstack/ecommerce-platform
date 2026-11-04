import express from "express";
import {
    signup, verifyEmail, verifyOTP, login, logout, resetPassword, updateProfile, changePassword
} from "../controllers/userController.js"
import jwt from "jsonwebtoken"
import User from "../models/User.js";
import { Auth } from "../middlewares/Auth.js";


const router = express.Router()

router.post("/signup", signup)
router.post("/verify-email", verifyEmail)
router.post("/verify-otp", verifyOTP)
router.post("/login", login)
router.post("/logout", logout)
router.post("/reset-password", resetPassword)
router.post("/change-password", Auth, changePassword)

router.post("/update-profile", Auth, updateProfile)

router.get("/check-user", async (req, res) => {
    try {
        const token = req.cookies?.clientToken;

        if (!token) {
            return res.status(200).json({
                user: null,
                message: "No Token"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id)
            .select("firstName lastName email role phone profileImage")
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
                phone: user.phone,
                profileImage: {
                    url: user.profileImage.url,
                    public_id: user.profileImage.public_id
                }
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