import express from "express"
import {
    getAllManagers, getAllStores, createStore, getStoreById, updateStore,
    deleteStore, updateStoreStatus
} from "../controllers/storeController.js"
import { Auth } from "../middlewares/Auth.js";
import { Permission } from "../middlewares/Permission.js";

const router = express.Router()

router.get("/user/get/managers", getAllManagers)
router.get("/get", getAllStores)
router.post("/add", Auth, Permission("store:add"), createStore)
router.get("/get/:id", Auth, Permission("store:read"), getStoreById)
router.put("/update/:id", Auth, Permission("store:update"), updateStore)
router.delete("/delete/:id", Auth, Permission("store:delete"), deleteStore)
router.patch("/update/status", updateStoreStatus)

export default router