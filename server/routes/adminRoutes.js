import express from "express"
import { Auth } from "../middlewares/Auth.js";
import { Permission } from "../middlewares/Permission.js";
import {
    createUser,
    getAllUsers, changeUserStatus, deleteUser, getUserById, updateUser
} from "../controllers/adminController.js"

import {
    signup, verifyEmail, verifyOTP, login, logout, resetPassword,
} from "../controllers/userController.js"
import User from "../models/User.js";
import jwt from "jsonwebtoken"

const router = express.Router()

router.post("/add", Auth, Permission("user:add"), createUser)
router.put("/update/:id", Auth, Permission("user:update"), updateUser)
router.get("/get", Auth, getAllUsers)
router.get("/get/:id", Auth, Permission("user:read"), getUserById)
router.patch("/update/status", Auth, changeUserStatus)
router.delete("/delete/:id", Auth, Permission("user:delete"), deleteUser)

router.post("/signup", signup)
router.post("/verify-email", verifyEmail)
router.post("/verify-otp", verifyOTP)
router.post("/login", login)
router.post("/logout", logout)
router.post("/reset-password", resetPassword)


router.get("/check-user", async (req, res) => {
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
        console.log(error.message)
        return res.status(401).json({
            user: null,
            message: "Invalid or expired token"
        });
    }
});

export default router
