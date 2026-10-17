import express from "express"
import {
    getAllManagers, getAllStores, createStore, getStoreById, updateStore,
    deleteStore, updateStoreStatus
} from "../controllers/storeController.js"

const router = express.Router()

router.get("/admin/user/get/managers", getAllManagers)
router.get("/admin/store", getAllStores)
router.post("/admin/store", createStore)
router.get("/admin/store/:id", getStoreById)
router.put("/admin/store/:id", updateStore)
router.delete("/admin/store/:id", deleteStore)
router.patch("/admin/store/status", updateStoreStatus)

export default router