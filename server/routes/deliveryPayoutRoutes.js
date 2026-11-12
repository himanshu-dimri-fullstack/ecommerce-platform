
import express from "express";
import { Auth } from "../middlewares/Auth.js";
import { Permission } from "../middlewares/Permission.js";

import {
    getAllDeliveryPayouts,
    settleDeliveryPayout,
} from "../controllers/deliveryPayoutController.js";

const router = express.Router();

// GET ALL DELIVERY PAYOUTS
router.get(
    "/get",
    Auth,
    Permission("deliveryPayout:read"),
    getAllDeliveryPayouts
);

// SETTLE DELIVERY PAYOUT
router.patch(
    "/settle/:id",
    Auth,
    Permission("deliveryPayout:update"),
    settleDeliveryPayout
);

export default router;
