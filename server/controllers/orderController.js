
import mongoose from "mongoose";
import crypto from "crypto";

import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Address from "../models/Address.js";
import Payment from "../models/Payment.js";

import razorpay from "../config/razorpay.js";

// --------------------------------------------------
// PLACE COD ORDER
// --------------------------------------------------

export const placeOrder = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const userId = req.user.id;
        const { addressId, paymentMethod, storeId } = req.body;

        if (
            !addressId ||
            !paymentMethod ||
            !storeId ||
            !mongoose.Types.ObjectId.isValid(storeId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Address, payment method and valid store are required",
            });
        }

        if (paymentMethod !== "cod") {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method",
            });
        }

        session.startTransaction();

        // Validate address ownership
        const address = await Address.findOne({
            _id: addressId,
            user: userId,
        }).session(session);

        if (!address) {
            throw new Error("Invalid delivery address");
        }

        // Fetch cart for the selected store
        const cart = await Cart.findOne({
            user: userId,
            store: storeId,
        }).session(session);

        if (!cart) {
            throw new Error("Cart not found for this store");
        }

        // Fetch cart items
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

        // Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.floor(
            1000 + Math.random() * 9000
        )}`;

        // Create COD order
        const [order] = await Order.create(
            [
                {
                    orderNumber,
                    user: userId,
                    store: cart.store,
                    address: address._id,

                    subtotal: cart.subtotal,
                    discount: cart.discount || 0,
                    deliveryFee: cart.deliveryFee || 0,
                    tax: cart.tax || 0,
                    totalAmount: cart.totalAmount,

                    coupon: cart.coupon || null,

                    paymentMethod: "cod",
                    paymentStatus: "pending",
                    orderStatus: "placed",

                    placedAt: new Date(),
                },
            ],
            { session }
        );

        // Create order items
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

        await OrderItem.insertMany(orderItems, { session });

        // Create COD payment record
        const [payment] = await Payment.create(
            [
                {
                    order: order._id,
                    user: userId,

                    paymentGateway: "cod",
                    transactionId: null,

                    amount: order.totalAmount,
                    currency: "INR",

                    method: "cod",
                    status: "pending",

                    gatewayResponse: null,
                    paidAt: null,
                },
            ],
            { session }
        );

        // Clear only this store's cart
        await CartItem.deleteMany({
            cart: cart._id,
        }).session(session);

        await Cart.deleteOne({
            _id: cart._id,
            user: userId,
            store: cart.store,
        }).session(session);

        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",

            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                store: order.store,

                subtotal: order.subtotal,
                discount: order.discount,
                deliveryFee: order.deliveryFee,
                tax: order.tax,
                totalAmount: order.totalAmount,

                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                orderStatus: order.orderStatus,

                placedAt: order.placedAt,
            },

            payment: {
                _id: payment._id,
                order: payment.order,
                paymentGateway: payment.paymentGateway,
                transactionId: payment.transactionId,
                amount: payment.amount,
                currency: payment.currency,
                method: payment.method,
                status: payment.status,
                paidAt: payment.paidAt,
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

// --------------------------------------------------
// CREATE ONLINE ORDER
// Creates Order + OrderItems only.
// Does not create Payment document.
// Does not clear cart.
// --------------------------------------------------

export const createOnlineOrder = async (req, res) => {
    let createdOrder = null;

    try {
        const userId = req.user.id;
        const { addressId, storeId } = req.body;

        if (
            !addressId ||
            !storeId ||
            !mongoose.Types.ObjectId.isValid(storeId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Delivery address and valid store are required",
            });
        }

        // Validate address ownership
        const address = await Address.findOne({
            _id: addressId,
            user: userId,
        });

        if (!address) {
            return res.status(400).json({
                success: false,
                message: "Invalid delivery address",
            });
        }

        // Fetch cart for selected store
        const cart = await Cart.findOne({
            user: userId,
            store: storeId,
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found for this store",
            });
        }

        // Fetch cart items
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
            });

        if (!cartItems.length) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty",
            });
        }

        // Validate amount
        const totalAmount = Number(cart.totalAmount);

        if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid order amount",
            });
        }

        const amountInPaise = Math.round(totalAmount * 100);

        if (amountInPaise <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment amount",
            });
        }

        // Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.floor(
            1000 + Math.random() * 9000
        )}`;

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: orderNumber,

            notes: {
                userId: userId.toString(),
                storeId: cart.store.toString(),
                orderNumber,
            },
        });

        // Create local order
        createdOrder = await Order.create({
            orderNumber,
            user: userId,
            store: cart.store,
            address: address._id,

            subtotal: cart.subtotal,
            discount: cart.discount || 0,
            deliveryFee: cart.deliveryFee || 0,
            tax: cart.tax || 0,
            totalAmount,

            coupon: cart.coupon || null,

            paymentMethod: "online",
            paymentStatus: "pending",
            orderStatus: "placed",

            razorpayOrderId: razorpayOrder.id,

            placedAt: new Date(),
        });

        // Create order items
        const orderItems = cartItems.map((item) => ({
            order: createdOrder._id,

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

        await OrderItem.insertMany(orderItems);

        return res.status(201).json({
            success: true,
            message: "Online order created successfully",

            order: {
                _id: createdOrder._id,
                orderNumber: createdOrder.orderNumber,
                store: createdOrder.store,
                totalAmount: createdOrder.totalAmount,
                paymentMethod: createdOrder.paymentMethod,
                paymentStatus: createdOrder.paymentStatus,
                orderStatus: createdOrder.orderStatus,
            },

            razorpay: {
                keyId: process.env.RAZORPAY_KEY_ID,
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
            },
        });
    } catch (error) {
        // Clean up incomplete local order if item creation fails
        if (createdOrder?._id) {
            await OrderItem.deleteMany({
                order: createdOrder._id,
            }).catch((cleanupError) => {
                console.error("Order item cleanup error:", cleanupError);
            });

            await Order.deleteOne({
                _id: createdOrder._id,
            }).catch((cleanupError) => {
                console.error("Order cleanup error:", cleanupError);
            });
        }

        console.error("Create Online Order Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Unable to create online order",
        });
    }
};

// --------------------------------------------------
// VERIFY ONLINE PAYMENT
// Creates Payment only after Razorpay confirms capture.
// Clears cart only after successful verification.
// --------------------------------------------------

export const verifyOnlinePayment = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            orderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        if (
            !orderId ||
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment verification details are required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        // Find user's online order
        const order = await Order.findOne({
            _id: orderId,
            user: userId,
            paymentMethod: "online",
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Check existing payment for idempotency
        let payment = await Payment.findOne({
            order: order._id,
            user: userId,
            paymentGateway: "razorpay",
        });

        if (
            order.paymentStatus === "paid" &&
            payment?.status === "success"
        ) {
            return res.status(200).json({
                success: true,
                message: "Payment already verified",
                order,
                payment,
            });
        }

        // Match Razorpay order ID
        if (order.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({
                success: false,
                message: "Invalid Razorpay order ID",
            });
        }

        // Validate signature format
        if (!/^[a-f0-9]{64}$/i.test(razorpay_signature)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature",
            });
        }

        if (!process.env.RAZORPAY_KEY_SECRET) {
            throw new Error("Razorpay secret key is not configured");
        }

        // Generate expected signature
        const generatedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                `${razorpay_order_id}|${razorpay_payment_id}`
            )
            .digest("hex");

        const generatedBuffer = Buffer.from(
            generatedSignature,
            "hex"
        );

        const receivedBuffer = Buffer.from(
            razorpay_signature,
            "hex"
        );

        const isSignatureValid =
            generatedBuffer.length === receivedBuffer.length &&
            crypto.timingSafeEqual(
                generatedBuffer,
                receivedBuffer
            );

        if (!isSignatureValid) {
            return res.status(400).json({
                success: false,
                message: "Payment signature verification failed",
            });
        }

        // Fetch payment directly from Razorpay
        const razorpayPayment = await razorpay.payments.fetch(
            razorpay_payment_id
        );

        // Validate payment details
        if (
            razorpayPayment.order_id !== razorpay_order_id ||
            razorpayPayment.amount !== Math.round(order.totalAmount * 100) ||
            razorpayPayment.currency !== "INR"
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment details do not match the order",
            });
        }

        // Only captured payments are successful
        if (razorpayPayment.status !== "captured") {
            return res.status(409).json({
                success: false,
                message: "Payment has not been captured yet",
                paymentStatus: razorpayPayment.status,
            });
        }

        // Map Razorpay payment method to our Payment schema
        const allowedMethods = [
            "upi",
            "card",
            "netbanking",
            "wallet",
            "emi",
        ];

        const paymentMethod = allowedMethods.includes(
            razorpayPayment.method
        )
            ? razorpayPayment.method
            : "other";

        const gatewayResponse = {
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            method: razorpayPayment.method,
            status: razorpayPayment.status,
        };

        // Create Payment only after successful capture.
        // If an old pending record exists, update it.
        if (!payment) {
            payment = await Payment.create({
                order: order._id,
                user: userId,

                paymentGateway: "razorpay",
                transactionId: razorpay_payment_id,

                amount: order.totalAmount,
                currency: "INR",

                method: paymentMethod,
                status: "success",

                gatewayResponse,
                paidAt: new Date(),
            });
        } else {
            if (payment.status === "success") {
                return res.status(200).json({
                    success: true,
                    message: "Payment already verified",
                    order,
                    payment,
                });
            }

            payment.transactionId = razorpay_payment_id;
            payment.amount = order.totalAmount;
            payment.currency = "INR";
            payment.method = paymentMethod;
            payment.status = "success";
            payment.gatewayResponse = gatewayResponse;
            payment.paidAt = new Date();

            await payment.save();
        }

        // Update order payment status
        order.paymentStatus = "paid";
        await order.save();

        // Clear only the cart belonging to this order's store
        const cart = await Cart.findOne({
            user: userId,
            store: order.store,
        });

        if (cart) {
            await CartItem.deleteMany({
                cart: cart._id,
            });

            await Cart.deleteOne({
                _id: cart._id,
                user: userId,
                store: order.store,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",

            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                store: order.store,
                paymentStatus: order.paymentStatus,
                orderStatus: order.orderStatus,
            },

            payment: {
                _id: payment._id,
                transactionId: payment.transactionId,
                amount: payment.amount,
                method: payment.method,
                status: payment.status,
                paidAt: payment.paidAt,
            },
        });
    } catch (error) {
        console.error("Verify Online Payment Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Payment verification failed",
        });
    }
};

// --------------------------------------------------
// CANCEL ONLINE ORDER
// Called when Razorpay checkout is dismissed.
// Does not touch the cart.
// --------------------------------------------------

export const cancelOnlineOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.body;

        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Valid order ID is required",
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            user: userId,
            paymentMethod: "online",
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Online order not found",
            });
        }

        if (order.paymentStatus === "paid") {
            return res.status(409).json({
                success: false,
                message: "This order is already paid",
            });
        }

        if (!order.razorpayOrderId) {
            return res.status(400).json({
                success: false,
                message: "Razorpay order ID is missing",
            });
        }

        // Check whether a successful Payment record already exists
        const existingPayment = await Payment.findOne({
            order: order._id,
            user: userId,
            paymentGateway: "razorpay",
            status: "success",
        });

        if (existingPayment) {
            return res.status(409).json({
                success: false,
                message: "Payment is already successful. Order cannot be cancelled.",
            });
        }

        // Ask Razorpay for all payment attempts for this order
        const razorpayPayments = await razorpay.orders.fetchPayments(
            order.razorpayOrderId
        );

        const payments = razorpayPayments.items || [];

        // Do not delete if payment is captured or still processing
        const activeStatuses = [
            "created",
            "authorized",
            "captured",
            "pending",
        ];

        const hasActivePayment = payments.some((item) =>
            activeStatuses.includes(item.status)
        );

        if (hasActivePayment) {
            return res.status(409).json({
                success: false,
                message: "Payment is still processing or completed. Order has not been deleted.",
            });
        }

        // Only allow cleanup when there are no attempts
        // or every payment attempt has definitively failed
        const allPaymentsFailed = payments.every(
            (item) => item.status === "failed"
        );

        if (!allPaymentsFailed) {
            return res.status(409).json({
                success: false,
                message: "Payment status is uncertain. Order has not been deleted.",
            });
        }

        // Clean up any pending Razorpay Payment record
        await Payment.deleteMany({
            order: order._id,
            user: userId,
            paymentGateway: "razorpay",
            status: "pending",
        });

        // Delete order items
        await OrderItem.deleteMany({
            order: order._id,
        });

        // Delete local order
        await Order.deleteOne({
            _id: order._id,
            user: userId,
        });

        // Cart is deliberately untouched
        return res.status(200).json({
            success: true,
            message: "Unpaid order cancelled successfully",
        });
    } catch (error) {
        console.error("Cancel Online Order Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Unable to cancel online order",
        });
    }
};

// --------------------------------------------------
// GET MY ORDERS
// --------------------------------------------------

export const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await Order.find({
            user: userId,
        })
            .populate("address")
            .populate("store", "name code")
            .sort({ createdAt: -1 })
            .lean();

        if (!orders.length) {
            return res.status(200).json({
                success: true,
                message: "No orders found",
                orders: [],
            });
        }

        const orderIds = orders.map((order) => order._id);

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

// --------------------------------------------------
// GET ALL ORDERS
// --------------------------------------------------

export const getAllOrders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            status = "all",
        } = req.query;

        const currentPage = Math.max(1, Number(page) || 1);
        const pageLimit = Math.min(100, Math.max(1, Number(limit) || 10));

        // GLOBAL ORDER STATISTICS
        const [
            totalOrders,
            pendingOrders,
            deliveredOrders,
            cancelledOrders,
        ] = await Promise.all([
            Order.countDocuments(),

            Order.countDocuments({
                orderStatus: {
                    $in: ["placed", "confirmed", "processing", "packed"],
                },
            }),

            Order.countDocuments({
                orderStatus: "delivered",
            }),

            Order.countDocuments({
                orderStatus: "cancelled",
            }),
        ]);

        // BASE FILTER
        const filter = {};

        // SEARCH BY ORDER NUMBER OR CUSTOMER NAME/EMAIL
        if (search.trim()) {
            const searchRegex = new RegExp(
                search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "i"
            );

            const User = Order.db.model("User");

            const matchingUsers = await User.find({
                $or: [
                    { name: searchRegex },
                    { email: searchRegex },
                ],
            }).select("_id").lean();

            const userIds = matchingUsers.map((user) => user._id);

            filter.$or = [
                { orderNumber: searchRegex },
                { user: { $in: userIds } },
            ];
        }

        // FILTER BY ORDER STATUS
        if (status && status !== "all") {
            filter.orderStatus = status;
        }

        // FILTERED ORDER COUNT
        const filteredCount = await Order.countDocuments(filter);

        // PAGINATION
        const totalPages = Math.max(
            1,
            Math.ceil(filteredCount / pageLimit)
        );

        const safePage = Math.min(currentPage, totalPages);
        const skip = (safePage - 1) * pageLimit;

        // FETCH PAGINATED ORDERS
        const orders = await Order.find(filter)
            .populate({
                path: "user",
                select: "name email phone",
            })
            .populate({
                path: "address",
            })
            .populate({
                path: "store",
                select: "name code",
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageLimit)
            .lean();

        if (!orders.length) {
            return res.status(200).json({
                success: true,
                message: "No orders found",
                orders: [],
                totalOrders,
                pendingOrders,
                deliveredOrders,
                cancelledOrders,
                filteredCount,
                totalPages,
                currentPage: safePage,
                limit: pageLimit,
            });
        }

        // GET ITEMS ONLY FOR CURRENT PAGE ORDERS
        const orderIds = orders.map((order) => order._id);

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

        // GROUP ORDER ITEMS
        const itemsMap = {};

        orderItems.forEach((item) => {
            const orderId = item.order.toString();

            if (!itemsMap[orderId]) {
                itemsMap[orderId] = [];
            }

            itemsMap[orderId].push({
                ...item,

                productName:
                    item.productName ||
                    item.product?.name ||
                    "Product",

                variantName:
                    item.variantName ||
                    item.variant?.variantName ||
                    item.variant?.name ||
                    "",

                sku:
                    item.sku ||
                    item.variant?.sku ||
                    "",
            });
        });

        // FORMAT ORDERS
        const formattedOrders = orders.map((order) => ({
            ...order,
            items: itemsMap[order._id.toString()] || [],
        }));

        return res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            orders: formattedOrders,

            // GLOBAL STATISTICS
            totalOrders,
            pendingOrders,
            deliveredOrders,
            cancelledOrders,

            // PAGINATION
            filteredCount,
            totalPages,
            currentPage: safePage,
            limit: pageLimit,
        });

    } catch (error) {
        console.error("Get All Orders Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching orders",
        });
    }
};

// --------------------------------------------------
// GET SINGLE ORDER
// --------------------------------------------------

export const getSingleOrder = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        const order = await Order.findById(id)
            .populate("user")
            .populate("address")
            .populate("store", "name code");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

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
