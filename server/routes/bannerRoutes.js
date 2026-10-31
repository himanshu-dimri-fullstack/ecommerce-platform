import express from "express";
import {
    createBanner,
    getBanners,
    getBanner,
    updateBanner,
    deleteBanner,
} from "../controllers/bannerController.js";

const router = express.Router();

router.post("/add", createBanner);
router.get("/get", getBanners);
router.get("/get/:id", getBanner);
router.put("/update/:id", updateBanner);
router.delete("/delete/:id", deleteBanner);

export default router;