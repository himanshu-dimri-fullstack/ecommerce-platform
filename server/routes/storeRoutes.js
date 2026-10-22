import express from "express"
import {
    getAllManagers, getAllStores, createStore, getStoreById, updateStore,
    deleteStore, updateStoreStatus
} from "../controllers/storeController.js"

const router = express.Router()

router.get("/user/get/managers", getAllManagers)
router.get("/get", getAllStores)
router.post("/add", createStore)
router.get("/get/:id", getStoreById)
router.put("/update/:id", updateStore)
router.delete("/delete/:id", deleteStore)
router.patch("/update/status", updateStoreStatus)

export default router