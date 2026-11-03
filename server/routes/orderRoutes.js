
import express from "express";

import { Auth } from "../middlewares/Auth.js";

import {
    placeOrder, getMyOrders
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/place", Auth, placeOrder);
router.get("/my-orders", Auth, getMyOrders);

export default router;
