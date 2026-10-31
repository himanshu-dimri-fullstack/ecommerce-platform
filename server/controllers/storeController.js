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