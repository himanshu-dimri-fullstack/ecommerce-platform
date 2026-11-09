import express from "express";

import {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    addCompleteCart,
} from "../controllers/cartController.js";

import { Auth } from "../middlewares/Auth.js";

const router = express.Router();

// Get cart for current store
router.get("/get/:storeId", Auth, getCart);

// Add product to cart
router.post("/add", Auth, addToCart);

// Merge guest cart after login
router.post("/addCartItems", Auth, addCompleteCart);

// Update cart item quantity
router.patch("/update/:storeId/:id", Auth, updateCartItem);

// Remove one cart item
router.delete("/delete/:storeId/:id", Auth, removeCartItem);

// Clear current store cart
router.delete("/clear/:storeId", Auth, clearCart);

export default router;