import User from "../models/User.js";
import Role from "../models/Role.js"
import bcrypt from "bcrypt"
import { sendPasswordOnMail } from "../utils/sendPasswordOnMail.js";
import { handleResponseError } from "../utils/errorUtils.js"

export const createUser = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, role } = req.body
        if (!firstName) {
            return res.status(400).json({ message: "First Name is required" })
        }
        if (!lastName) {
            return res.status(400).json({ message: "Last Name is required" })
        }
        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }
        if (!phone) {
            return res.status(400).json({ message: "Phone number is required" })
        }
        if (!role) {
            return res.status(400).json({ message: "Role is required" })
        }

        const verifyUser = await User.findOne({ email })
        if (verifyUser) {
            return res.status(400).json({ message: "Email already exist" })
        }
        const verifyPhone = await User.findOne({ phone })
        if (verifyPhone) {
            return res.status(400).json({ message: "Phone number already exist" })
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
        await User.create({ firstName, lastName, email, password: hashedPassword, phone, role })
        return res.status(201).json({ message: "User created Successfully" })
    }
    catch (error) {
        return handleResponseError(error, res)
    }
}

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params
        const user = await User.findOne({ _id: id })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const { firstName, lastName, email, phone, role } = req.body
        if (!firstName) {
            return res.status(400).json({ message: "First Name is required" })
        }
        if (!lastName) {
            return res.status(400).json({ message: "Last Name is required" })
        }
        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }
        if (!phone) {
            return res.status(400).json({ message: "Phone number is required" })
        }
        if (!role) {
            return res.status(400).json({ message: "Role is required" })
        }
        console.log(req.body);
        // return
        await User.updateOne({ _id: id }, { firstName, lastName, email, phone, role })
        return res.status(200).json({ message: "User updated Successfully" })
    }
    catch (error) {
        return handleResponseError(error, res)
    }
}

export const getAllUsers = async (_, res) => {
    try {
        const superAdmin = await Role.findOne({ name: "Super_Admin" })

        const users = await User.find({ role: { $ne: superAdmin._id } }).sort({ createdAt: -1 })
            .populate("role", "name")
        return res.status(200).json({ users })
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to fetch users" })
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
            await User.updateOne({ email }, { status: "inactive" })
        }
        else {
            await User.updateOne({ email }, { status: "active" })
        }
        return res.status(200).json({ message: "Status changed successfully" })
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to change status" })
    }
}

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) {
            return res.status(400).json({ message: "User id is required" })
        }
        await User.deleteOne({ _id: id })
        res.status(200).json({ message: "User deleted successfully" })
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to delete user" })
    }
}

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params
        console.log("user id", id)
        if (!id) {
            return res.status(400).json({ message: "User ID is required" })
        }
        const user = await User.findOne({ _id: id }).populate("role", "name")
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        return res.status(200).json({ user })
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to fetch user detail" })
    }
}