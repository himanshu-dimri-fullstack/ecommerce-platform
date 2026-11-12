
import mongoose from "mongoose";

import Address from "../models/Address.js";
import { geocodeAddress } from "../utils/geocodeAddress.js";
import { handleResponseError } from "../utils/errorUtils.js";


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
            isDefault,
        } = req.body;

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
                message: "Please fill all required fields.",
                missingFields,
            });
        }

        const userId = req.user.id;

        // GET EXISTING ADDRESSES
        const existingAddress = await Address.findOne({
            user: userId,
        });

        // GEOCODE ADDRESS USING PHOTON
        const coordinates = await geocodeAddress({
            houseNumber,
            street,
            landmark,
            city,
            state,
            country,
            pincode,
        });

        // UPDATE DEFAULT ADDRESS
        if (isDefault || !existingAddress) {
            await Address.updateMany(
                { user: userId },
                {
                    $set: {
                        isDefault: false,
                    },
                }
            );
        }

        // CREATE ADDRESS
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

            location: coordinates,

            isDefault: Boolean(isDefault || !existingAddress),
        });

        return res.status(201).json({
            success: true,
            message: "Address added successfully.",
            address,
        });

    } catch (error) {
        console.error("Add Address Error:", error);

        if (
            error.message?.includes("location") ||
            error.message?.includes("address") ||
            error.message?.includes("Address")
        ) {
            return res.status(422).json({
                success: false,
                message: error.message,
            });
        }

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
            message: "Addresses fetched successfully.",
            addresses,
        });

    } catch (error) {
        console.error("Get Addresses Error:", error);

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
                message: "Invalid address ID.",
            });
        }

        const address = await Address.findOne({
            _id: id,
            user: userId,
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found.",
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

        const addressFields = [
            "houseNumber",
            "street",
            "landmark",
            "city",
            "state",
            "country",
            "pincode",
        ];

        // CHECK WHETHER ADDRESS DETAILS CHANGED
        const locationChanged = addressFields.some(
            (field) =>
                req.body[field] !== undefined &&
                String(req.body[field] ?? "").trim() !==
                String(address[field] ?? "").trim()
        );

        // UPDATE NORMAL ADDRESS FIELDS
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                address[field] = req.body[field];
            }
        });

        // RE-GEOCODE ONLY WHEN ADDRESS CHANGES
        if (locationChanged) {
            const requiredFields = [
                "houseNumber",
                "street",
                "city",
                "state",
                "country",
                "pincode",
            ];

            const missingFields = requiredFields.filter(
                (field) =>
                    !address[field] ||
                    !String(address[field]).trim()
            );

            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Please fill all required address fields.",
                    missingFields,
                });
            }

            const coordinates = await geocodeAddress({
                houseNumber: address.houseNumber,
                street: address.street,
                landmark: address.landmark,
                city: address.city,
                state: address.state,
                country: address.country,
                pincode: address.pincode,
            });

            address.location = coordinates;
        }

        // MAKE THIS ADDRESS DEFAULT
        if (req.body.isDefault === true) {
            await Address.updateMany(
                {
                    user: userId,
                    _id: { $ne: id },
                },
                {
                    $set: {
                        isDefault: false,
                    },
                }
            );

            address.isDefault = true;
        }

        // REMOVE DEFAULT STATUS
        if (req.body.isDefault === false) {
            address.isDefault = false;
        }

        await address.save();

        return res.status(200).json({
            success: true,
            message: "Address updated successfully.",
            address,
        });

    } catch (error) {
        console.error("Update Address Error:", error);

        if (
            error.message?.includes("location") ||
            error.message?.includes("address") ||
            error.message?.includes("Address")
        ) {
            return res.status(422).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// UPDATE DEFAULT ADDRESS
export const updateDefaultAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID.",
            });
        }

        const address = await Address.findOne({
            _id: id,
            user: userId,
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found.",
            });
        }

        await Address.updateMany(
            { user: userId },
            {
                $set: {
                    isDefault: false,
                },
            }
        );

        const updatedAddress = await Address.findByIdAndUpdate(
            id,
            {
                $set: {
                    isDefault: true,
                },
            },
            {
                new: true,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Default address updated successfully.",
            address: updatedAddress,
        });

    } catch (error) {
        console.error("Update Default Address Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
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
                message: "Invalid address ID.",
            });
        }

        const address = await Address.findOne({
            _id: id,
            user: userId,
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found.",
            });
        }

        const wasDefault = address.isDefault;

        await Address.deleteOne({
            _id: id,
            user: userId,
        });

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
            message: "Address deleted successfully.",
        });

    } catch (error) {
        console.error("Delete Address Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
