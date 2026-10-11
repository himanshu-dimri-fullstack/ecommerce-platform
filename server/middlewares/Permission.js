import Role from "../models/Role.js"

export const Permission = (action) => {
    return async (req, res, next) => {
        try {
            const role = await Role.findOne({ _id: req.user.role })
            if (!role) {
                return res.status(400).json({ message: "Role is required" })
            }
            if (!role.permissions.includes(action)) {
                return res.status(401).json({ message: "Access denied" })
            }
            next()
        }
        catch (error) {
            return res.status(400).json({ message: error.message })
        }
    }
}