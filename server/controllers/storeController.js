import Role from "../models/Role.js";
import User from "../models/User.js";
import Store from "../models/Store.js"
import { handleResponseError } from "../utils/errorUtils.js"

export const getAllManagers = async (_, res) => {
    try {
        const role = await Role.findOne({ name: "manager" })
        const managers = await User.find({ role: role._id })
        return res.status(200).json({ managers })
    }
    catch (error) {
        return handleResponseError(error, res);
    }
}

export const getAllStores = async (_, res) => {
    try {
        const stores = await Store.find().populate("manager", "firstName lastName").sort({ createdAt: -1 })
        return res.status(200).json({ stores })
    }
    catch (error) {
        return handleResponseError(error, res);
    }
}

// ADD STORE
export const createStore = async (req, res) => {
    try {
        const {
            name,
            code,
            manager,
            phone,
            address,
            location,
            serviceRadius,
        } = req.body;

        const existingStore = await Store.findOne({
            $or: [
                { name },
                { code }
            ]
        });

        if (existingStore) {
            return res.status(400).json({
                message: "Store name or code already exists"
            });
        }

        const store = await Store.create({
            name,
            code,
            manager,
            phone,
            address,
            location: location ? location : null,
            serviceRadius,
        });

        return res.status(201).json({
            message: "Store created successfully",
            store
        });

    } catch (error) {
        return handleResponseError(error, res);
    }
};

// UPDATE STORE
export const updateStore = async (req, res) => {
    const { id } = req.params
    const store = await Store.findOne({ _id: id })
    if (!store) {
        return res.status(404).json({ message: "Store not found" })
    }
    try {
        const {
            name,
            code,
            manager,
            phone,
            address,
            location,
            serviceRadius,
        } = req.body;

        const existingStore = await Store.findOne({
            _id: { $ne: id },
            $or: [
                { name },
                { code }
            ]
        });

        if (existingStore) {
            return res.status(400).json({
                message: "Store name or code already exists"
            });
        }

        const store = await Store.updateOne({ _id: id }, {
            name,
            code,
            manager,
            phone,
            address,
            location: location ? location : null,
            serviceRadius,
        });

        return res.status(200).json({
            message: "Store updated successfully",
            store
        });

    } catch (error) {
        return handleResponseError(error, res);
    }
};

export const getStoreById = async (req, res) => {
    try {
        const { id } = req.params
        const store = await Store.findOne({ _id: id }).populate("manager", "firstName lastName")
        if (!store) {
            return res.status(404).json({ message: "Store not found" })
        }
        return res.status(200).json({ store })
    }
    catch (error) {
        return handleResponseError(error, res);
    }
}

export const deleteStore = async (req, res) => {
    try {
        const { id } = req.params
        const store = await Store.deleteOne({ _id: id })
        if (!store) {
            return res.status(404).json({ message: "Store not found" })
        }
        return res.status(200).json({ message: "Store deleted successfully" })
    }
    catch (error) {
        return handleResponseError(error, res);
    }
}

export const updateStoreStatus = async (req, res) => {
    try {
        const { id } = req.body;

        const store = await Store.findById(id);

        if (!store) {
            return res.status(404).json({
                message: "Store not found",
            });
        }

        store.status =
            store.status === "active" ? "inactive" : "active";

        await store.save();

        return res.status(200).json({
            message: `Status changed successfully`,
            store,
        });
    } catch (error) {
        return handleResponseError(error, res)
    }
};

// GET NEAREST STORE
export const getNearestStore = async (req, res) => {
    try {
        const { latitude, longitude } = req.query;

        // VALIDATE COORDINATES
        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                success: false,
                message: "Latitude and longitude are required"
            });
        }

        const lat = Number(latitude);
        const lng = Number(longitude);

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            lat < -90 ||
            lat > 90 ||
            lng < -180 ||
            lng > 180
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid latitude or longitude"
            });
        }

        // FIND NEAREST ACTIVE STORE
        const stores = await Store.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    distanceField: "distance",
                    spherical: true,
                    key: "location",
                    query: {
                        status: "active"
                    }
                }
            },
            {
                // CHECK STORE SERVICE RADIUS
                $match: {
                    $expr: {
                        $lte: [
                            "$distance",
                            { $multiply: ["$serviceRadius", 1000] }
                        ]
                    }
                }
            },
            {
                $limit: 1
            }
        ]);

        if (!stores.length) {
            return res.status(404).json({
                success: false,
                message: "No store available in your service area"
            });
        }

        const nearestStore = stores[0];

        return res.status(200).json({
            success: true,
            message: "Nearest store found successfully",
            store: {
                ...nearestStore,
                distanceInKm: Number(
                    (nearestStore.distance / 1000).toFixed(2)
                )
            }
        });

    } catch (error) {
        return handleResponseError(error, res);
    }
};