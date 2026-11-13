
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
    FiShield,
    FiX,
    FiStar,
    FiEdit2,
    FiTrash2,
    FiAlertTriangle,
} from "react-icons/fi";

// =====================================
// INTERFACES
// =====================================

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

interface OrderDelivery {
    deliveryOtp?: string | null;
    deliveryStatus?: string;
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
    delivery?: OrderDelivery | null;
    createdAt: string;
}

interface ProductReview {
    _id: string;
    rating: number;
    comment: string;
    createdAt?: string;
    updatedAt?: string;
}

interface ReviewProduct {
    _id: string;
    name: string;
    slug?: string;
    images: {
        url?: string;
    }[];
    rating: number;
    totalReviews: number;
    orderId: string;
    orderNumber: string;
    review?: ProductReview | null;
}

interface MyReviewAPI {
    _id: string;
    rating: number;
    comment: string;
    createdAt?: string;
    updatedAt?: string;
    product: {
        _id: string;
        name: string;
        slug?: string;
        images?: {
            url?: string;
        }[];
        rating: number;
        totalReviews: number;
    };
    order?: {
        _id: string;
        orderNumber?: string;
        deliveredAt?: string;
    } | null;
}

// =====================================
// HELPERS
// =====================================

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

const getImageUrl = (
    image?: string | { url?: string }
): string => {
    if (!image) return "";

    if (typeof image === "string") {
        return image;
    }

    return image.url || "";
};

// =====================================
// STATUS CONFIG
// =====================================

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

// =====================================
// COMPONENT
// =====================================

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [filter, setFilter] = useState("all");

    // =====================================
    // REVIEW STATES
    // =====================================

    const [reviewProducts, setReviewProducts] = useState<ReviewProduct[]>([]);

    const [selectedReviewProduct, setSelectedReviewProduct] =
        useState<ReviewProduct | null>(null);

    const [reviewMode, setReviewMode] = useState<"add" | "edit">("add");

    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");

    const [submittingReview, setSubmittingReview] = useState(false);

    // DELETE REVIEW MODAL STATES

    const [showDeleteReviewModal, setShowDeleteReviewModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<ReviewProduct | null>(null);
    const [deletingReview, setDeletingReview] = useState(false);

    // =====================================
    // FETCH ORDERS
    // =====================================

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

    // =====================================
    // FETCH ELIGIBLE + MY REVIEWS
    // =====================================

    const fetchReviewProducts = useCallback(async () => {
        try {
            const [eligibleResponse, myReviewsResponse] = await Promise.all([
                API.get("/review/eligible-products", {
                    withCredentials: true,
                }),

                API.get("/review/my-reviews", {
                    withCredentials: true,
                }),
            ]);

            const eligibleData = eligibleResponse.data;
            const myReviewsData = myReviewsResponse.data;

            const eligibleProducts: ReviewProduct[] =
                eligibleData.success
                    ? eligibleData.products || []
                    : [];

            const myReviews: MyReviewAPI[] =
                myReviewsData.success
                    ? myReviewsData.reviews || []
                    : [];

            // =====================================
            // MERGE REVIEWED + NON-REVIEWED PRODUCTS
            // =====================================

            const productMap = new Map<string, ReviewProduct>();

            // First add products which are eligible for reviewing.
            eligibleProducts.forEach((product) => {
                productMap.set(product._id, {
                    ...product,
                    review: null,
                });
            });

            // Then add already reviewed products.
            myReviews.forEach((review) => {
                if (!review.product?._id) return;

                const productId = review.product._id;

                const existingProduct = productMap.get(productId);

                const orderId =
                    review.order?._id ||
                    existingProduct?.orderId ||
                    "";

                const orderNumber =
                    review.order?.orderNumber ||
                    existingProduct?.orderNumber ||
                    "";

                productMap.set(productId, {
                    _id: productId,
                    name: review.product.name,
                    slug: review.product.slug,
                    images: review.product.images || [],
                    rating: review.product.rating || 0,
                    totalReviews: review.product.totalReviews || 0,
                    orderId,
                    orderNumber,
                    review: {
                        _id: review._id,
                        rating: review.rating,
                        comment: review.comment,
                        createdAt: review.createdAt,
                        updatedAt: review.updatedAt,
                    },
                });
            });

            setReviewProducts(Array.from(productMap.values()));
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

            toast.error(message || "Unable to fetch review products");
        }
    }, []);

    // =====================================
    // REFRESH REVIEW DATA
    // =====================================

    const refreshReviewData = useCallback(async () => {
        await fetchReviewProducts();
    }, [fetchReviewProducts]);

    // =====================================
    // INITIAL FETCH
    // =====================================

    useEffect(() => {
        fetchOrders();
        refreshReviewData();
    }, [fetchOrders, refreshReviewData]);

    // =====================================
    // GET PRODUCTS FOR AN ORDER
    // =====================================

    const getProductsForOrder = (orderId: string) => {
        return reviewProducts.filter(
            (product) => product.orderId === orderId
        );
    };

    // =====================================
    // OPEN ADD REVIEW MODAL
    // =====================================

    const openAddReview = (product: ReviewProduct) => {
        setSelectedReviewProduct(product);
        setReviewMode("add");
        setReviewRating(5);
        setReviewComment("");
    };

    // =====================================
    // OPEN EDIT REVIEW MODAL
    // =====================================

    const openEditReview = (product: ReviewProduct) => {
        if (!product.review) return;

        setSelectedReviewProduct(product);
        setReviewMode("edit");
        setReviewRating(product.review.rating);
        setReviewComment(product.review.comment || "");
    };

    // =====================================
    // CLOSE REVIEW MODAL
    // =====================================

    const closeReviewModal = () => {
        if (submittingReview) return;

        setSelectedReviewProduct(null);
        setReviewMode("add");
        setReviewRating(5);
        setReviewComment("");
    };

    // =====================================
    // SUBMIT / UPDATE REVIEW
    // =====================================

    const handleSubmitReview = async () => {
        if (!selectedReviewProduct) return;

        if (reviewRating < 1 || reviewRating > 5) {
            toast.error("Please select a valid rating");
            return;
        }

        try {
            setSubmittingReview(true);

            let response;

            if (reviewMode === "edit") {
                if (!selectedReviewProduct.review?._id) {
                    toast.error("Review not found");
                    return;
                }

                response = await API.patch(
                    `/review/update/${selectedReviewProduct.review._id}`,
                    {
                        rating: reviewRating,
                        comment: reviewComment.trim(),
                    },
                    {
                        withCredentials: true,
                    }
                );
            } else {
                response = await API.post(
                    "/review/add",
                    {
                        productId: selectedReviewProduct._id,
                        orderId: selectedReviewProduct.orderId,
                        rating: reviewRating,
                        comment: reviewComment.trim(),
                    },
                    {
                        withCredentials: true,
                    }
                );
            }

            const data = response.data;

            if (data.success) {
                toast.success(
                    data.message ||
                    (reviewMode === "edit"
                        ? "Review updated successfully"
                        : "Review submitted successfully")
                );

                setSelectedReviewProduct(null);
                setReviewMode("add");
                setReviewRating(5);
                setReviewComment("");

                await refreshReviewData();
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

            toast.error(
                message ||
                (reviewMode === "edit"
                    ? "Unable to update review"
                    : "Unable to submit review")
            );
        } finally {
            setSubmittingReview(false);
        }
    };

    // =====================================
    // OPEN DELETE REVIEW MODAL
    // =====================================

    const openDeleteReviewModal = (product: ReviewProduct) => {
        if (!product.review?._id) return;

        setReviewToDelete(product);
        setShowDeleteReviewModal(true);
    };

    // =====================================
    // CLOSE DELETE REVIEW MODAL
    // =====================================

    const closeDeleteReviewModal = () => {
        if (deletingReview) return;

        setShowDeleteReviewModal(false);
        setReviewToDelete(null);
    };

    // =====================================
    // DELETE REVIEW
    // =====================================

    const handleDeleteReview = async () => {
        if (!reviewToDelete?.review?._id) return;

        try {
            setDeletingReview(true);

            const { data } = await API.delete(
                `/review/delete/${reviewToDelete.review._id}`,
                {
                    withCredentials: true,
                }
            );

            if (data.success) {
                toast.success(data.message || "Review deleted successfully");

                setShowDeleteReviewModal(false);
                setReviewToDelete(null);

                await refreshReviewData();
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

            toast.error(message || "Unable to delete review");
        } finally {
            setDeletingReview(false);
        }
    };

    // =====================================
    // FILTER ORDERS
    // =====================================

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

    // =====================================
    // LOADING
    // =====================================

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
                        onClick={() => {
                            fetchOrders();
                            refreshReviewData();
                        }}
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

                            const isCancelled = order.orderStatus === "cancelled";
                            const isDelivered = order.orderStatus === "delivered";

                            const deliveryOtp = order.delivery?.deliveryOtp;

                            const canShowOtp =
                                Boolean(deliveryOtp) &&
                                !["delivered", "cancelled"].includes(order.orderStatus);

                            const productsForOrder = getProductsForOrder(order._id);

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
                                            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                        </button>
                                    </div>

                                    {/* EXPANDED DETAILS */}
                                    {isExpanded && (
                                        <div className="space-y-7 border-t border-gray-100 bg-gray-50/70 p-5 sm:p-7">

                                            {/* ORDER TRACKING / RATE & REVIEW */}
                                            {isDelivered ? (

                                                <section>
                                                    <div className="mb-5">
                                                        <h3 className="flex items-center gap-2 font-extrabold text-gray-900">
                                                            <FiStar className="text-yellow-500" />
                                                            Rate & Review
                                                        </h3>

                                                        <p className="mt-1 text-sm text-gray-500">
                                                            Your order has been delivered. Share your experience with these products.
                                                        </p>
                                                    </div>

                                                    {productsForOrder.length > 0 ? (

                                                        <div className="space-y-3">
                                                            {productsForOrder.map((product) => {

                                                                const imageUrl = product.images?.[0]?.url || "";
                                                                const hasReviewed = Boolean(product.review);

                                                                return (
                                                                    <div
                                                                        key={product._id}
                                                                        className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4"
                                                                    >

                                                                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                                                                            {imageUrl && (
                                                                                <Image
                                                                                    src={imageUrl}
                                                                                    alt={product.name}
                                                                                    fill
                                                                                    sizes="80px"
                                                                                    className="object-contain p-2"
                                                                                />
                                                                            )}
                                                                        </div>

                                                                        <div className="min-w-0 flex-1">
                                                                            <h4 className="font-bold text-gray-900">
                                                                                {product.name}
                                                                            </h4>

                                                                            <p className="mt-1 text-sm text-gray-500">
                                                                                {Number(product.rating || 0).toFixed(1)} ★ ({product.totalReviews || 0} reviews)
                                                                            </p>

                                                                            <p className="mt-1 text-xs text-green-700">
                                                                                <FiCheckCircle className="mr-1 inline" />
                                                                                Verified Purchase
                                                                            </p>

                                                                            {hasReviewed && (
                                                                                <div className="mt-3 rounded-lg bg-yellow-50 p-3">
                                                                                    <div className="flex items-center gap-1">
                                                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                                                            <FiStar
                                                                                                key={star}
                                                                                                size={14}
                                                                                                className={
                                                                                                    star <= (product.review?.rating || 0)
                                                                                                        ? "fill-yellow-400 text-yellow-400"
                                                                                                        : "text-gray-300"
                                                                                                }
                                                                                            />
                                                                                        ))}

                                                                                        <span className="ml-2 text-xs font-bold text-gray-700">
                                                                                            {product.review?.rating}/5
                                                                                        </span>
                                                                                    </div>

                                                                                    {product.review?.comment && (
                                                                                        <p className="mt-2 wrap-break-words text-sm leading-6 text-gray-700">
                                                                                            {product.review.comment}
                                                                                        </p>
                                                                                    )}

                                                                                    <p className="mt-2 text-[11px] text-gray-400">
                                                                                        Reviewed on {formatDate(product.review?.createdAt)}
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {hasReviewed ? (

                                                                            <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:flex-col">

                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openEditReview(product)}
                                                                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100 sm:flex-none"
                                                                                >
                                                                                    <FiEdit2 />
                                                                                    Edit
                                                                                </button>

                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openDeleteReviewModal(product)}
                                                                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100 sm:flex-none"
                                                                                >
                                                                                    <FiTrash2 />
                                                                                    Delete
                                                                                </button>

                                                                            </div>

                                                                        ) : (

                                                                            <button
                                                                                type="button"
                                                                                onClick={() => openAddReview(product)}
                                                                                className="w-full rounded-xl bg-[#0c831f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#096b19] sm:w-auto"
                                                                            >
                                                                                <span className="flex items-center justify-center gap-2">
                                                                                    <FiStar />
                                                                                    Rate Product
                                                                                </span>
                                                                            </button>

                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                    ) : (

                                                        <div className="rounded-xl border border-green-100 bg-green-50 p-6 text-center">
                                                            <FiCheckCircle
                                                                size={32}
                                                                className="mx-auto text-[#0c831f]"
                                                            />

                                                            <p className="mt-3 font-bold text-gray-900">
                                                                Order Delivered Successfully!
                                                            </p>

                                                            <p className="mt-1 text-sm text-gray-600">
                                                                No products are currently available for review in this order.
                                                            </p>
                                                        </div>

                                                    )}
                                                </section>

                                            ) : (

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

                                                        /* ONLY PLACES AND DELIVERED */
                                                        <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">

                                                            <div className="relative flex items-start justify-between">

                                                                {/* CONNECTING LINE */}
                                                                <div className="absolute left-5 right-5 top-5 h-1 rounded-full bg-gray-200">
                                                                    <div
                                                                        className={`h-full rounded-full bg-[#0c831f] transition-all duration-500 ${isDelivered ? "w-full" : "w-0"
                                                                            }`}
                                                                    />
                                                                </div>

                                                                {/* PLACES */}
                                                                <div className="relative z-10 flex flex-col items-start">
                                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0c831f] text-white ring-4 ring-green-50">
                                                                        <FiPackage size={19} />
                                                                    </div>

                                                                    <p className="mt-3 text-sm font-extrabold text-[#0c831f]">
                                                                        Places
                                                                    </p>

                                                                    <p className="mt-1 text-xs text-gray-500">
                                                                        {formatDateTime(order.placedAt || order.createdAt)}
                                                                    </p>
                                                                </div>

                                                                {/* DELIVERED */}
                                                                <div className="relative z-10 flex flex-col items-end text-right">
                                                                    <div
                                                                        className={`flex h-10 w-10 items-center justify-center rounded-full ring-4 ${isDelivered
                                                                                ? "bg-[#0c831f] text-white ring-green-50"
                                                                                : "bg-gray-200 text-gray-400 ring-gray-50"
                                                                            }`}
                                                                    >
                                                                        <FiCheckCircle size={19} />
                                                                    </div>

                                                                    <p
                                                                        className={`mt-3 text-sm font-extrabold ${isDelivered
                                                                                ? "text-[#0c831f]"
                                                                                : "text-gray-400"
                                                                            }`}
                                                                    >
                                                                        Delivered
                                                                    </p>

                                                                    <p className="mt-1 text-xs text-gray-500">
                                                                        {isDelivered
                                                                            ? formatDateTime(order.deliveredAt)
                                                                            : "Awaiting delivery"}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {!isDelivered && (
                                                                <p className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                                                                    Your order has been placed successfully and is being prepared for delivery.
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </section>
                                            )}

                                            {/* DELIVERY OTP */}
                                            {canShowOtp && (
                                                <section className="overflow-hidden rounded-2xl border border-green-200 bg-white">
                                                    <div className="flex items-center gap-3 border-b border-green-100 bg-green-50 px-5 py-4">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0c831f] text-white">
                                                            <FiShield size={20} />
                                                        </div>

                                                        <div>
                                                            <h3 className="font-extrabold text-gray-900">
                                                                Delivery Verification OTP
                                                            </h3>

                                                            <p className="mt-0.5 text-xs text-gray-600">
                                                                Your secure code for order delivery
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="p-5 sm:p-6">
                                                        <p className="text-sm text-gray-600">
                                                            Share this OTP with the delivery partner when your order arrives.
                                                        </p>

                                                        <div className="my-5 flex items-center justify-center">
                                                            <div className="rounded-2xl border-2 border-dashed border-[#0c831f] bg-green-50 px-8 py-4">
                                                                <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-green-700">
                                                                    Your OTP
                                                                </p>

                                                                <p className="mt-2 text-4xl font-black tracking-[0.35em] text-[#0c831f]">
                                                                    {deliveryOtp}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                                                            <FiShield className="mt-0.5 shrink-0" size={15} />

                                                            <p>
                                                                Do not share this OTP over a phone call or before receiving your order. Give it to the delivery partner only at the time of delivery verification.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </section>
                                            )}

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

            {/* =====================================
                ADD / EDIT REVIEW MODAL
            ===================================== */}

            {selectedReviewProduct && (
                <div
                    className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={(e) => {
                        if (
                            e.target === e.currentTarget &&
                            !submittingReview
                        ) {
                            closeReviewModal();
                        }
                    }}
                >
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

                        {/* MODAL HEADER */}
                        <div className="flex items-center justify-between border-b border-gray-100 p-5">
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900">
                                    {reviewMode === "edit"
                                        ? "Edit Your Review"
                                        : "Rate & Review"}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {reviewMode === "edit"
                                        ? "Update your product experience"
                                        : "Share your product experience"}
                                </p>
                            </div>

                            <button
                                type="button"
                                disabled={submittingReview}
                                onClick={closeReviewModal}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 disabled:opacity-50"
                            >
                                <FiX size={19} />
                            </button>
                        </div>

                        <div className="p-5">

                            {/* PRODUCT DETAILS */}
                            <div className="mb-6 flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
                                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
                                    {selectedReviewProduct.images?.[0]?.url && (
                                        <Image
                                            src={selectedReviewProduct.images[0].url}
                                            alt={selectedReviewProduct.name}
                                            fill
                                            sizes="80px"
                                            className="object-contain p-2"
                                        />
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900">
                                        {selectedReviewProduct.name}
                                    </h3>

                                    <p className="mt-1 text-xs text-green-700">
                                        <FiCheckCircle className="mr-1 inline" />
                                        Verified Purchase
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Order: {selectedReviewProduct.orderNumber}
                                    </p>
                                </div>
                            </div>

                            {/* STAR RATING */}
                            <div className="mb-6">
                                <label className="mb-3 block text-sm font-bold text-gray-800">
                                    Your Rating
                                </label>

                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            disabled={submittingReview}
                                            onClick={() => setReviewRating(star)}
                                            aria-label={`Rate ${star} stars`}
                                            className="text-3xl transition hover:scale-110 disabled:cursor-not-allowed"
                                        >
                                            <span className={
                                                star <= reviewRating
                                                    ? "text-yellow-400"
                                                    : "text-gray-300"
                                            }>
                                                ★
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                <p className="mt-2 text-sm font-semibold text-gray-600">
                                    {reviewRating === 5
                                        ? "Excellent!"
                                        : reviewRating === 4
                                            ? "Very Good"
                                            : reviewRating === 3
                                                ? "Good"
                                                : reviewRating === 2
                                                    ? "Fair"
                                                    : "Poor"}
                                </p>
                            </div>

                            {/* REVIEW COMMENT */}
                            <div className="mb-6">
                                <label
                                    htmlFor="reviewComment"
                                    className="mb-2 block text-sm font-bold text-gray-800"
                                >
                                    Write Your Review
                                </label>

                                <textarea
                                    id="reviewComment"
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    disabled={submittingReview}
                                    rows={4}
                                    maxLength={1000}
                                    placeholder="Tell us about your experience with this product..."
                                    className="w-full resize-none rounded-xl border border-gray-200 p-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#0c831f] focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
                                />

                                <p className="mt-1 text-right text-xs text-gray-400">
                                    {reviewComment.length}/1000
                                </p>
                            </div>

                            {/* MODAL ACTIONS */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    disabled={submittingReview}
                                    onClick={closeReviewModal}
                                    className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    disabled={submittingReview}
                                    onClick={handleSubmitReview}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0c831f] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#096b19] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submittingReview ? (
                                        <>
                                            <FiRefreshCw className="animate-spin" />
                                            {reviewMode === "edit"
                                                ? "Updating..."
                                                : "Submitting..."}
                                        </>
                                    ) : (
                                        <>
                                            {reviewMode === "edit"
                                                ? <FiEdit2 />
                                                : <FiStar />}

                                            {reviewMode === "edit"
                                                ? "Update Review"
                                                : "Submit Review"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================
                DELETE REVIEW CONFIRMATION MODAL
            ===================================== */}

            {showDeleteReviewModal && reviewToDelete && (
                <div
                    className="fixed inset-0 z-110 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                    onClick={(e) => {
                        if (
                            e.target === e.currentTarget &&
                            !deletingReview
                        ) {
                            closeDeleteReviewModal();
                        }
                    }}
                >
                    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">

                        {/* DELETE MODAL HEADER */}
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                            <h2 className="text-lg font-extrabold text-gray-900">
                                Delete Review
                            </h2>

                            <button
                                type="button"
                                disabled={deletingReview}
                                onClick={closeDeleteReviewModal}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <FiX size={19} />
                            </button>
                        </div>

                        {/* DELETE MODAL BODY */}
                        <div className="px-6 py-7 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
                                <FiAlertTriangle size={30} />
                            </div>

                            <h3 className="mt-5 text-xl font-extrabold text-gray-900">
                                Are you sure?
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Do you really want to delete your review for{" "}
                                <span className="font-bold text-gray-800">
                                    {reviewToDelete.name}
                                </span>
                                ? This action cannot be undone.
                            </p>
                        </div>

                        {/* DELETE MODAL FOOTER */}
                        <div className="flex gap-3 border-t border-gray-100 bg-gray-50 px-6 py-5">
                            <button
                                type="button"
                                disabled={deletingReview}
                                onClick={closeDeleteReviewModal}
                                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={deletingReview}
                                onClick={handleDeleteReview}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deletingReview ? (
                                    <>
                                        <FiRefreshCw className="animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <FiTrash2 />
                                        Delete Review
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
