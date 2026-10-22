import express from "express";

import {
    getAllModuleCounts
} from "../controllers/dashboardController.js";
import { Auth } from "../middlewares/Auth.js";

const router = express.Router();

router.get("/allModuleCounts", Auth, getAllModuleCounts);


export default router;