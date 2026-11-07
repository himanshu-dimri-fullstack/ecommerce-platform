
import express from "express";

import { Auth } from "../middlewares/Auth.js";
import { Permission } from "../middlewares/Permission.js";

import {
    placeOrder, getMyOrders, getAllOrders, getSingleOrder, createOnlineOrder,
    verifyOnlinePayment,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/place", Auth, placeOrder);
router.get("/my-orders", Auth, getMyOrders);
router.get("/get", Auth, Permission("order:read"), getAllOrders);
router.get("/get/:id", Auth, getSingleOrder);

// Razorpay online payment
router.post("/create-online", Auth, createOnlineOrder);
router.post("/verify-payment", Auth, verifyOnlinePayment);

export default router;
