
import express from "express";

import {
    addDeliveryPartner,
    getAllDeliveryPartners,
    getSingleDeliveryPartner,
    updateDeliveryPartner,
    updateDeliveryPartnerStatus,
    updateDeliveryPartnerAvailability,
    updateDeliveryPartnerLocation,
    deleteDeliveryPartner,
    getAvailableDeliveryPartnerUsers,
    getMyDeliveryPartnerStatus,
    updateMyOnlineStatus
} from "../controllers/deliveryPartnerController.js";

import { Auth } from "../middlewares/Auth.js";
import { Permission } from "../middlewares/Permission.js";

const router = express.Router();


// ========================================
// DELIVERY PARTNER ROUTES
// ========================================

// ADD
router.post(
    "/add",
    Auth,
    Permission("deliveryPartner:add"),
    addDeliveryPartner
);

// GET ALL
router.get(
    "/get",
    Auth,
    Permission("deliveryPartner:read"),
    getAllDeliveryPartners
);

// GET SINGLE
router.get(
    "/get/:id",
    Auth,
    Permission("deliveryPartner:read"),
    getSingleDeliveryPartner
);

// UPDATE DETAILS
router.put(
    "/update/:id",
    Auth,
    Permission("deliveryPartner:update"),
    updateDeliveryPartner
);

// UPDATE STATUS
router.patch(
    "/update/status",
    Auth,
    Permission("deliveryPartner:status"),
    updateDeliveryPartnerStatus
);

// UPDATE ONLINE / AVAILABILITY
router.patch(
    "/update/availability",
    Auth,
    Permission("deliveryPartner:status"),
    updateDeliveryPartnerAvailability
);

// UPDATE LOCATION
router.patch(
    "/update/location/:id",
    Auth,
    Permission("deliveryPartner:location"),
    updateDeliveryPartnerLocation
);

// DELETE
router.delete(
    "/delete/:id",
    Auth,
    Permission("deliveryPartner:delete"),
    deleteDeliveryPartner
);

router.get(
    "/available-users",
    Auth,
    Permission("deliveryPartner:add"),
    getAvailableDeliveryPartnerUsers
);


// GET LOGGED-IN DELIVERY PARTNER STATUS
router.get(
    "/me/status",
    Auth,
    getMyDeliveryPartnerStatus
);

// UPDATE ONLINE / OFFLINE STATUS
router.patch(
    "/me/online-status",
    Auth,
    updateMyOnlineStatus
);

export default router;
