import jwt from "jsonwebtoken";

export const Auth = async (req, res, next) => {
    try {
        let token = null;

        if (req.cookies?.adminToken) {
            token = req.cookies.adminToken;
        } else {
            token = req.cookies?.clientToken;
        }

        if (!token) {
            return res.status(401).json({
                message: "Access denied",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();

    } catch (error) {
        console.log(error);

        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};