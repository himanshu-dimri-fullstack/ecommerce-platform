
import mongoose from "mongoose";

import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Address from "../models/Address.js";

export const placeOrder = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const userId = req.user.id;

        const { addressId, paymentMethod } = req.body;

        // 1. Validate input

        if (!addressId || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Address and payment method are required",
            });
        }

        if (!["cod", "online"].includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method",
            });
        }

        // 2. Start transaction

        session.startTransaction();

        // 3. Validate address ownership

        const address = await Address.findOne({
            _id: addressId,
            user: userId,
        }).session(session);

        if (!address) {
            throw new Error("Invalid delivery address");
        }

        // 4. Fetch user's cart

        const cart = await Cart.findOne({
            user: userId,
        }).session(session);

        if (!cart) {
            throw new Error("Cart not found");
        }

        // 5. Fetch cart items

        const cartItems = await CartItem.find({
            cart: cart._id,
        })
            .populate({
                path: "product",
                select: "name",
            })
            .populate({
                path: "variant",
                select: "name variantName sku",
            })
            .session(session);

        if (!cartItems.length) {
            throw new Error("Your cart is empty");
        }

        // 6. Create Order

        const orderNumber = `ORD-${Date.now()}-${Math.floor(
            1000 + Math.random() * 9000
        )}`;

        const [order] = await Order.create(
            [
                {
                    orderNumber,
                    user: userId,
                    store: null,
                    address: address._id,

                    subtotal: cart.subtotal,
                    discount: cart.discount || 0,
                    deliveryFee: cart.deliveryFee || 0,
                    tax: cart.tax || 0,
                    totalAmount: cart.totalAmount,

                    coupon: cart.coupon || null,

                    paymentMethod,
                    paymentStatus: "pending",
                    orderStatus: "placed",

                    placedAt: new Date(),
                },
            ],
            { session }
        );

        // 7. Create Order Items

        const orderItems = cartItems.map((item) => ({
            order: order._id,

            product: item.product._id,

            variant: item.variant?._id || null,

            productName: item.product.name,

            variantName:
                item.variant?.name ||
                item.variant?.variantName ||
                null,

            sku: item.variant?.sku || null,

            quantity: item.quantity,

            price: item.price,

            discount: item.discount || 0,

            tax: item.tax || 0,

            totalPrice: item.totalPrice,
        }));

        await OrderItem.insertMany(orderItems, {
            session,
        });

        // 8. Delete cart items

        await CartItem.deleteMany({
            cart: cart._id,
        }).session(session);

        // 9. Delete cart

        await Cart.deleteOne({
            _id: cart._id,
        }).session(session);

        // 10. Commit transaction

        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                orderStatus: order.orderStatus,
                placedAt: order.placedAt,
            },
        });

    } catch (error) {

        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        console.error("Place Order Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to place order",
        });

    } finally {
        await session.endSession();
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch logged-in user's orders
        const orders = await Order.find({ user: userId })
            .populate("address")
            .sort({ createdAt: -1 })
            .lean();

        // If user has no orders
        if (!orders.length) {
            return res.status(200).json({
                success: true,
                message: "No orders found",
                orders: [],
            });
        }

        // Get all order IDs
        const orderIds = orders.map((order) => order._id);

        // Fetch all items belonging to these orders
        const orderItems = await OrderItem.find({
            order: { $in: orderIds },
        })
            .populate({
                path: "product",
                select: "name image",
            })
            .populate({
                path: "variant",
                select: "name variantName sku",
            })
            .lean();

        // Group items order-wise
        const itemsMap = {};

        orderItems.forEach((item) => {
            const orderId = item.order.toString();

            if (!itemsMap[orderId]) {
                itemsMap[orderId] = [];
            }

            itemsMap[orderId].push({
                ...item,

                // Keep snapshot name as fallback
                productName:
                    item.productName || item.product?.name || "Product",

                variantName:
                    item.variantName ||
                    item.variant?.variantName ||
                    item.variant?.name ||
                    "",

                sku: item.sku || item.variant?.sku || "",
            });
        });

        // Attach items to their respective orders
        const formattedOrders = orders.map((order) => ({
            ...order,
            items: itemsMap[order._id.toString()] || [],
        }));

        return res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            orders: formattedOrders,
        });

    } catch (error) {
        console.error("Get My Orders Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching orders",
        });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        // Fetch all orders
        const orders = await Order.find()
            .populate({
                path: "user",
                select: "name email phone",
            })
            .populate({
                path: "address",
            })
            .sort({ createdAt: -1 })
            .lean();

        if (!orders.length) {
            return res.status(200).json({
                success: true,
                message: "No orders found",
                orders: [],
            });
        }

        // Get all order IDs
        const orderIds = orders.map((order) => order._id);

        // Fetch all order items
        const orderItems = await OrderItem.find({
            order: { $in: orderIds },
        })
            .populate({
                path: "product",
                select: "name image",
            })
            .populate({
                path: "variant",
                select: "name variantName sku",
            })
            .lean();

        // Group order items
        const itemsMap = {};

        orderItems.forEach((item) => {
            const orderId = item.order.toString();

            if (!itemsMap[orderId]) {
                itemsMap[orderId] = [];
            }

            itemsMap[orderId].push({
                ...item,
                productName:
                    item.productName || item.product?.name || "Product",

                variantName:
                    item.variantName ||
                    item.variant?.variantName ||
                    item.variant?.name ||
                    "",

                sku: item.sku || item.variant?.sku || "",
            });
        });

        // Attach items to orders
        const formattedOrders = orders.map((order) => ({
            ...order,
            items: itemsMap[order._id.toString()] || [],
        }));

        return res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            orders: formattedOrders,
        });

    } catch (error) {
        console.error("Get All Orders Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching orders",
        });
    }
};


export const getSingleOrder = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate Order ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        // Fetch Order
        const order = await Order.findById(id)
            .populate("user")
            .populate("address")
        // .populate("coupon")
        // .populate("deliveryPartner");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Fetch Order Items
        const orderItems = await OrderItem.find({
            order: order._id,
        })
            .populate("product")
            .populate("variant");

        return res.status(200).json({
            success: true,
            message: "Order fetched successfully",
            order: {
                ...order.toObject(),
                items: orderItems,
            },
        });

    } catch (error) {
        console.error("Get Single Order Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
