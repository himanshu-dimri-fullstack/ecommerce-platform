export const handleResponseError = (error, res, name = "") => {
    if (error.name === "CastError") {
        return res.status(400).json({ message: `Invalid ${name} ID` });
    }
    if (error.name === "ValidationError") {
        const message = Object.values(error.errors)[0].message;
        return res.status(400).json({ message });
    }
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
        return res.status(400).json({ message: `${fieldName} already exists` });
    }
    // res.status(500).json({ message: "Internal Server Error" })
    res.status(500).json({ message: error.message })
}