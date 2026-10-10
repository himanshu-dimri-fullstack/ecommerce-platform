import Role from "../models/Role.js";

// ===============================
// GET ALL ROLES
// ===============================
export const getRoles = async (req, res) => {
    try {
        const roles = await Role.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            roles,
        });
    } catch (error) {
        console.log("Get Roles Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch roles",
        });
    }
};


// ===============================
// CREATE ROLE
// ===============================
export const createRole = async (req, res) => {
    try {
        const { name, permissions } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Name is required" })
        }
        if (!permissions) {
            return res.status(400).json({ message: "Name is required" })
        }

        const role = await Role.create({
            name,
            permissions
        });

        res.status(201).json({
            message: "Role created successfully",
            role
        });
    } catch (error) {
        console.log("Create Role Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create role",
        });
    }
};


// ===============================
// UPDATE ROLE
// ===============================
export const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id)
        const { name, permissions } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Role name is required",
            });
        }

        const existingRole = await Role.findOne({
            name: name.trim(),
            _id: { $ne: id },
        });

        if (existingRole) {
            return res.status(400).json({
                success: false,
                message: "Role already exists",
            });
        }

        const role = await Role.findByIdAndUpdate(
            id,
            {
                name: name.trim(),
                permissions: Array.isArray(permissions)
                    ? permissions
                    : [],
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Role updated successfully",
            role,
        });
    } catch (error) {
        console.log("Update Role Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update role",
        });
    }
};


// ===============================
// DELETE ROLE
// ===============================
export const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;

        const role = await Role.findByIdAndDelete(id);

        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }
        res.status(200).json({ message: "Role deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete role" });
    }
};


// ===============================
// UPDATE ROLE STATUS
// ===============================
export const updateRoleStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const role = await Role.findOne({ _id: id });

        if (!role) {
            return res.status(404).json({
                message: "Role not found",
            });
        }

        if (role.status == "active") {
            await Role.updateOne({ _id: id }, { status: "inactive" })
        }
        else {
            await Role.updateOne({ _id: id }, { status: "active" })
        }
        res.status(200).json({ message: "Status changed successfully" })
    } catch (error) {
        res.status(500).json({ message: "Failed to update role status" })
    }
};

export const getRoleById = async (req, res) => {
    try {
        const { id } = req.params
        const role = await Role.findOne({ _id: id })
        if (!role) {
            return res.status(400).json({ message: "Role not found" })
        }
        return res.status(200).json({ role })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
}