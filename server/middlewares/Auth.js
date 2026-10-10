import jwt from "jsonwebtoken"

export const Auth = async (req, res, next) => {
    try {
        const token = req?.cookies?.token
        if (!token) {
            return res.status(401).json({ message: "Access denied" })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" })
        }
        req.user = decoded
        next()
    }
    catch (error) {
        console.log(error)
    }
}