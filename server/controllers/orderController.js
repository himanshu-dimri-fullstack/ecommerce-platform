import mongoose from "mongoose";
import crypto from "crypto";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Address from "../models/Address.js";
import Payment from "../models/Payment.js";
import Delivery from "../models/Delivery.js";
import DeliveryPartner from "../models/DeliveryPartner.js";
import razorpay from "../config/razorpay.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import StoreInventory from "../models/Inventory.js";
import Store from "../models/Store.js";



// --------------------------------------------------
// RESERVE AVAILABLE INVENTORY
// Only availableQuantity will be decreased.
// quantity and reservedQuantity remain unchanged.
// --------------------------------------------------

const reserveAvailableInventory = async (
    storeId,
    cartItems,
    session
) => {
    for (const item of cartItems) {
        const productId = item.product?._id || item.product;
        const variantId = item.variant?._id || item.variant;
        const orderQuantity = Number(item.quantity);

        if (!productId || !variantId) {
            throw new Error(
                "Product or variant information is missing from cart"
            );
        }

        if (
            !Number.isInteger(orderQuantity) ||
            orderQuantity <= 0
        ) {
            throw new Error("Invalid product quantity in cart");
        }

        const inventoryUpdate = await StoreInventory.updateOne(
            {
                store: storeId,
                product: productId,
                variant: variantId,
                status: "active",
                availableQuantity: {
                    $gte: orderQuantity,
                },
            },
            {
                $inc: {
                    availableQuantity: -orderQuantity,
                },
            },
            {
                session,
            }
        );

        if (inventoryUpdate.modifiedCount !== 1) {
            throw new Error(
                `Insufficient available stock for ${item.product?.name || "a product"}`
            );
        }
    }
};

// --------------------------------------------------
// RELEASE AVAILABLE INVENTORY
// Used when an unpaid online order is cancelled.
// Only availableQuantity will be increased.
// --------------------------------------------------

const releaseAvailableInventory = async (
    storeId,
    orderItems,
    session
) => {
    for (const item of orderItems) {
        if (!item.product || !item.variant) {
            throw new Error(
                "Product or variant information is missing from order"
            );
        }

        const orderQuantity = Number(item.quantity);

        if (
            !Number.isInteger(orderQuantity) ||
            orderQuantity <= 0
        ) {
            throw new Error("Invalid order item quantity");
        }

        const inventoryUpdate = await StoreInventory.updateOne(
            {
                store: storeId,
                product: item.product,
                variant: item.variant,
            },
            {
                $inc: {
                    availableQuantity: orderQuantity,
                },
            },
            {
                session,
            }
        );

        if (inventoryUpdate.modifiedCount !== 1) {
            throw new Error(
                "Inventory record not found while releasing stock"
            );
        }
    }
};

// --------------------------------------------------
// CREATE DELIVERY RECORD
// Used by both COD and Online orders
// --------------------------------------------------

const createOrderDelivery = async (
    order,
    address,
    session = null
) => {
    const deliveryOtp = crypto.randomInt(1000, 10000).toString();

    const coordinates = address.location?.coordinates;

    if (
        !Array.isArray(coordinates) ||
        coordinates.length !== 2 ||
        !coordinates.every(Number.isFinite)
    ) {
        throw new Error("Customer delivery location is invalid");
    }

    const deliveryAddress = [
        address.houseNumber,
        address.street,
        address.landmark,
        address.city,
        address.state,
        address.country,
        address.pincode,
    ]
        .filter(Boolean)
        .join(", ");

    const deliveryData = {
        order: order._id,
        deliveryPartner: null,
        store: order.store,
        deliveryOtp,
        deliveryAddress,
        customerLocation: {
            type: "Point",
            coordinates,
        },
        notes: "",
    };

    const [delivery] = await Delivery.create(
        [deliveryData],
        session ? { session } : {}
    );

    return delivery;
};

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

        // Fetch cart for selected store
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

        // CHECK AND DECREASE AVAILABLE INVENTORY
        await reserveAvailableInventory(
            cart.store,
            cartItems,
            session
        );

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

        // Create delivery record with OTP
        await createOrderDelivery(order, address, session);

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
// Creates Order + OrderItems + Delivery
// Does not create Payment document.
// Does not clear cart.
// --------------------------------------------------

export const createOnlineOrder = async (req, res) => {
    const session = await mongoose.startSession();

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

        // Start transaction for local order and inventory operations
        session.startTransaction();

        // Recheck cart inside transaction
        const currentCart = await Cart.findOne({
            _id: cart._id,
            user: userId,
            store: storeId,
        }).session(session);

        if (!currentCart) {
            throw new Error("Cart is no longer available");
        }

        const currentCartItems = await CartItem.find({
            cart: currentCart._id,
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

        if (!currentCartItems.length) {
            throw new Error("Your cart is empty");
        }

        // DECREASE AVAILABLE INVENTORY
        await reserveAvailableInventory(
            currentCart.store,
            currentCartItems,
            session
        );

        // Create local order
        const [createdOrder] = await Order.create(
            [
                {
                    orderNumber,
                    user: userId,
                    store: currentCart.store,
                    address: address._id,

                    subtotal: currentCart.subtotal,
                    discount: currentCart.discount || 0,
                    deliveryFee: currentCart.deliveryFee || 0,
                    tax: currentCart.tax || 0,
                    totalAmount,

                    coupon: currentCart.coupon || null,

                    paymentMethod: "online",
                    paymentStatus: "pending",
                    orderStatus: "placed",

                    razorpayOrderId: razorpayOrder.id,

                    placedAt: new Date(),
                },
            ],
            { session }
        );

        // Create order items
        const orderItems = currentCartItems.map((item) => ({
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

        await OrderItem.insertMany(orderItems, { session });

        // Create delivery record with OTP
        await createOrderDelivery(
            createdOrder,
            address,
            session
        );

        await session.commitTransaction();

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
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        console.error("Create Online Order Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Unable to create online order",
        });
    } finally {
        await session.endSession();
    }
};

// --------------------------------------------------
// VERIFY ONLINE PAYMENT
// Inventory is NOT changed here.
// Available quantity was already decreased at order creation.
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

        if (order.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({
                success: false,
                message: "Invalid Razorpay order ID",
            });
        }

        if (!/^[a-f0-9]{64}$/i.test(razorpay_signature)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature",
            });
        }

        if (!process.env.RAZORPAY_KEY_SECRET) {
            throw new Error("Razorpay secret key is not configured");
        }

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

        const razorpayPayment = await razorpay.payments.fetch(
            razorpay_payment_id
        );

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

        if (razorpayPayment.status !== "captured") {
            return res.status(409).json({
                success: false,
                message: "Payment has not been captured yet",
                paymentStatus: razorpayPayment.status,
            });
        }

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
// Releases available inventory when unpaid order is cancelled.
// Does not touch the cart.
// --------------------------------------------------

export const cancelOnlineOrder = async (req, res) => {
    const session = await mongoose.startSession();

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

        const razorpayPayments = await razorpay.orders.fetchPayments(
            order.razorpayOrderId
        );

        const payments = razorpayPayments.items || [];

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

        const allPaymentsFailed = payments.every(
            (item) => item.status === "failed"
        );

        if (!allPaymentsFailed) {
            return res.status(409).json({
                success: false,
                message: "Payment status is uncertain. Order has not been deleted.",
            });
        }

        // Start transaction for inventory release and order deletion
        session.startTransaction();

        const orderItems = await OrderItem.find({
            order: order._id,
        }).session(session);

        // RESTORE ONLY AVAILABLE QUANTITY
        await releaseAvailableInventory(
            order.store,
            orderItems,
            session
        );

        // Delete pending Razorpay Payment record
        await Payment.deleteMany({
            order: order._id,
            user: userId,
            paymentGateway: "razorpay",
            status: "pending",
        }).session(session);

        // Delete delivery record and its OTP
        await Delivery.deleteOne({
            order: order._id,
        }).session(session);

        // Delete order items
        await OrderItem.deleteMany({
            order: order._id,
        }).session(session);

        // Delete local order
        await Order.deleteOne({
            _id: order._id,
            user: userId,
        }).session(session);

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Unpaid order cancelled successfully",
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        console.error("Cancel Online Order Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Unable to cancel online order",
        });
    } finally {
        await session.endSession();
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

        const deliveries = await Delivery.find({
            order: { $in: orderIds },
        })
            .select("+deliveryOtp deliveryStatus order")
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

        const deliveryMap = {};

        deliveries.forEach((delivery) => {
            deliveryMap[delivery.order.toString()] = {
                deliveryOtp: delivery.deliveryOtp,
                deliveryStatus: delivery.deliveryStatus,
            };
        });

        const formattedOrders = orders.map((order) => ({
            ...order,
            items: itemsMap[order._id.toString()] || [],
            delivery: deliveryMap[order._id.toString()] || null,
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
            status = "",
        } = req.query;

        const userId = req.user?._id || req.user?.id;
        const roleId = req.user?.role?._id || req.user?.role;

        if (!userId || !roleId) {
            return res.status(401).json({
                success: false,
                message: "User authentication details missing",
            });
        }

        const fetchRole = await Role.findById(roleId).select("name");

        if (!fetchRole) {
            return res.status(403).json({
                success: false,
                message: "Invalid user role",
            });
        }

        const filter = {};

        // SUPER ADMIN: All orders
        if (fetchRole.name === "super_admin") {
            // No additional filter required.
        }

        // DELIVERY PARTNER: Only assigned orders
        else if (fetchRole.name === "delivery_partner") {
            const deliveryPartner = await DeliveryPartner.findOne({
                user: userId,
            }).select("_id");

            if (!deliveryPartner) {
                return res.status(200).json({
                    success: true,
                    orders: [],
                    totalOrders: 0,
                    filteredCount: 0,
                    currentPage: Math.max(1, Number(page) || 1),
                    totalPages: 0,
                });
            }

            filter.deliveryPartner = deliveryPartner._id;
        }

        // MANAGER: Only orders from assigned stores
        else if (fetchRole.name === "manager") {
            const assignedStores = await Store.find({
                manager: userId,
            }).distinct("_id");

            filter.store = {
                $in: assignedStores,
            };
        }

        // OTHER ROLES: All orders
        else {
            // No additional filter required.
        }

        // SEARCH FILTER
        if (search.trim()) {
            const searchRegex = new RegExp(
                search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "i"
            );

            filter.$or = [
                { orderNumber: searchRegex },
            ];
        }

        // STATUS FILTER
        if (status && status !== "all") {
            filter.orderStatus = status;
        }

        // PAGINATION
        const pageNumber = Math.max(1, Number(page) || 1);
        const limitNumber = Math.max(1, Number(limit) || 10);

        const skip = (pageNumber - 1) * limitNumber;

        const [orders, totalOrders] = await Promise.all([
            Order.find(filter)
                .populate({
                    path: "deliveryPartner",
                    select: "user vehicleType vehicleNumber status",
                    populate: {
                        path: "user",
                        select: "firstName lastName email phone",
                    },
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber),

            Order.countDocuments(filter),
        ]);

        console.log("Logged-in role:", fetchRole.name);
        console.log("Orders found:", totalOrders);

        return res.status(200).json({
            success: true,
            orders,
            totalOrders,
            filteredCount: totalOrders,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalOrders / limitNumber),
        });

    } catch (error) {
        console.error("Get All Orders Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
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

// --------------------------------------------------
// ASSIGN DELIVERY PARTNER TO ORDER
// --------------------------------------------------

export const assignDeliveryPartner = async (req, res) => {
    let reservedPartner = null;

    try {
        const { orderId, deliveryPartnerId } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(orderId) ||
            !mongoose.Types.ObjectId.isValid(deliveryPartnerId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid order or delivery partner ID.",
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        if (["delivered", "cancelled"].includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: "Delivery partner cannot be assigned to this order.",
            });
        }

        const selectedPartner = await DeliveryPartner.findById(
            deliveryPartnerId
        ).populate("user", "firstName lastName email phone");

        if (!selectedPartner || !selectedPartner.user) {
            return res.status(404).json({
                success: false,
                message: "Delivery partner not found.",
            });
        }

        if (
            order.deliveryPartner &&
            order.deliveryPartner.toString() ===
            selectedPartner._id.toString()
        ) {
            return res.status(200).json({
                success: true,
                message: "This delivery partner is already assigned.",
                order,
                deliveryPartner: selectedPartner,
            });
        }

        reservedPartner = await DeliveryPartner.findOneAndUpdate(
            {
                _id: deliveryPartnerId,
                status: "active",
                isOnline: true,
                isAvailable: true,
            },
            {
                $set: {
                    isAvailable: false,
                },
            },
            {
                new: true,
            }
        ).populate("user", "firstName lastName email phone");

        if (!reservedPartner || !reservedPartner.user) {
            return res.status(409).json({
                success: false,
                message: "This delivery partner is no longer available.",
            });
        }

        const delivery = await Delivery.findOne({
            order: order._id,
        });

        if (!delivery) {
            throw new Error("Delivery record not found for this order.");
        }

        const previousPartnerId = order.deliveryPartner;

        order.deliveryPartner = reservedPartner._id;
        await order.save();

        delivery.deliveryPartner = reservedPartner._id;
        await delivery.save();

        if (
            previousPartnerId &&
            previousPartnerId.toString() !== reservedPartner._id.toString()
        ) {
            await DeliveryPartner.updateOne(
                {
                    _id: previousPartnerId,
                },
                {
                    $set: {
                        isAvailable: true,
                    },
                }
            );
        }

        const updatedOrder = await Order.findById(orderId)
            .populate("user", "firstName lastName email phone")
            .populate("address")
            .populate("store", "name code")
            .populate({
                path: "deliveryPartner",
                populate: {
                    path: "user",
                    select: "firstName lastName email phone",
                },
            });

        return res.status(200).json({
            success: true,
            message: "Delivery partner assigned successfully.",
            order: updatedOrder,
            deliveryPartner: reservedPartner,
        });
    } catch (error) {
        if (reservedPartner) {
            await DeliveryPartner.updateOne(
                {
                    _id: reservedPartner._id,
                },
                {
                    $set: {
                        isAvailable: true,
                    },
                }
            ).catch((releaseError) => {
                console.error("Partner Release Error:", releaseError);
            });
        }

        console.error("Assign Delivery Partner Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to assign delivery partner.",
        });
    }
};

// --------------------------------------------------
// VERIFY DELIVERY OTP
// --------------------------------------------------


export const verifyDeliveryOtp = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const userId = req.user.id;
        const { orderId, otp } = req.body;

        // VALIDATE INPUT
        if (
            !orderId ||
            !mongoose.Types.ObjectId.isValid(orderId) ||
            !/^\d{4}$/.test(String(otp || ""))
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid order ID and 4-digit OTP are required",
            });
        }

        // FIND DELIVERY PARTNER
        const deliveryPartner = await DeliveryPartner.findOne({
            user: userId,
        }).select("_id");

        if (!deliveryPartner) {
            return res.status(403).json({
                success: false,
                message: "Delivery partner profile not found",
            });
        }

        // START TRANSACTION
        session.startTransaction();

        // FIND ASSIGNED DELIVERY
        const delivery = await Delivery.findOne({
            order: orderId,
            deliveryPartner: deliveryPartner._id,
            deliveryStatus: "assigned",
        })
            .select("+deliveryOtp")
            .session(session);

        if (!delivery) {
            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "Assigned delivery not found or already completed",
            });
        }

        // VERIFY OTP
        const savedOtp = String(delivery.deliveryOtp || "");
        const enteredOtp = String(otp);

        const savedBuffer = Buffer.from(savedOtp);
        const enteredBuffer = Buffer.from(enteredOtp);

        const isOtpValid =
            savedBuffer.length === enteredBuffer.length &&
            crypto.timingSafeEqual(savedBuffer, enteredBuffer);

        if (!isOtpValid) {
            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "Invalid delivery OTP",
            });
        }

        // FIND ORDER
        const order = await Order.findOne({
            _id: orderId,
            deliveryPartner: deliveryPartner._id,
        }).session(session);

        if (!order) {
            throw new Error("Order not found or not assigned to you");
        }

        if (["delivered", "cancelled"].includes(order.orderStatus)) {
            await session.abortTransaction();

            return res.status(409).json({
                success: false,
                message: "This order is already completed or cancelled",
            });
        }

        const deliveredAt = new Date();

        const paymentMethod = String(
            order.paymentMethod || ""
        ).toLowerCase();

        let updatedPayment = null;

        // UPDATE DELIVERY
        delivery.deliveryStatus = "delivered";
        delivery.deliveredAt = deliveredAt;
        delivery.deliveryOtp = undefined;

        await delivery.save({ session });

        // UPDATE ORDER
        order.orderStatus = "delivered";
        order.deliveredAt = deliveredAt;

        // COD PAYMENT HANDLING
        if (paymentMethod === "cod") {
            order.paymentStatus = "paid";

            // UPDATE OR CREATE PAYMENT RECORD
            updatedPayment = await Payment.findOneAndUpdate(
                {
                    order: order._id,
                },
                {
                    $set: {
                        status: "success",
                        paidAt: deliveredAt,
                        paymentGateway: "cod",
                        method: "cod",
                        amount: order.totalAmount,
                    },
                    $setOnInsert: {
                        order: order._id,
                        user: order.user,
                        currency: "INR",
                    },
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true,
                    setDefaultsOnInsert: true,
                    session,
                }
            );
        }

        await order.save({ session });

        // MAKE DELIVERY PARTNER AVAILABLE AGAIN
        await DeliveryPartner.updateOne(
            {
                _id: deliveryPartner._id,
            },
            {
                $set: {
                    isAvailable: true,
                },
            },
            { session }
        );

        // COMMIT TRANSACTION
        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Delivery verified successfully",

            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                orderStatus: order.orderStatus,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                deliveredAt: order.deliveredAt,
            },

            delivery: {
                deliveryStatus: delivery.deliveryStatus,
                deliveredAt: delivery.deliveredAt,
            },

            payment: updatedPayment
                ? {
                    status: updatedPayment.status,
                    paidAt: updatedPayment.paidAt,
                    amount: updatedPayment.amount,
                }
                : null,
        });

    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        console.error("Verify Delivery OTP Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "OTP verification failed",
        });

    } finally {
        await session.endSession();
    }
};
