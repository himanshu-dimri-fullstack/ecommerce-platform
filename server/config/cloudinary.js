
import dotEnv from "dotenv"
import { v2 as cloudinary } from "cloudinary"

dotEnv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export const uploadFile = async (path, folder) => {
    try {
        const result = await cloudinary.uploader.upload(path, {
            folder: folder
        })
        return result
    }
    catch (error) {
        console.log(error)
    }
}