import User from "../models/User.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { sendMail } from "../utils/sendMail.js";
import { sendPasswordOnMail } from "../utils/sendPasswordOnMail.js";
import moment from "moment"
import { handleResponseError } from "../utils/errorUtils.js"
import Role from "../models/Role.js";
import { uploadFile, destroyFile } from "../config/cloudinary.js"

export const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body
        if (!firstName) {
            return res.status(400).json({ message: "First Name is required" })
        }
        // if (!lastName) {
        //     return res.status(400).json({ message: "Last Name is required" })
        // }
        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }
        if (!password) {
            return res.status(400).json({ message: "Password is required" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)

        const savedUser = await User.create({
            firstName, lastName, email, password: hashedPassword,
            role: "6adcca18c6ae8cdfc38138de"
        })
        return res.status(201).json({
            message: "Account has been created",
            user: {
                id: savedUser._id,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                email: savedUser.email
            }
        })
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
        const { email, password } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(401).json({ message: "Email is invalid" });
        }

        if (user.status === "inactive") {
            return res.status(401).json({ message: "Not allowed to login" });
        }

        const role = await Role.findOne({ _id: user.role })

        if (role.name !== "customer") {
            return res.status(401).json({ message: "Access denied" })
        }

        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Password is invalid" });
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // res.cookie("token", token, {
        //     httpOnly: true,
        //     secure: false,
        //     sameSite: "Lax",
        //     maxAge: 24 * 60 * 60 * 1000
        // });

        res.cookie("clientToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Login successful",
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
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

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

export const logout = async (req, res) => {
    // res.clearCookie("token", {
    //     httpOnly: true,
    //     secure: false,
    //     sameSite: "Lax",
    //     maxAge: 24 * 60 * 60 * 1000
    // });

    res.clearCookie("clientToken", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        success: true,
        message: "Logout successful",
    });
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const { firstName, lastName, phone } = req.body;

        if (!firstName) {
            return res.status(400).json({ message: "First name is required" })
        }

        if (!phone) {
            return res.status(400).json({ message: "Phone number is required" })
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Update basic profile fields
        user.firstName = firstName?.trim() ?? user.firstName;
        user.lastName = lastName?.trim() ?? user.lastName;
        user.phone = phone?.trim() ?? user.phone;

        // Profile image upload
        if (req.files) {

            // Delete previous image from Cloudinary
            if (user.profileImage?.public_id) {
                await destroyFile(user.profileImage.public_id)
            }

            // Upload new image
            // const result = await cloudinary.uploader.upload(
            //     req.file.path,
            //     {
            //         folder: "ecommerce_platform/users",
            //         resource_type: "image",
            //     }
            // );

            const result = await uploadFile(req.files.profileImage.tempFilePath, "ecommerce_platform/users")

            user.profileImage = {
                url: result.secure_url,
                public_id: result.public_id,
            };
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user,
        });

    } catch (error) {
        console.error("Update Profile Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // VALIDATION
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required",
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters",
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from current password",
            });
        }

        // FIND USER
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // VERIFY CURRENT PASSWORD
        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect",
            });
        }

        // HASH NEW PASSWORD
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // UPDATE PASSWORD
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });

    } catch (error) {
        console.error("Change Password Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
