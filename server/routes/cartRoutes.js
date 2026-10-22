import express from "express";

import {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
} from "../controllers/cartController.js";

import { Auth } from "../middlewares/Auth.js";

const router = express.Router();

// Get user's cart for a store
router.get("/cart", Auth, getCart);

// Add product variant to cart
router.post("/cart/add", Auth, addToCart);

// Update quantity of a cart item
router.patch("/cart/item/:itemId", Auth, updateCartItem);

// Remove one cart item
router.delete("/cart/item/:itemId", Auth, removeCartItem);

// Remove all items from a store's cart
router.delete("/cart/clear/:storeId", Auth, clearCart);

export default router;