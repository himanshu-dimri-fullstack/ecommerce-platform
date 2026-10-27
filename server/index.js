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
import storeRoutes from "./routes/storeRoutes.js"
import cartRoutes from "./routes/cartRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js"

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
    origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
    credentials: true
}));

app.use("/user", userRoutes)
app.use("/category", categoryRoutes)
app.use("/subcategory", subcategoryRoutes)
app.use("/role", roleRoutes)
app.use("/brand", brandRoutes)
app.use("/admin", adminRoutes)
app.use("/dashboard", dashboardRoutes)
app.use("/product", productRoutes)
app.use("/variant", productVariantRoutes)
app.use("/store", storeRoutes)
app.use("/cart", cartRoutes)
app.use("/inventory", inventoryRoutes)

app.listen(8000, () => {
    console.log("server running on port 8000")
})