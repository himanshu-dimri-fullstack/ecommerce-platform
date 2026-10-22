import mongoose from "mongoose";

import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import ProductVariant from "../models/ProductVariant.js";

const recalculateCart = async (cartId) => {
    const items = await CartItem.find({ cart: cartId });

    const subtotal = items.reduce(
        (sum, item) => sum + item.totalPrice,
        0
    );

    const cart = await Cart.findById(cartId);

    if (!cart) {
        throw new Error("Cart not found");
    }

    cart.subtotal = subtotal;

    // Recalculate these when coupon/tax/delivery logic is implemented.
    cart.totalAmount =
        subtotal -
        (cart.discount || 0) +
        (cart.deliveryFee || 0) +
        (cart.tax || 0);

    await cart.save();

    return cart;
};

// GET: Logged-in user's cart for a store
export const getCart = async (req, res) => {
    try {
        const { storeId } = req.query;
        const userId = req.user._id;

        if (!storeId) {
            return res.status(400).json({
                success: false,
                message: "Store ID is required",
            });
        }

        const cart = await Cart.findOne({
            user: userId,
            store: storeId,
        }).populate("coupon");

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

// POST: Add product variant to cart
export const addToCart = async (req, res) => {
    try {
        const { storeId, productId, variantId, quantity = 1 } = req.body;
        const userId = req.user._id;

        if (!storeId || !productId || !variantId) {
            return res.status(400).json({
                success: false,
                message: "Store, product and variant are required",
            });
        }

        if (
            !mongoose.isValidObjectId(storeId) ||
            !mongoose.isValidObjectId(productId) ||
            !mongoose.isValidObjectId(variantId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid store, product or variant ID",
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
            product: productId,
            status: "active",
        });

        if (!variant) {
            return res.status(404).json({
                success: false,
                message: "Active product variant not found",
            });
        }

        // Price always comes from the database.
        const price = Number(variant.sellingPrice);

        if (!Number.isFinite(price) || price < 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product price",
            });
        }

        // Reuse the existing cart for this user and store.
        let cart = await Cart.findOne({
            user: userId,
            store: storeId,
        });

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

        // Same product + variant => increase existing quantity.
        let cartItem = await CartItem.findOne({
            cart: cart._id,
            product: productId,
            variant: variantId,
        });

        if (cartItem) {
            cartItem.quantity += parsedQuantity;
            cartItem.price = price;
            cartItem.totalPrice = cartItem.quantity * price;

            await cartItem.save();
        } else {
            cartItem = await CartItem.create({
                cart: cart._id,
                product: productId,
                variant: variantId,
                quantity: parsedQuantity,
                price,
                totalPrice: parsedQuantity * price,
            });
        }

        cart = await recalculateCart(cart._id);

        const items = await CartItem.find({
            cart: cart._id,
        })
            .populate("product")
            .populate("variant");

        return res.status(200).json({
            success: true,
            message: "Product added to cart successfully",
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

// PATCH: Update cart item quantity
export const updateCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;
        const userId = req.user._id;

        const parsedQuantity = Number(quantity);

        if (
            !mongoose.isValidObjectId(itemId) ||
            !Number.isSafeInteger(parsedQuantity) ||
            parsedQuantity < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid item ID and positive quantity are required",
            });
        }

        const cartItem = await CartItem.findById(itemId);

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }

        const cart = await Cart.findOne({
            _id: cartItem.cart,
            user: userId,
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        const variant = await ProductVariant.findOne({
            _id: cartItem.variant,
            product: cartItem.product,
            status: "active",
        });

        if (!variant) {
            return res.status(400).json({
                success: false,
                message: "Product variant is no longer available",
            });
        }

        cartItem.quantity = parsedQuantity;
        cartItem.price = Number(variant.sellingPrice);
        cartItem.totalPrice = cartItem.quantity * cartItem.price;

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

// DELETE: Remove one item from cart
export const removeCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const userId = req.user._id;

        if (!mongoose.isValidObjectId(itemId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid cart item ID",
            });
        }

        const cartItem = await CartItem.findById(itemId);

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }

        const cart = await Cart.findOne({
            _id: cartItem.cart,
            user: userId,
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        await cartItem.deleteOne();

        const updatedCart = await recalculateCart(cart._id);

        const items = await CartItem.find({
            cart: cart._id,
        })
            .populate("product")
            .populate("variant");

        return res.status(200).json({
            success: true,
            message: "Cart item removed successfully",
            cart: updatedCart,
            items,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// DELETE: Clear all items from a cart
export const clearCart = async (req, res) => {
    try {
        const { storeId } = req.params;
        const userId = req.user._id;

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