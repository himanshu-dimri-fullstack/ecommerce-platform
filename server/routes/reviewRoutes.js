import express from "express";

import {
    getEligibleProducts,
    getMyReviews,
    addReview,
    getProductReviews,
    updateReview,
    deleteReview,
} from "../controllers/reviewController.js";

import { Auth } from "../middlewares/Auth.js";

const router = express.Router();

// Customer's products from delivered orders
router.get("/eligible-products", Auth, getEligibleProducts);

// Get logged-in customer's reviews
router.get("/my-reviews", Auth, getMyReviews);

// Add a product review
router.post("/add", Auth, addReview);

// Get all reviews of a product (public)
router.get("/product/:productId", getProductReviews);

// Update own review
router.patch("/update/:reviewId", Auth, updateReview);

// Delete own review
router.delete("/delete/:reviewId", Auth, deleteReview);

export default router;