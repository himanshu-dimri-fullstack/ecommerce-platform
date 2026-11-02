import express from "express";

import {
    addAddress,
    getAddresses,
    updateAddress,
    deleteAddress,
    updateDefaultAddress
} from "../controllers/addressController.js";

import { Auth } from "../middlewares/Auth.js";

const router = express.Router();

router.post("/add", Auth, addAddress);

router.get("/get", Auth, getAddresses);

router.patch("/update/:id", Auth, updateAddress);

router.patch("/update-default/:id", Auth, updateDefaultAddress);

router.delete("/delete/:id", Auth, deleteAddress);

export default router;
