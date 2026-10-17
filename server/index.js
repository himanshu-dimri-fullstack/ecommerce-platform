import express from "express"
import { connectDB } from "./config/db.js"
import cors from "cors"
import userRoutes from "./routes/userRoutes.js"
import categoryRoutes from "./routes/categoryRoutes.js"
import subcategoryRoutes from "./routes/subcategoryRoutes.js"
import roleRoutes from "./routes/roleRoutes.js"
import brandRoutes from "./routes/brandRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import filupload from "express-fileupload"
import dashboardRoutes from "./routes/dashboardRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import productVariantRoutes from "./routes/productVariantRoutes.js"

dotenv.config()

const app = express()

connectDB()

app.use(filupload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}))

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use("/api", userRoutes)
app.use("/api", categoryRoutes)
app.use("/api", subcategoryRoutes)
app.use("/api", roleRoutes)
app.use("/api", brandRoutes)
app.use("/api", adminRoutes)
app.use("/api", dashboardRoutes)
app.use("/api", productRoutes)
app.use("/api", productVariantRoutes)

app.listen(8000, () => {
    console.log("server running on port 8000")
})