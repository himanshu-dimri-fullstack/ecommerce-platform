
import mongoose from "mongoose";
import Address from "../models/Address.js";
import { handleResponseError } from "../utils/errorUtils.js"

// ADD ADDRESS
export const addAddress = async (req, res) => {
    try {
        const {
            type,
            houseNumber,
            street,
            landmark,
            city,
            state,
            country,
            pincode,
            location,
            longitude,
            latitude,
            isDefault,
        } = req.body;

        // Required field validation
        const requiredFields = {
            type,
            houseNumber,
            street,
            city,
            state,
            country,
            pincode,
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([key, value]) => !value || !String(value).trim())
            .map(([key]) => key);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
                missingFields,
            });
        }

        const userId = req.user.id;

        // Check existing addresses
        const existingAddress = await Address.findOne({ user: userId });

        // Prepare location
        const coordinates = location?.coordinates || [
            Number(longitude) || 0,
            Number(latitude) || 0,
        ];

        // If new address is default, remove default from previous addresses
        if (isDefault || !existingAddress) {
            await Address.updateMany(
                { user: userId },
                { $set: { isDefault: false } }
            );
        }

        const address = await Address.create({
            user: userId,
            type,
            houseNumber,
            street,
            landmark,
            city,
            state,
            country,
            pincode,
            location: {
                type: "Point",
                coordinates,
            },
            isDefault: isDefault || !existingAddress,
        });

        return res.status(201).json({
            success: true,
            message: "Address added successfully",
            address,
        });

    } catch (error) {
        return handleResponseError(error, res);
    }
};

// GET USER ADDRESSES
export const getAddresses = async (req, res) => {
    try {
        const userId = req.user.id;

        const addresses = await Address.find({
            user: userId,
        }).sort({
            isDefault: -1,
            createdAt: -1,
        });

        return res.status(200).json({
            success: true,
            message: "Addresses fetched successfully",
            addresses,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// UPDATE ADDRESS
export const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID",
            });
        }

        const address = await Address.findOne({
            _id: id,
            user: userId,
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found",
            });
        }

        const allowedFields = [
            "type",
            "name",
            "phone",
            "houseNumber",
            "street",
            "landmark",
            "city",
            "state",
            "country",
            "pincode",
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                address[field] = req.body[field];
            }
        });

        // Update location if provided
        if (req.body.location) {
            address.location = req.body.location;
        } else if (
            req.body.longitude !== undefined ||
            req.body.latitude !== undefined
        ) {
            const coordinates = [...address.location.coordinates];

            if (req.body.longitude !== undefined) {
                coordinates[0] = Number(req.body.longitude);
            }

            if (req.body.latitude !== undefined) {
                coordinates[1] = Number(req.body.latitude);
            }

            address.location = {
                type: "Point",
                coordinates,
            };
        }

        // Make this address default
        if (req.body.isDefault === true) {
            await Address.updateMany(
                { user: userId, _id: { $ne: id } },
                { $set: { isDefault: false } }
            );

            address.isDefault = true;
        }

        // Remove default status
        if (req.body.isDefault === false) {
            address.isDefault = false;
        }

        await address.save();

        return res.status(200).json({
            success: true,
            message: "Address updated successfully",
            address,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const updateDefaultAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check whether address belongs to the logged-in user
        const address = await Address.findOne({
            _id: id,
            user: userId,
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found",
            });
        }

        // Make all user's addresses non-default
        await Address.updateMany(
            { user: userId },
            { $set: { isDefault: false } }
        );

        // Make selected address default
        const updatedAddress = await Address.findByIdAndUpdate(
            id,
            { $set: { isDefault: true } },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Default address updated successfully",
            address: updatedAddress,
        });

    } catch (error) {
        // console.error("Update Default Address Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};


// DELETE ADDRESS
export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID",
            });
        }

        const address = await Address.findOne({
            _id: id,
            user: userId,
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found",
            });
        }

        const wasDefault = address.isDefault;

        await Address.deleteOne({
            _id: id,
            user: userId,
        });

        // If deleted address was default, assign another default
        if (wasDefault) {
            const nextAddress = await Address.findOne({
                user: userId,
            }).sort({
                createdAt: -1,
            });

            if (nextAddress) {
                nextAddress.isDefault = true;
                await nextAddress.save();
            }
        }

        return res.status(200).json({
            success: true,
            message: "Address deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
