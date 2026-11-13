
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";

// ========================================
// HELPER: UPDATE PRODUCT RATING
// ========================================

const updateProductRating = async (product) => {
    const reviews = product.reviews || [];

    const totalReviews = reviews.length;

    const averageRating =
        totalReviews > 0
            ? reviews.reduce((total, review) => total + review.rating, 0) /
            totalReviews
            : 0;

    product.totalReviews = totalReviews;
    product.rating = Number(averageRating.toFixed(1));

    await product.save();
};

// ========================================
// GET ELIGIBLE PRODUCTS
// Only delivered orders
// One product appears only once
// ========================================

export const getEligibleProducts = async (req, res) => {
    try {
        const userId = req.user.id;

        const deliveredOrders = await Order.find({
            user: userId,
            orderStatus: "delivered",
        })
            .select("_id orderNumber deliveredAt")
            .sort({ deliveredAt: -1, createdAt: -1 })
            .lean();

        if (!deliveredOrders.length) {
            return res.status(200).json({
                success: true,
                products: [],
            });
        }

        const orderIds = deliveredOrders.map((order) => order._id);

        const orderItems = await OrderItem.find({
            order: { $in: orderIds },
        })
            .select("order product productName variantName")
            .lean();

        // Keep one entry per parent product.
        // If the same product was purchased in multiple orders,
        // use the most recent delivered order containing it.
        const productOrderMap = new Map();

        for (const order of deliveredOrders) {
            const items = orderItems.filter(
                (item) => item.order.toString() === order._id.toString()
            );

            for (const item of items) {
                if (!item.product) continue;

                const productId = item.product.toString();

                if (!productOrderMap.has(productId)) {
                    productOrderMap.set(productId, {
                        orderId: order._id,
                        orderNumber: order.orderNumber,
                    });
                }
            }
        }

        const productIds = [...productOrderMap.keys()];

        if (!productIds.length) {
            return res.status(200).json({
                success: true,
                products: [],
            });
        }

        const products = await Product.find({
            _id: { $in: productIds },
        })
            .select("name slug images rating totalReviews reviews")
            .lean();

        const eligibleProducts = products
            .filter((product) => {
                const alreadyReviewed = (product.reviews || []).some(
                    (review) =>
                        review.user?.toString() === userId.toString()
                );

                return !alreadyReviewed;
            })
            .map((product) => {
                const orderInfo = productOrderMap.get(
                    product._id.toString()
                );

                return {
                    _id: product._id,
                    name: product.name,
                    slug: product.slug,
                    images: product.images || [],
                    rating: product.rating,
                    totalReviews: product.totalReviews,
                    orderId: orderInfo.orderId,
                    orderNumber: orderInfo.orderNumber,
                };
            });

        return res.status(200).json({
            success: true,
            products: eligibleProducts,
        });
    } catch (error) {
        console.error("Get Eligible Products Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch products for review",
        });
    }
};

// ========================================
// GET MY REVIEWS
// Get all reviews of logged-in customer
// ========================================

export const getMyReviews = async (req, res) => {
    try {
        const userId = req.user.id;

        const products = await Product.find({
            "reviews.user": userId,
        })
            .select("name slug images rating totalReviews reviews")
            .populate({
                path: "reviews.order",
                select: "orderNumber deliveredAt",
            })
            .lean();

        const myReviews = [];

        for (const product of products) {
            const customerReviews = (product.reviews || []).filter(
                (review) =>
                    review.user?.toString() === userId.toString()
            );

            for (const review of customerReviews) {
                myReviews.push({
                    _id: review._id,

                    rating: review.rating,
                    comment: review.comment,
                    createdAt: review.createdAt,
                    updatedAt: review.updatedAt,

                    product: {
                        _id: product._id,
                        name: product.name,
                        slug: product.slug,
                        images: product.images || [],
                        rating: product.rating,
                        totalReviews: product.totalReviews,
                    },

                    order: review.order || null,
                });
            }
        }

        // Latest reviews first
        myReviews.sort(
            (a, b) =>
                new Date(b.createdAt || 0) -
                new Date(a.createdAt || 0)
        );

        return res.status(200).json({
            success: true,
            totalReviews: myReviews.length,
            reviews: myReviews,
        });
    } catch (error) {
        console.error("Get My Reviews Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch your reviews",
        });
    }
};

// ========================================
// ADD REVIEW
// ========================================

export const addReview = async (req, res) => {
    try {
        const userId = req.user.id;

        const { productId, orderId, rating, comment } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(productId) ||
            !mongoose.Types.ObjectId.isValid(orderId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product or order ID",
            });
        }

        const numericRating = Number(rating);

        if (
            !Number.isInteger(numericRating) ||
            numericRating < 1 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5",
            });
        }

        const reviewComment = String(comment || "").trim();

        if (reviewComment.length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Review cannot exceed 1000 characters",
            });
        }

        // Verify that this order belongs to the logged-in customer
        // and has actually been delivered.
        const order = await Order.findOne({
            _id: orderId,
            user: userId,
            orderStatus: "delivered",
        }).select("_id");

        if (!order) {
            return res.status(403).json({
                success: false,
                message: "You can review products only from delivered orders",
            });
        }

        // Verify that the product belongs to this order.
        // Product-level check means variants do not matter.
        const purchasedItem = await OrderItem.exists({
            order: orderId,
            product: productId,
        });

        if (!purchasedItem) {
            return res.status(403).json({
                success: false,
                message: "This product does not belong to the selected order",
            });
        }

        const review = {
            user: userId,
            order: orderId,
            rating: numericRating,
            comment: reviewComment,
        };

        // Atomic duplicate protection:
        // A user cannot add another review for the same product.
        const product = await Product.findOneAndUpdate(
            {
                _id: productId,
                "reviews.user": { $ne: userId },
            },
            {
                $push: {
                    reviews: review,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!product) {
            const existingProduct = await Product.exists({
                _id: productId,
            });

            if (!existingProduct) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found",
                });
            }

            return res.status(409).json({
                success: false,
                message: "You have already reviewed this product",
            });
        }

        await updateProductRating(product);

        return res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            review: product.reviews[product.reviews.length - 1],
            rating: product.rating,
            totalReviews: product.totalReviews,
        });
    } catch (error) {
        console.error("Add Review Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to submit review",
        });
    }
};

// ========================================
// GET PRODUCT REVIEWS
// ========================================

export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const product = await Product.findById(productId)
            .select("rating totalReviews reviews")
            .populate({
                path: "reviews.user",
                select: "firstName lastName profileImage",
            });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const reviews = [...product.reviews].sort(
            (a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
        );

        return res.status(200).json({
            success: true,
            rating: product.rating,
            totalReviews: product.totalReviews,
            reviews,
        });
    } catch (error) {
        console.error("Get Product Reviews Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch product reviews",
        });
    }
};

// ========================================
// UPDATE OWN REVIEW
// ========================================

export const updateReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID",
            });
        }

        const numericRating = Number(rating);

        if (
            !Number.isInteger(numericRating) ||
            numericRating < 1 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5",
            });
        }

        const reviewComment = String(comment || "").trim();

        if (reviewComment.length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Review cannot exceed 1000 characters",
            });
        }

        const product = await Product.findOne({
            "reviews._id": reviewId,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        const review = product.reviews.id(reviewId);

        if (
            !review ||
            review.user.toString() !== userId.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this review",
            });
        }

        review.rating = numericRating;
        review.comment = reviewComment;

        await updateProductRating(product);

        return res.status(200).json({
            success: true,
            message: "Review updated successfully",
            rating: product.rating,
            totalReviews: product.totalReviews,
            review,
        });
    } catch (error) {
        console.error("Update Review Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update review",
        });
    }
};

// ========================================
// DELETE OWN REVIEW
// ========================================

export const deleteReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { reviewId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID",
            });
        }

        const product = await Product.findOne({
            "reviews._id": reviewId,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        const review = product.reviews.id(reviewId);

        if (
            !review ||
            review.user.toString() !== userId.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this review",
            });
        }

        review.deleteOne();

        await updateProductRating(product);

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully",
            rating: product.rating,
            totalReviews: product.totalReviews,
        });
    } catch (error) {
        console.error("Delete Review Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete review",
        });
    }
};
