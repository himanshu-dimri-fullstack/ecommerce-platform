import Brand from "../models/Brand.js"
import Category from "../models/Category.js"
import Role from "../models/Role.js"
import Subcategory from "../models/Subcategory.js"
import User from "../models/User.js"

export const getAllModuleCounts = async (_, res) => {
    try {
        const category = await Category.find().countDocuments()
        const subcategory = await Subcategory.find().countDocuments()
        const role = await Role.find().countDocuments()
        const brand = await Brand.find().countDocuments()
        const user = await User.find().countDocuments()
        return res.status(200).json({ category, subcategory, role, brand, user })
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
}