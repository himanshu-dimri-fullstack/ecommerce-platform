
import mongoose from "mongoose";

import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import ProductVariant from "../models/ProductVariant.js";
import calculateDeliveryFee from "../utils/deliveryFee.js";

// ============================================
// RECALCULATE CART TOTALS
// ============================================


const recalculateCart = async (cartId) => {
    const items = await CartItem.find({
        cart: cartId,
    });

    const subtotal = items.reduce(
        (sum, item) => sum + Number(item.totalPrice || 0),
        0
    );

    const cart = await Cart.findById(cartId);

    if (!cart) {
        throw new Error("Cart not found");
    }

    // Calculate delivery fee from product subtotal
    const deliveryFee = calculateDeliveryFee(subtotal);

    // No coupon or separate tax calculation for now
    cart.subtotal = subtotal;
    cart.discount = 0;
    cart.deliveryFee = deliveryFee;
    cart.tax = 0;
    cart.coupon = null;

    // Final payable amount
    cart.totalAmount = Number(
        (subtotal + deliveryFee).toFixed(2)
    );

    await cart.save();

    return cart;
};


// ============================================
// GET USER CART FOR CURRENT STORE
// ============================================

export const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { storeId } = req.params;

        if (!mongoose.isValidObjectId(storeId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID",
            });
        }

        const cart = await Cart.findOne({
            user: userId,
            store: storeId,
        });

        if (!cart) {
            return res.status(200).json({
                success: true,
                message: "Cart is empty",
                cart: null,
                items: [],
            });
        }

        const items = await CartItem.find({
            cart: cart._id,
        })
            .populate("product")
            .populate("variant");

        return res.status(200).json({
            success: true,
            cart,
            items,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ============================================
// ADD PRODUCT TO CART
// ============================================

export const addToCart = async (req, res) => {
    try {
        const {
            product,
            variant,
            quantity = 1,
            storeId,
        } = req.body;

        const userId = req.user.id;

        if (!product || !variant || !storeId) {
            return res.status(400).json({
                success: false,
                message: "Product, variant and store are required",
            });
        }

        if (
            !mongoose.isValidObjectId(product) ||
            !mongoose.isValidObjectId(variant) ||
            !mongoose.isValidObjectId(storeId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product, variant or store ID",
            });
        }

        const parsedQuantity = Number(quantity);

        if (
            !Number.isSafeInteger(parsedQuantity) ||
            parsedQuantity < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer",
            });
        }

        const productVariant = await ProductVariant.findOne({
            _id: variant,
            product,
            status: "active",
        });

        if (!productVariant) {
            return res.status(404).json({
                success: false,
                message: "Active product variant not found",
            });
        }

        const price = Number(productVariant.sellingPrice);

        if (!Number.isFinite(price) || price < 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product price",
            });
        }

        // Find cart for current user and store
        let cart = await Cart.findOne({
            user: userId,
            store: storeId,
        });

        // Create cart if not found
        if (!cart) {
            cart = await Cart.create({
                user: userId,
                store: storeId,
                subtotal: 0,
                discount: 0,
                deliveryFee: 0,
                tax: 0,
                totalAmount: 0,
            });
        }

        // Find existing cart item
        let cartItem = await CartItem.findOne({
            cart: cart._id,
            variant,
            product,
        });

        if (cartItem) {
            cartItem.quantity += parsedQuantity;
            cartItem.price = price;
            cartItem.totalPrice =
                cartItem.quantity * price;

            await cartItem.save();
        } else {
            await CartItem.create({
                cart: cart._id,
                product,
                variant,
                quantity: parsedQuantity,
                price,
                totalPrice: parsedQuantity * price,
            });
        }

        await recalculateCart(cart._id);

        const items = await CartItem.find({
            cart: cart._id,
        })
            .populate("product")
            .populate("variant");

        return res.status(200).json({
            success: true,
            message: "Product added to cart successfully",
            cart: await Cart.findById(cart._id),
            items,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ============================================
// MERGE GUEST CART AFTER LOGIN
// ============================================

export const addCompleteCart = async (req, res) => {
    try {
        const {
            cart: cartData,
            storeId,
        } = req.body;

        const userId = req.user.id;

        // Validate store ID
        if (!mongoose.isValidObjectId(storeId)) {
            return res.status(400).json({
                success: false,
                message: "Valid store ID is required",
            });
        }

        // Validate cart
        if (!Array.isArray(cartData) || cartData.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart must contain at least one product",
            });
        }

        // Validate all items before changing database
        const validatedItems = [];

        for (const item of cartData) {
            const {
                productId: product,
                _id: variantId,
                quantity,
            } = item;

            if (
                !mongoose.isValidObjectId(product) ||
                !mongoose.isValidObjectId(variantId)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product or variant ID",
                });
            }

            const parsedQuantity = Number(quantity);

            if (
                !Number.isSafeInteger(parsedQuantity) ||
                parsedQuantity < 1
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Quantity must be a positive integer",
                });
            }

            const variant = await ProductVariant.findOne({
                _id: variantId,
                product,
                status: "active",
            });

            if (!variant) {
                return res.status(404).json({
                    success: false,
                    message: `Active variant not found for product ${product}`,
                });
            }

            const price = Number(variant.sellingPrice);

            if (!Number.isFinite(price) || price < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product price",
                });
            }

            validatedItems.push({
                product,
                variant: variantId,
                quantity: parsedQuantity,
                price,
            });
        }

        // Find cart for current user and store
        let cart = await Cart.findOne({
            user: userId,
            store: storeId,
        });

        // Create cart if it doesn't exist
        if (!cart) {
            cart = await Cart.create({
                user: userId,
                store: storeId,
                subtotal: 0,
                discount: 0,
                deliveryFee: 0,
                tax: 0,
                totalAmount: 0,
            });
        }

        // Merge guest cart items
        for (const item of validatedItems) {
            const {
                product,
                variant,
                quantity,
                price,
            } = item;

            let cartItem = await CartItem.findOne({
                cart: cart._id,
                product,
                variant,
            });

            if (cartItem) {
                cartItem.quantity += quantity;
                cartItem.price = price;
                cartItem.totalPrice =
                    cartItem.quantity * price;

                await cartItem.save();
            } else {
                await CartItem.create({
                    cart: cart._id,
                    product,
                    variant,
                    quantity,
                    price,
                    totalPrice: quantity * price,
                });
            }
        }

        // Recalculate cart totals
        await recalculateCart(cart._id);

        const items = await CartItem.find({
            cart: cart._id,
        })
            .populate("product")
            .populate("variant");

        return res.status(200).json({
            success: true,
            message: "Cart merged successfully",
            cart: await Cart.findById(cart._id),
            items,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ============================================
// UPDATE CART ITEM QUANTITY
// ============================================

export const updateCartItem = async (req, res) => {
    try {
        const {
            storeId,
            id,
        } = req.params;

        const { quantity } = req.body;

        const userId = req.user.id;
        const parsedQuantity = Number(quantity);

        if (
            !mongoose.isValidObjectId(storeId) ||
            !mongoose.isValidObjectId(id) ||
            !Number.isSafeInteger(parsedQuantity) ||
            ![1, -1].includes(parsedQuantity)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid store ID, variant ID and quantity (1 or -1) are required",
            });
        }

        const cart = await Cart.findOne({
            user: userId,
            store: storeId,
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        const cartItem = await CartItem.findOne({
            cart: cart._id,
            variant: id,
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }

        const variant = await ProductVariant.findOne({
            _id: id,
            product: cartItem.product,
            status: "active",
        });

        if (!variant) {
            return res.status(400).json({
                success: false,
                message: "Product variant is no longer available",
            });
        }

        const updatedQuantity =
            cartItem.quantity + parsedQuantity;

        if (updatedQuantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity cannot be less than 1",
            });
        }

        cartItem.quantity = updatedQuantity;
        cartItem.price = Number(variant.sellingPrice);
        cartItem.totalPrice =
            updatedQuantity * cartItem.price;

        await cartItem.save();

        await recalculateCart(cart._id);

        const items = await CartItem.find({
            cart: cart._id,
        })
            .populate("product")
            .populate("variant");

        return res.status(200).json({
            success: true,
            message: "Cart quantity updated successfully",
            cart: await Cart.findById(cart._id),
            items,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ============================================
// REMOVE ONE CART ITEM
// ============================================

export const removeCartItem = async (req, res) => {
    try {
        const {
            storeId,
            id,
        } = req.params;

        const userId = req.user.id;

        if (
            !mongoose.isValidObjectId(storeId) ||
            !mongoose.isValidObjectId(id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid store or variant ID",
            });
        }

        const cart = await Cart.findOne({
            user: userId,
            store: storeId,
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        const cartItem = await CartItem.findOne({
            cart: cart._id,
            variant: id,
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }

        await cartItem.deleteOne();

        await recalculateCart(cart._id);

        const items = await CartItem.find({
            cart: cart._id,
        })
            .populate("product")
            .populate("variant");

        return res.status(200).json({
            success: true,
            message: "Cart item removed successfully",
            cart: await Cart.findById(cart._id),
            items,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ============================================
// CLEAR ALL CART ITEMS FOR A STORE
// ============================================

export const clearCart = async (req, res) => {
    try {
        const { storeId } = req.params;
        const userId = req.user.id;

        if (!mongoose.isValidObjectId(storeId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID",
            });
        }

        const cart = await Cart.findOne({
            user: userId,
            store: storeId,
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        await CartItem.deleteMany({
            cart: cart._id,
        });

        const updatedCart = await recalculateCart(cart._id);

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            cart: updatedCart,
            items: [],
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
