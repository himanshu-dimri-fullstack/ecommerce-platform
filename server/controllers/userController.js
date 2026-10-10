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
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' })

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

{/* ================= USER CRUD ================= */ }


export const createUser = async (req, res) => {
    try {
        const { firstName, lastName, email, phone } = req.body
        if (!firstName) {
            return res.status(400).json({ message: "First Name is required" })
        }
        if (!lastName) {
            return res.status(400).json({ message: "Last Name is required" })
        }
        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }
        const generatePassword = (length = 12) => {
            const chars =
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

            let password = "";

            for (let i = 0; i < length; i++) {
                password += chars.charAt(
                    Math.floor(Math.random() * chars.length)
                );
            }

            return password;
        };
        const password = generatePassword()
        console.log("my password", password)
        const result = await sendPasswordOnMail(email, password)
        if (!result) {
            res.status(400).json({ message: "Password is not sent" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        await User.create({ firstName, lastName, email, password: hashedPassword, phone })
        return res.status(201).json({ message: "User created Successfully" })
    }
    catch (error) {
        console.log(error)
    }
}

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params
        const user = await User.findOne({ _id: id })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const { firstName, lastName, email, phone } = req.body
        if (!firstName) {
            return res.status(400).json({ message: "First Name is required" })
        }
        if (!lastName) {
            return res.status(400).json({ message: "Last Name is required" })
        }
        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }

        await User.updateOne({ _id: id }, { firstName, lastName, email, phone })
        return res.status(201).json({ message: "User updated Successfully" })
    }
    catch (error) {
        return res.json({ message: error.message })
    }
}

export const getAllUsers = async (_, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        return res.status(200).json({ users })
    }
    catch (error) {
        console.log(error)
    }
}

export const changeUserStatus = async (req, res) => {
    try {
        const { email, status } = req.body
        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }
        if (!status) {
            return res.status(400).json({ message: "Status is required" })
        }
        if (status === "active") {
            const user = await User.updateOne({ email }, { status: "inactive" })
        }
        else {
            const user = await User.updateOne({ email }, { status: "active" })
        }
        return res.status(200).json({ message: "Status changed successfully" })

    }
    catch (error) {
        console.log(error)
    }
}

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) {
            return res.status(400).json({ message: "User id is required" })
        }
        const user = await User.deleteOne({ _id: id })
        res.status(200).json({ message: "User deleted successfully" })
    }
    catch (error) {
        console.log(error)
    }
}

export const getUserDetail = async (req, res) => {
    try {
        const { id } = req.params
        console.log("user id", id)
        if (!id) {
            return res.status(400).json({ message: "User ID is required" })
        }
        const user = await User.findOne({ _id: id })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        return res.status(200).json({ user })
    }
    catch (error) {
        console.log(error)
    }
}