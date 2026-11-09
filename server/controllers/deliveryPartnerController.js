
import mongoose from "mongoose";
import DeliveryPartner from "../models/DeliveryPartner.js";
import User from "../models/User.js";
import Role from "../models/Role.js";

// ========================================
// ADD DELIVERY PARTNER
// ========================================

export const addDeliveryPartner = async (req, res) => {
    try {
        const {
            user,
            vehicleType,
            vehicleNumber,
            drivingLicenseNumber,
        } = req.body;

        if (!user || !vehicleType || !vehicleNumber || !drivingLicenseNumber) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(user)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const existingUser = await User.findById(user);

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const existingPartner = await DeliveryPartner.findOne({ user });

        if (existingPartner) {
            return res.status(409).json({
                success: false,
                message: "This user is already registered as a delivery partner",
            });
        }

        const existingVehicle = await DeliveryPartner.findOne({
            vehicleNumber: vehicleNumber.trim().toUpperCase(),
        });

        if (existingVehicle) {
            return res.status(409).json({
                success: false,
                message: "Vehicle number is already registered",
            });
        }

        const existingLicense = await DeliveryPartner.findOne({
            drivingLicenseNumber: drivingLicenseNumber.trim().toUpperCase(),
        });

        if (existingLicense) {
            return res.status(409).json({
                success: false,
                message: "Driving license number is already registered",
            });
        }

        const deliveryPartner = await DeliveryPartner.create({
            user,
            vehicleType,
            vehicleNumber,
            drivingLicenseNumber,
        });

        const populatedPartner = await DeliveryPartner.findById(
            deliveryPartner._id
        ).populate("user", "firstName lastName email phone");

        return res.status(201).json({
            success: true,
            message: "Delivery partner added successfully",
            deliveryPartner: populatedPartner,
        });

    } catch (error) {
        console.error("Add Delivery Partner Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to add delivery partner",
        });
    }
};


// ========================================
// GET ALL DELIVERY PARTNERS
// ========================================

export const getAllDeliveryPartners = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
        const search = req.query.search?.trim() || "";
        const status = req.query.status || "";

        const skip = (page - 1) * limit;

        const query = {};

        // STATUS FILTER
        if (status && ["active", "inactive", "blocked"].includes(status)) {
            query.status = status;
        }

        // SEARCH
        if (search) {
            const regex = new RegExp(
                search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "i"
            );

            const matchingUsers = await User.find({
                $or: [
                    { firstName: regex },
                    { lastName: regex },
                    { email: regex },
                    { phone: regex },
                ],
            }).select("_id");

            const userIds = matchingUsers.map((item) => item._id);

            query.$or = [
                { vehicleType: regex },
                { vehicleNumber: regex },
                { drivingLicenseNumber: regex },
                { user: { $in: userIds } },
            ];
        }

        const [
            deliveryPartners,
            totalPartners,
            activePartners,
            inactivePartners,
            blockedPartners,
            onlinePartners,
            availablePartners,
        ] = await Promise.all([
            DeliveryPartner.find(query)
                .populate("user", "firstName lastName email phone")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            DeliveryPartner.countDocuments(),

            DeliveryPartner.countDocuments({ status: "active" }),

            DeliveryPartner.countDocuments({ status: "inactive" }),

            DeliveryPartner.countDocuments({ status: "blocked" }),

            DeliveryPartner.countDocuments({
                status: "active",
                isOnline: true,
            }),

            DeliveryPartner.countDocuments({
                status: "active",
                isOnline: true,
                isAvailable: true,
            }),
        ]);

        const filteredTotal = await DeliveryPartner.countDocuments(query);

        return res.status(200).json({
            success: true,
            message: "Delivery partners fetched successfully",

            deliveryPartners,

            totalPartners,
            activePartners,
            inactivePartners,
            blockedPartners,
            onlinePartners,
            availablePartners,

            filteredTotal,
            currentPage: page,
            totalPages: Math.ceil(filteredTotal / limit),
            limit,
        });

    } catch (error) {
        console.error("Get Delivery Partners Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch delivery partners",
        });
    }
};


// ========================================
// GET SINGLE DELIVERY PARTNER
// ========================================

export const getSingleDeliveryPartner = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid delivery partner ID",
            });
        }

        const deliveryPartner = await DeliveryPartner.findById(id)
            .populate("user", "firstName lastName email phone");

        if (!deliveryPartner) {
            return res.status(404).json({
                success: false,
                message: "Delivery partner not found",
            });
        }

        return res.status(200).json({
            success: true,
            deliveryPartner,
        });

    } catch (error) {
        console.error("Get Single Delivery Partner Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch delivery partner",
        });
    }
};


// ========================================
// UPDATE DELIVERY PARTNER
// ========================================

export const updateDeliveryPartner = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid delivery partner ID",
            });
        }

        const {
            vehicleType,
            vehicleNumber,
            drivingLicenseNumber,
        } = req.body;

        const deliveryPartner = await DeliveryPartner.findById(id);

        if (!deliveryPartner) {
            return res.status(404).json({
                success: false,
                message: "Delivery partner not found",
            });
        }

        if (vehicleType !== undefined) {
            deliveryPartner.vehicleType = vehicleType;
        }

        if (vehicleNumber !== undefined) {
            deliveryPartner.vehicleNumber = vehicleNumber.trim().toUpperCase();
        }

        if (drivingLicenseNumber !== undefined) {
            deliveryPartner.drivingLicenseNumber =
                drivingLicenseNumber.trim().toUpperCase();
        }

        const duplicate = await DeliveryPartner.findOne({
            _id: { $ne: id },
            $or: [
                { vehicleNumber: deliveryPartner.vehicleNumber },
                {
                    drivingLicenseNumber:
                        deliveryPartner.drivingLicenseNumber,
                },
            ],
        });

        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: "Vehicle number or driving license already exists",
            });
        }

        await deliveryPartner.save();

        const updatedPartner = await DeliveryPartner.findById(id)
            .populate("user", "firstName lastName email phone");

        return res.status(200).json({
            success: true,
            message: "Delivery partner updated successfully",
            deliveryPartner: updatedPartner,
        });

    } catch (error) {
        console.error("Update Delivery Partner Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update delivery partner",
        });
    }
};


// ========================================
// UPDATE DELIVERY PARTNER STATUS
// ========================================

export const updateDeliveryPartnerStatus = async (req, res) => {
    try {
        const { id, status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid delivery partner ID",
            });
        }

        if (!["active", "inactive", "blocked"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid delivery partner status",
            });
        }

        const deliveryPartner = await DeliveryPartner.findById(id);

        if (!deliveryPartner) {
            return res.status(404).json({
                success: false,
                message: "Delivery partner not found",
            });
        }

        deliveryPartner.status = status;

        // Inactive or blocked partners cannot receive deliveries.
        if (status !== "active") {
            deliveryPartner.isOnline = false;
            deliveryPartner.isAvailable = false;
        }

        await deliveryPartner.save();

        return res.status(200).json({
            success: true,
            message: `Delivery partner ${status} successfully`,
            deliveryPartner,
        });

    } catch (error) {
        console.error("Update Delivery Partner Status Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update delivery partner status",
        });
    }
};


// ========================================
// UPDATE ONLINE / AVAILABILITY STATUS
// ========================================

export const updateDeliveryPartnerAvailability = async (req, res) => {
    try {
        const { id, isOnline, isAvailable } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid delivery partner ID",
            });
        }

        if (
            typeof isOnline !== "boolean" ||
            typeof isAvailable !== "boolean"
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid online and availability values are required",
            });
        }

        if (isAvailable && !isOnline) {
            return res.status(400).json({
                success: false,
                message: "Partner must be online to become available",
            });
        }

        const deliveryPartner = await DeliveryPartner.findById(id);

        if (!deliveryPartner) {
            return res.status(404).json({
                success: false,
                message: "Delivery partner not found",
            });
        }

        if (deliveryPartner.status !== "active" && (isOnline || isAvailable)) {
            return res.status(400).json({
                success: false,
                message: "Inactive or blocked partners cannot go online",
            });
        }

        deliveryPartner.isOnline = isOnline;
        deliveryPartner.isAvailable = isOnline ? isAvailable : false;

        await deliveryPartner.save();

        return res.status(200).json({
            success: true,
            message: "Partner availability updated successfully",
            deliveryPartner,
        });

    } catch (error) {
        console.error("Update Availability Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update availability",
        });
    }
};


// ========================================
// UPDATE CURRENT LOCATION
// ========================================

export const updateDeliveryPartnerLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { coordinates } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid delivery partner ID",
            });
        }

        if (
            !Array.isArray(coordinates) ||
            coordinates.length !== 2 ||
            !coordinates.every(
                (value) =>
                    typeof value === "number" && Number.isFinite(value)
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Coordinates must be [longitude, latitude]",
            });
        }

        const [longitude, latitude] = coordinates;

        if (
            longitude < -180 ||
            longitude > 180 ||
            latitude < -90 ||
            latitude > 90
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid geographical coordinates",
            });
        }

        const deliveryPartner = await DeliveryPartner.findById(id);

        if (!deliveryPartner) {
            return res.status(404).json({
                success: false,
                message: "Delivery partner not found",
            });
        }

        deliveryPartner.currentLocation = {
            type: "Point",
            coordinates,
        };

        await deliveryPartner.save();

        return res.status(200).json({
            success: true,
            message: "Location updated successfully",
            currentLocation: deliveryPartner.currentLocation,
        });

    } catch (error) {
        console.error("Update Location Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update location",
        });
    }
};


// ========================================
// DELETE DELIVERY PARTNER
// ========================================

export const deleteDeliveryPartner = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid delivery partner ID",
            });
        }

        const deliveryPartner = await DeliveryPartner.findById(id);

        if (!deliveryPartner) {
            return res.status(404).json({
                success: false,
                message: "Delivery partner not found",
            });
        }

        await DeliveryPartner.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Delivery partner deleted successfully",
        });

    } catch (error) {
        console.error("Delete Delivery Partner Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete delivery partner",
        });
    }
};

// GET USERS WHO CAN BE REGISTERED AS DELIVERY PARTNERS
export const getAvailableDeliveryPartnerUsers = async (req, res) => {
    try {
        // Find delivery_partner role
        const deliveryPartnerRole = await Role.findOne({
            name: "delivery_partner",
        }).select("_id");

        if (!deliveryPartnerRole) {
            return res.status(404).json({
                success: false,
                message: "Delivery partner role not found.",
            });
        }

        // Find users who are already registered as delivery partners
        const registeredUsers = await DeliveryPartner.distinct("user");

        // Fetch remaining eligible users
        const users = await User.find({
            role: deliveryPartnerRole._id,
            status: "active",
            _id: { $nin: registeredUsers },
        })
            .select("firstName lastName email phone profileImage")
            .sort({ firstName: 1 });

        return res.status(200).json({
            success: true,
            count: users.length,
            users,
        });

    } catch (error) {
        console.error("Get Available Delivery Partner Users:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch available delivery partner users.",
        });
    }
};


// GET LOGGED-IN DELIVERY PARTNER STATUS
export const getMyDeliveryPartnerStatus = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please login again."
            });
        }

        const partner = await DeliveryPartner.findOne({
            user: userId
        }).select("isOnline isAvailable status currentLocation");

        if (!partner) {
            return res.status(404).json({
                success: false,
                message: "Delivery partner profile not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                isOnline: partner.isOnline,
                isAvailable: partner.isAvailable,
                status: partner.status,
                currentLocation: partner.currentLocation
            }
        });

    } catch (error) {
        console.error("Get delivery partner status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch delivery partner status."
        });
    }
};


// UPDATE LOGGED-IN DELIVERY PARTNER ONLINE/OFFLINE STATUS
export const updateMyOnlineStatus = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please login again."
            });
        }

        const { isOnline } = req.body;

        // isOnline MUST BE BOOLEAN
        if (typeof isOnline !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isOnline must be a boolean value."
            });
        }

        const partner = await DeliveryPartner.findOne({
            user: userId
        });

        if (!partner) {
            return res.status(404).json({
                success: false,
                message: "Delivery partner profile not found."
            });
        }

        // OFFLINE
        // GPS IS NOT REQUIRED
        if (isOnline === false) {
            partner.isOnline = false;
            partner.isAvailable = false;

            await partner.save();

            return res.status(200).json({
                success: true,
                message: "You are now Offline.",
                data: {
                    isOnline: partner.isOnline,
                    isAvailable: partner.isAvailable,
                    status: partner.status
                }
            });
        }

        // ONLINE
        // BLOCKED / INACTIVE PARTNERS CANNOT GO ONLINE
        if (partner.status !== "active") {
            return res.status(403).json({
                success: false,
                message: `Your account is ${partner.status}. You cannot go Online.`
            });
        }

        const { latitude, longitude } = req.body;

        // BOTH COORDINATES ARE REQUIRED
        if (
            latitude === undefined ||
            latitude === null ||
            longitude === undefined ||
            longitude === null
        ) {
            return res.status(400).json({
                success: false,
                message: "Latitude and longitude are required to go Online."
            });
        }

        // COORDINATES MUST BE NUMBERS
        if (
            typeof latitude !== "number" ||
            typeof longitude !== "number" ||
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            return res.status(400).json({
                success: false,
                message: "Latitude and longitude must be valid numbers."
            });
        }

        // VALIDATE LATITUDE AND LONGITUDE RANGES
        if (
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid latitude or longitude values."
            });
        }

        // UPDATE ONLINE STATUS AND LOCATION
        partner.isOnline = true;
        partner.isAvailable = true;

        partner.currentLocation = {
            type: "Point",
            coordinates: [longitude, latitude]
        };

        await partner.save();

        return res.status(200).json({
            success: true,
            message: "You are now Online.",
            data: {
                isOnline: partner.isOnline,
                isAvailable: partner.isAvailable,
                status: partner.status,
                currentLocation: partner.currentLocation
            }
        });

    } catch (error) {
        console.error("Update delivery partner online status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update online status."
        });
    }
};
