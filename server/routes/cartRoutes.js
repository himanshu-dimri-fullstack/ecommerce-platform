import express from "express";

import {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    addCompleteCart
} from "../controllers/cartController.js";

import { Auth } from "../middlewares/Auth.js";

const router = express.Router();

// Get user's cart for a store
router.get("/get", Auth, getCart);

// Add product variant to cart
router.post("/add", Auth, addToCart);

router.post("/addCartItems", Auth, addCompleteCart)

// Update quantity of a cart item
router.patch("/update/:id", Auth, updateCartItem);

// Remove one cart item
router.delete("/delete/:id", Auth, removeCartItem);

// Remove all items from a store's cart
// router.delete("/cart/clear/:storeId", Auth, clearCart);

export default router;