import User from "../models/User.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { sendMail } from "../utils/sendMail.js";
import { sendPasswordOnMail } from "../utils/sendPasswordOnMail.js";
import moment from "moment"
import { handleResponseError } from "../utils/errorUtils.js"

export const signup = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }
        if (!password) {
            return res.status(400).json({ message: "Password is required" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            name: "Himanshu Dimri", email, password: hashedPassword,
            status: "active", role: "admin",
        })
        return res.status(201).json({ message: "user created successfully" })
    }
    catch (error) {
        return handleResponseError(error, res)
    }
}

export const verifyEmail = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({ message: "User not exist" })
        }
        const otp = Math.floor(1000 + Math.random() * 9000)

        const otpExpiresAt = moment().add(2, "minutes").toDate()

        await User.updateOne(
            { email },
            {
                otp,
                otpExpiresAt
            }
        )

        await sendMail(email, otp)
        return res.status(200).json({ message: "OTP is sent" })
    }
    catch (error) {
        console.log(error)
    }

}

export const verifyOTP = async (req, res) => {
    try {
        const { otp, email } = req.body
        if (!email) {
            return res.status(400).json({ message: "Email is not available" })
        }
        if (!otp) {
            return res.status(400).json({ message: "OTP is not available" })
        }
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(401).json({ message: "User not exist" })
        }

        if (user.otp !== otp) {
            return res.status(401).json({ message: "Invalid OTP" })
        }

        if (moment().isAfter(user.otpExpiresAt)) {
            return res.status(400).json({
                message: "OTP has expired"
            })
        }
        await User.updateOne({
            email
        }, {
            isOtpVerified: true
        })

        return res.status(200).json({ message: "OTP is verified" })
    }
    catch (error) {
        console.log(error)
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }
        if (!password) {
            return res.status(400).json({ message: "Password is required" })
        }
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({ message: "Email is invalid" })
        }
        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Password is invalid" })
        }
        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' })

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
            maxAge: 24 * 60 * 60 * 1000
        })

        return res.status(200).json({
            message: "Login successfull",
            user: { id: user._id, email: user.email }
        })
    }
    catch (error) {
        console.log(error)
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }
        if (!password) {
            return res.status(400).json({ message: "Password is required" })
        }
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "Email not exist" })
        }
        if (!user.isOtpVerified) {
            return res.status(400).json({ message: "Verify OTP" })
        }
        await User.updateOne({ email }, {
            $unset: {
                otp: "",
                otpExpiresAt: "",
                isOtpVerified: ""
            }
        })
        const hashedPassword = await bcrypt.hash(password, 10)
        const savedUser = await User.updateOne({ email }, { password: hashedPassword })
        return res.status(200).json({ message: "Password changed successfully" })
    }
    catch (error) {
        console.log(error)
    }

}

export const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        success: true,
        message: "Logout successful",
    });
};
