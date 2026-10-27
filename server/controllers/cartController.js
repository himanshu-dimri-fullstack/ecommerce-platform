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
        const userId = req.user.id;
        const cart = await Cart.findOne({
            user: userId,
        })

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
        const { product, variant, quantity = 1 } = req.body;
        const userId = req.user.id;

        if (!product || !variant) {
            return res.status(400).json({
                success: false,
                message: "Product and variant are required",
            });
        }

        if (
            !mongoose.isValidObjectId(product) ||
            !mongoose.isValidObjectId(variant)
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

        // Find active product variant
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

        // Find user's cart
        let cart = await Cart.findOne({
            user: userId,
        });

        // Create cart if it doesn't exist
        if (!cart) {
            cart = await Cart.create({
                user: userId,
                subtotal: 0,
                discount: 0,
                deliveryFee: 0,
                tax: 0,
                totalAmount: 0,
            });
        }

        // Find item using cart ID and variant ID
        let cartItem = await CartItem.findOne({
            cart: cart._id,
            variant,
            product,
        });

        if (cartItem) {
            cartItem.quantity += parsedQuantity;
            cartItem.price = price;
            cartItem.totalPrice = cartItem.quantity * price;

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

        // Recalculate cart totals
        await recalculateCart(cart._id);

        // Get updated items
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

export const addCompleteCart = async (req, res) => {
    try {
        const { cart: cartData } = req.body;
        const userId = req.user.id;

        // 1. Validate cart data
        if (!Array.isArray(cartData) || cartData.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart must contain at least one product",
            });
        }

        // 2. Find existing cart for the logged-in user
        let cart = await Cart.findOne({
            user: userId,
        });

        // 3. Create a new cart if it doesn't exist
        if (!cart) {
            cart = await Cart.create({
                user: userId,
                subtotal: 0,
                discount: 0,
                deliveryFee: 0,
                tax: 0,
                totalAmount: 0,
            });
        }

        // 4. Process each product from the frontend cart
        for (const item of cartData) {
            const { product, _id: variantId, quantity } = item;

            // Validate IDs
            if (
                !mongoose.isValidObjectId(product) ||
                !mongoose.isValidObjectId(variantId)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product or variant ID",
                });
            }

            // Validate quantity
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

            // 5. Get actual product variant from database
            const variant = await ProductVariant.findOne({
                _id: variantId,
                product: product,
                status: "active",
            });

            if (!variant) {
                return res.status(404).json({
                    success: false,
                    message: `Active variant not found for product ${product}`,
                });
            }

            // Always use price from the database
            const price = Number(variant.sellingPrice);

            if (!Number.isFinite(price) || price < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product price",
                });
            }

            // 6. Check whether this product variant already exists
            let cartItem = await CartItem.findOne({
                cart: cart._id,
                product,
                variant: variantId,
            });

            if (cartItem) {
                // Update existing item's quantity
                cartItem.quantity += parsedQuantity;
                cartItem.price = price;
                cartItem.totalPrice = cartItem.quantity * price;

                await cartItem.save();
            } else {
                // Create a new cart item
                await CartItem.create({
                    cart: cart._id,
                    product,
                    variant: variantId,
                    quantity: parsedQuantity,
                    price,
                    totalPrice: parsedQuantity * price,
                });
            }
        }

        // 7. Get all items belonging to this cart
        const items = await CartItem.find({
            cart: cart._id,
        })
            .populate("product")
            .populate("variant");

        // 8. Calculate cart subtotal
        const subtotal = items.reduce(
            (total, item) => total + item.totalPrice,
            0
        );

        // 9. Update cart totals
        cart.subtotal = subtotal;
        cart.totalAmount =
            subtotal
        // -
        // cart.discount +
        // cart.deliveryFee +
        // cart.tax;

        await cart.save();

        // 10. Return the updated cart and items
        return res.status(200).json({
            success: true,
            message: "Cart updated successfully",
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
        const { id } = req.params; // Variant ID
        const { quantity } = req.body; // 1 or -1
        const userId = req.user.id;

        const parsedQuantity = Number(quantity);

        if (
            !mongoose.isValidObjectId(id) ||
            !Number.isSafeInteger(parsedQuantity) ||
            ![1, -1].includes(parsedQuantity)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid variant ID and quantity (1 or -1) are required",
            });
        }

        // Find user's cart
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        // Find cart item using cart ID and variant ID
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

        // Check whether the variant is active
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

        const updatedQuantity = cartItem.quantity + parsedQuantity;

        if (updatedQuantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity cannot be less than 1",
            });
        }

        cartItem.quantity = updatedQuantity;
        cartItem.price = Number(variant.sellingPrice);
        cartItem.totalPrice = updatedQuantity * cartItem.price;

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
        const { id } = req.params; // Variant ID
        const userId = req.user.id;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid variant ID",
            });
        }

        // Find user's cart
        const cart = await Cart.findOne({
            user: userId,
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        // Find cart item using cart ID and variant ID
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