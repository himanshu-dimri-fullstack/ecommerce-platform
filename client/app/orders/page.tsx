
"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { API } from "@/axios/axios";
import toast from "react-hot-toast";

import {
    FiPackage,
    FiTruck,
    FiCheckCircle,
    FiClock,
    FiMapPin,
    FiCreditCard,
    FiChevronDown,
    FiChevronUp,
    FiShoppingBag,
    FiArrowLeft,
    FiXCircle,
    FiRefreshCw,
    FiCalendar,
    FiHash,
} from "react-icons/fi";

interface OrderAddress {
    type: string;
    houseNumber: string;
    street: string;
    landmark?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
}

interface OrderItem {
    _id: string;
    product?: {
        _id: string;
        name?: string;
        image?: {
            url?: string;
        } | string;
    } | null;
    variant?: {
        _id: string;
        name?: string;
        variantName?: string;
        sku?: string;
    } | null;
    productName: string;
    variantName?: string;
    sku?: string;
    quantity: number;
    price: number;
    discount: number;
    tax: number;
    totalPrice: number;
}

interface Order {
    _id: string;
    orderNumber: string;
    subtotal: number;
    discount: number;
    deliveryFee: number;
    tax: number;
    totalAmount: number;
    paymentMethod: "cod" | "online";
    paymentStatus: string;
    orderStatus: string;
    estimatedDeliveryTime?: string;
    placedAt?: string;
    confirmedAt?: string;
    deliveredAt?: string;
    cancelledAt?: string;
    cancellationReason?: string;
    address?: OrderAddress;
    items?: OrderItem[];
    createdAt: string;
}

const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(price || 0));

const formatDate = (date?: string) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const formatDateTime = (date?: string) => {
    if (!date) return "Pending";

    return new Date(date).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
};

const statusConfig: Record<
    string,
    { label: string; color: string; icon: typeof FiPackage }
> = {
    placed: {
        label: "Order Placed",
        color: "bg-blue-50 text-blue-700",
        icon: FiPackage,
    },
    confirmed: {
        label: "Confirmed",
        color: "bg-indigo-50 text-indigo-700",
        icon: FiCheckCircle,
    },
    processing: {
        label: "Processing",
        color: "bg-yellow-50 text-yellow-700",
        icon: FiRefreshCw,
    },
    packed: {
        label: "Packed",
        color: "bg-purple-50 text-purple-700",
        icon: FiPackage,
    },
    shipped: {
        label: "Shipped",
        color: "bg-cyan-50 text-cyan-700",
        icon: FiTruck,
    },
    out_for_delivery: {
        label: "Out for Delivery",
        color: "bg-orange-50 text-orange-700",
        icon: FiTruck,
    },
    delivered: {
        label: "Delivered",
        color: "bg-green-50 text-green-700",
        icon: FiCheckCircle,
    },
    cancelled: {
        label: "Cancelled",
        color: "bg-red-50 text-red-700",
        icon: FiXCircle,
    },
};

const orderSteps = [
    "placed",
    "confirmed",
    "processing",
    "packed",
    "shipped",
    "out_for_delivery",
    "delivered",
];

const getImageUrl = (
    image?: string | { url?: string }
): string => {
    if (!image) return "";

    if (typeof image === "string") {
        return image;
    }

    return image.url || "";
};

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [filter, setFilter] = useState("all");

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);

            const { data } = await API.get("/order/my-orders", {
                withCredentials: true,
            });

            if (data.success) {
                setOrders(data.orders || []);
            } else {
                toast.error(data.message || "Unable to fetch orders");
            }
        } catch (error: unknown) {
            const message = (
                error as {
                    response?: {
                        data?: {
                            message?: string;
                        };
                    };
                }
            )?.response?.data?.message;

            toast.error(message || "Unable to fetch your orders");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const filteredOrders =
        filter === "all"
            ? orders
            : orders.filter((order) => order.orderStatus === filter);

    const getStatus = (status: string) =>
        statusConfig[status] || {
            label: status.replaceAll("_", " "),
            color: "bg-gray-100 text-gray-700",
            icon: FiPackage,
        };

    const toggleOrder = (id: string) => {
        setExpandedOrder((prev) => prev === id ? null : id);
    };

    const getTimelineDate = (order: Order, step: string) => {
        const dateMap: Record<string, string | undefined> = {
            placed: order.placedAt || order.createdAt,
            confirmed: order.confirmedAt,
            delivered: order.deliveredAt,
        };

        return dateMap[step];
    };

    // LOADING
    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7f8f7] px-4 py-10">
                <div className="mx-auto max-w-6xl animate-pulse space-y-6">
                    <div className="h-10 w-52 rounded-lg bg-gray-200" />

                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-64 rounded-2xl bg-white"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f7f8f7] pb-16">

            {/* HEADER */}
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">

                    <Link
                        href="/"
                        className="text-2xl font-black tracking-tight text-[#0c831f]"
                    >
                        QUICK KART
                    </Link>

                    <Link
                        href="/"
                        className="text-sm font-semibold text-gray-600 hover:text-[#0c831f]"
                    >
                        Continue Shopping
                    </Link>

                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">

                {/* PAGE HEADING */}
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">

                    <div>
                        <Link
                            href="/"
                            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0c831f]"
                        >
                            <FiArrowLeft />
                            Back to Home
                        </Link>

                        <h1 className="text-3xl font-extrabold text-gray-900">
                            My Orders
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Track and manage all your purchases.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchOrders}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-[#0c831f] hover:text-[#0c831f]"
                    >
                        <FiRefreshCw />
                        Refresh Orders
                    </button>

                </div>

                {/* ORDER STATS */}
                <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">

                    <div className="rounded-2xl border border-gray-200 bg-white p-5">
                        <FiShoppingBag className="mb-3 text-xl text-[#0c831f]" />
                        <p className="text-2xl font-extrabold text-gray-900">
                            {orders.length}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Total Orders
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5">
                        <FiClock className="mb-3 text-xl text-yellow-600" />
                        <p className="text-2xl font-extrabold text-gray-900">
                            {orders.filter((o) =>
                                !["delivered", "cancelled"].includes(o.orderStatus)
                            ).length}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Active Orders
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5">
                        <FiCheckCircle className="mb-3 text-xl text-green-600" />
                        <p className="text-2xl font-extrabold text-gray-900">
                            {orders.filter((o) => o.orderStatus === "delivered").length}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Delivered
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5">
                        <FiXCircle className="mb-3 text-xl text-red-500" />
                        <p className="text-2xl font-extrabold text-gray-900">
                            {orders.filter((o) => o.orderStatus === "cancelled").length}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Cancelled
                        </p>
                    </div>

                </div>

                {/* FILTERS */}
                <div className="mb-6 flex gap-2 overflow-x-auto pb-2">

                    {[
                        { value: "all", label: "All Orders" },
                        { value: "placed", label: "Placed" },
                        { value: "processing", label: "Processing" },
                        { value: "shipped", label: "Shipped" },
                        { value: "delivered", label: "Delivered" },
                        { value: "cancelled", label: "Cancelled" },
                    ].map((item) => (

                        <button
                            key={item.value}
                            type="button"
                            onClick={() => setFilter(item.value)}
                            className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition ${filter === item.value
                                    ? "bg-[#0c831f] text-white"
                                    : "border border-gray-200 bg-white text-gray-600 hover:border-[#0c831f] hover:text-[#0c831f]"
                                }`}
                        >
                            {item.label}
                        </button>

                    ))}

                </div>

                {/* EMPTY STATE */}
                {filteredOrders.length === 0 ? (

                    <div className="rounded-2xl border border-gray-200 bg-white px-5 py-16 text-center">

                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
                            <FiPackage size={36} className="text-[#0c831f]" />
                        </div>

                        <h2 className="mt-6 text-xl font-extrabold text-gray-900">
                            {orders.length === 0
                                ? "No orders yet"
                                : "No orders found"}
                        </h2>

                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                            {orders.length === 0
                                ? "You haven't placed any orders yet. Start shopping and your orders will appear here."
                                : "There are no orders matching this status."}
                        </p>

                        {orders.length === 0 && (
                            <Link
                                href="/"
                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0c831f] px-6 py-3 font-bold text-white transition hover:bg-[#096b19]"
                            >
                                <FiShoppingBag />
                                Start Shopping
                            </Link>
                        )}

                    </div>

                ) : (

                    <div className="space-y-6">

                        {filteredOrders.map((order) => {

                            const status = getStatus(order.orderStatus);
                            const StatusIcon = status.icon;
                            const isExpanded = expandedOrder === order._id;
                            const items = order.items || [];
                            const currentStep = orderSteps.indexOf(order.orderStatus);
                            const isCancelled = order.orderStatus === "cancelled";

                            return (

                                <article
                                    key={order._id}
                                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                                >

                                    {/* ORDER HEADER */}
                                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 p-5 sm:px-7">

                                        <div className="flex flex-wrap items-center gap-4">

                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-[#0c831f]">
                                                <FiPackage size={23} />
                                            </div>

                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="font-extrabold text-gray-900">
                                                        {order.orderNumber}
                                                    </h2>

                                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${status.color}`}>
                                                        <StatusIcon size={13} />
                                                        {status.label}
                                                    </span>
                                                </div>

                                                <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                                                    <FiCalendar size={13} />
                                                    Ordered on {formatDate(order.placedAt || order.createdAt)}
                                                </p>
                                            </div>

                                        </div>

                                        <div className="text-left sm:text-right">
                                            <p className="text-xs font-medium text-gray-500">
                                                Total Amount
                                            </p>
                                            <p className="mt-1 text-xl font-extrabold text-[#0c831f]">
                                                {formatPrice(order.totalAmount)}
                                            </p>
                                        </div>

                                    </div>

                                    {/* ORDER OVERVIEW */}
                                    <div className="grid gap-5 p-5 sm:grid-cols-3 sm:px-7">

                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Items
                                            </p>
                                            <p className="mt-2 font-bold text-gray-800">
                                                {items.reduce(
                                                    (total, item) => total + item.quantity,
                                                    0
                                                )} Products
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Payment Method
                                            </p>
                                            <p className="mt-2 font-bold capitalize text-gray-800">
                                                {order.paymentMethod === "cod"
                                                    ? "Cash on Delivery"
                                                    : order.paymentMethod}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Payment Status
                                            </p>
                                            <p className={`mt-2 font-bold capitalize ${order.paymentStatus === "paid"
                                                    ? "text-green-600"
                                                    : order.paymentStatus === "failed"
                                                        ? "text-red-600"
                                                        : "text-yellow-600"
                                                }`}>
                                                {order.paymentStatus}
                                            </p>
                                        </div>

                                    </div>

                                    {/* PRODUCT PREVIEW */}
                                    <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 px-5 py-4 sm:px-7">

                                        <div className="flex flex-1 items-center gap-2 overflow-hidden">

                                            {items.slice(0, 4).map((item) => {
                                                const imageUrl = getImageUrl(item.product?.image);

                                                return (
                                                    <div
                                                        key={item._id}
                                                        className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50"
                                                    >
                                                        {imageUrl && (
                                                            <Image
                                                                src={imageUrl}
                                                                alt={item.productName}
                                                                fill
                                                                sizes="56px"
                                                                className="object-contain p-1"
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {items.length > 4 && (
                                                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm font-bold text-gray-600">
                                                    +{items.length - 4}
                                                </span>
                                            )}

                                            <p className="ml-2 line-clamp-1 text-sm text-gray-500">
                                                {items.map((item) => item.productName).join(", ")}
                                            </p>

                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => toggleOrder(order._id)}
                                            className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:border-[#0c831f] hover:text-[#0c831f]"
                                        >
                                            {isExpanded ? "Hide Details" : "View Details"}
                                            {isExpanded
                                                ? <FiChevronUp />
                                                : <FiChevronDown />}
                                        </button>

                                    </div>

                                    {/* EXPANDED DETAILS */}
                                    {isExpanded && (

                                        <div className="space-y-7 border-t border-gray-100 bg-gray-50/70 p-5 sm:p-7">

                                            {/* STATUS TIMELINE */}
                                            <section>
                                                <h3 className="mb-5 flex items-center gap-2 font-extrabold text-gray-900">
                                                    <FiTruck className="text-[#0c831f]" />
                                                    Order Tracking
                                                </h3>

                                                {isCancelled ? (

                                                    <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                                                        <div className="flex items-center gap-2 font-bold text-red-700">
                                                            <FiXCircle />
                                                            Order Cancelled
                                                        </div>

                                                        <p className="mt-2 text-sm text-red-600">
                                                            {order.cancellationReason || "This order has been cancelled."}
                                                        </p>

                                                        <p className="mt-2 text-xs text-red-500">
                                                            {formatDateTime(order.cancelledAt)}
                                                        </p>
                                                    </div>

                                                ) : (

                                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">

                                                        {orderSteps.map((step, index) => {

                                                            const completed = currentStep >= index;
                                                            const stepStatus = getStatus(step);
                                                            const StepIcon = stepStatus.icon;

                                                            return (
                                                                <div
                                                                    key={step}
                                                                    className="relative"
                                                                >
                                                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${completed
                                                                            ? "bg-[#0c831f] text-white"
                                                                            : "bg-gray-200 text-gray-400"
                                                                        }`}>
                                                                        <StepIcon size={18} />
                                                                    </div>

                                                                    <p className={`mt-2 text-xs font-bold capitalize ${completed
                                                                            ? "text-[#0c831f]"
                                                                            : "text-gray-400"
                                                                        }`}>
                                                                        {step.replaceAll("_", " ")}
                                                                    </p>

                                                                    {getTimelineDate(order, step) && (
                                                                        <p className="mt-1 text-[10px] text-gray-500">
                                                                            {formatDate(getTimelineDate(order, step))}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}

                                                    </div>

                                                )}
                                            </section>

                                            {/* PRODUCTS */}
                                            <section>
                                                <h3 className="mb-4 flex items-center gap-2 font-extrabold text-gray-900">
                                                    <FiShoppingBag className="text-[#0c831f]" />
                                                    Ordered Items ({items.length})
                                                </h3>

                                                <div className="space-y-3">

                                                    {items.map((item) => {

                                                        const imageUrl = getImageUrl(item.product?.image);

                                                        return (
                                                            <div
                                                                key={item._id}
                                                                className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-100 bg-white p-4"
                                                            >

                                                                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                                                                    {imageUrl && (
                                                                        <Image
                                                                            src={imageUrl}
                                                                            alt={item.productName}
                                                                            fill
                                                                            sizes="80px"
                                                                            className="object-contain p-2"
                                                                        />
                                                                    )}
                                                                </div>

                                                                <div className="min-w-0 flex-1">
                                                                    <h4 className="font-bold text-gray-900">
                                                                        {item.productName}
                                                                    </h4>

                                                                    {item.variantName && (
                                                                        <p className="mt-1 text-sm text-gray-500">
                                                                            Variant: {item.variantName}
                                                                        </p>
                                                                    )}

                                                                    {item.sku && (
                                                                        <p className="mt-1 text-xs text-gray-400">
                                                                            SKU: {item.sku}
                                                                        </p>
                                                                    )}

                                                                    <p className="mt-2 text-sm text-gray-500">
                                                                        {formatPrice(item.price)} × {item.quantity}
                                                                    </p>
                                                                </div>

                                                                <div className="text-right">
                                                                    <p className="text-xs text-gray-500">
                                                                        Item Total
                                                                    </p>
                                                                    <p className="mt-1 font-extrabold text-gray-900">
                                                                        {formatPrice(item.totalPrice)}
                                                                    </p>
                                                                </div>

                                                            </div>
                                                        );
                                                    })}

                                                </div>
                                            </section>

                                            {/* ADDRESS + PAYMENT */}
                                            <div className="grid gap-5 md:grid-cols-2">

                                                <section className="rounded-xl border border-gray-100 bg-white p-5">

                                                    <h3 className="mb-4 flex items-center gap-2 font-extrabold text-gray-900">
                                                        <FiMapPin className="text-[#0c831f]" />
                                                        Delivery Address
                                                    </h3>

                                                    {order.address ? (
                                                        <>
                                                            <p className="font-bold capitalize text-gray-800">
                                                                {order.address.type}
                                                            </p>

                                                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                                                {order.address.houseNumber}, {order.address.street}
                                                                {order.address.landmark && `, Near ${order.address.landmark}`}
                                                            </p>

                                                            <p className="text-sm leading-6 text-gray-600">
                                                                {order.address.city}, {order.address.state} - {order.address.pincode}
                                                            </p>

                                                            <p className="text-sm text-gray-600">
                                                                {order.address.country}
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <p className="text-sm text-gray-500">
                                                            Address details unavailable.
                                                        </p>
                                                    )}

                                                </section>

                                                <section className="rounded-xl border border-gray-100 bg-white p-5">

                                                    <h3 className="mb-4 flex items-center gap-2 font-extrabold text-gray-900">
                                                        <FiCreditCard className="text-[#0c831f]" />
                                                        Payment Details
                                                    </h3>

                                                    <div className="space-y-3 text-sm">

                                                        <div className="flex justify-between gap-3">
                                                            <span className="text-gray-500">Method</span>
                                                            <span className="font-bold capitalize text-gray-800">
                                                                {order.paymentMethod === "cod"
                                                                    ? "Cash on Delivery"
                                                                    : order.paymentMethod}
                                                            </span>
                                                        </div>

                                                        <div className="flex justify-between gap-3">
                                                            <span className="text-gray-500">Payment Status</span>
                                                            <span className="font-bold capitalize text-gray-800">
                                                                {order.paymentStatus}
                                                            </span>
                                                        </div>

                                                        <div className="flex justify-between gap-3">
                                                            <span className="text-gray-500">Order ID</span>
                                                            <span className="max-w-36 truncate font-semibold text-gray-800">
                                                                {order._id}
                                                            </span>
                                                        </div>

                                                    </div>

                                                </section>

                                            </div>

                                            {/* PRICE BREAKDOWN */}
                                            <section className="rounded-xl border border-gray-100 bg-white p-5">

                                                <h3 className="mb-4 font-extrabold text-gray-900">
                                                    Price Breakdown
                                                </h3>

                                                <div className="ml-auto max-w-md space-y-3 text-sm">

                                                    <div className="flex justify-between text-gray-600">
                                                        <span>Subtotal</span>
                                                        <span className="font-semibold text-gray-900">
                                                            {formatPrice(order.subtotal)}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between text-gray-600">
                                                        <span>Discount</span>
                                                        <span className="font-semibold text-green-600">
                                                            - {formatPrice(order.discount)}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between text-gray-600">
                                                        <span>Delivery Fee</span>
                                                        <span className="font-semibold text-gray-900">
                                                            {order.deliveryFee === 0
                                                                ? "FREE"
                                                                : formatPrice(order.deliveryFee)}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between text-gray-600">
                                                        <span>Tax</span>
                                                        <span className="font-semibold text-gray-900">
                                                            {formatPrice(order.tax)}
                                                        </span>
                                                    </div>

                                                    <div className="border-t border-dashed border-gray-200 pt-4">
                                                        <div className="flex justify-between">
                                                            <span className="font-extrabold text-gray-900">
                                                                Total Amount
                                                            </span>
                                                            <span className="text-xl font-extrabold text-[#0c831f]">
                                                                {formatPrice(order.totalAmount)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                </div>

                                            </section>

                                        </div>

                                    )}

                                </article>

                            );
                        })}

                    </div>

                )}

            </main>

        </div>
    );
}
