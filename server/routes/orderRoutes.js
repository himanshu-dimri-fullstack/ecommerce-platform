
import express from "express";
import { Auth } from "../middlewares/Auth.js";
import { Permission } from "../middlewares/Permission.js";

import {
    placeOrder,
    getMyOrders,
    getAllOrders,
    getSingleOrder,
    createOnlineOrder,
    verifyOnlinePayment,
    cancelOnlineOrder,
    assignDeliveryPartner,
    verifyDeliveryOtp
} from "../controllers/orderController.js";

const router = express.Router();

// place order
router.post("/place", Auth, placeOrder);

// User orders
router.get("/my-orders", Auth, getMyOrders);

// Admin orders
router.get("/get", Auth, Permission("order:read"), getAllOrders);
router.get("/get/:id", Auth, Permission("order:read"), getSingleOrder);
router.patch(
    "/assign-delivery-partner",
    Auth,
    Permission("order:assign"),
    assignDeliveryPartner
);

router.post("/verify-otp", Auth, verifyDeliveryOtp);

// Razorpay online payment
router.post("/create-online", Auth, createOnlineOrder);
router.post("/verify-payment", Auth, verifyOnlinePayment);
router.post("/cancel-online", Auth, cancelOnlineOrder);

export default router;
