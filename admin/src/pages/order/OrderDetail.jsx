
import React, { useEffect, useState } from "react";
import {
    FiArrowLeft,
    FiShoppingBag,
    FiCheckCircle,
    FiXCircle,
    FiPackage,
    FiMapPin,
    FiCalendar,
    FiCreditCard,
    FiTruck,
} from "react-icons/fi";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../api/axios";
import DataLoader from "../../components/DataLoader";
import { useSelector } from "react-redux";

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useSelector((store) => store.auth.user);

    const [order, setOrder] = useState(null);
    const [dataLoading, setDataLoading] = useState(true);

    // GET SINGLE ORDER
    const getOrderDetails = async () => {
        try {
            const res = await API.get(`/order/get/${id}`);
            setOrder(res.data.order);
        } catch (error) {
            console.error(error);
            toast.error(
                error?.response?.data?.message || "Failed to fetch order details"
            );
        } finally {
            setDataLoading(false);
        }
    };

    useEffect(() => {
        getOrderDetails();
    }, [id]);

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatCurrency = (amount) =>
        `₹${Number(amount || 0).toLocaleString("en-IN")}`;

    const getStatusClass = (status) => {
        const statusClasses = {
            placed: "bg-blue-100 text-blue-700",
            confirmed: "bg-indigo-100 text-indigo-700",
            processing: "bg-amber-100 text-amber-700",
            packed: "bg-purple-100 text-purple-700",
            shipped: "bg-cyan-100 text-cyan-700",
            out_for_delivery: "bg-orange-100 text-orange-700",
            delivered: "bg-green-100 text-green-700",
            cancelled: "bg-red-100 text-red-700",
        };

        return statusClasses[status] || "bg-slate-100 text-slate-600";
    };

    const getStatusLabel = (status) =>
        (status || "unknown")
            .replaceAll("_", " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());

    const getPaymentStatusClass = (status) => {
        switch (status) {
            case "paid":
                return "bg-green-100 text-green-700";
            case "failed":
            case "refunded":
                return "bg-red-100 text-red-700";
            default:
                return "bg-amber-100 text-amber-700";
        }
    };

    const getImageUrl = (image) => {
        if (!image) return "";
        if (typeof image === "string") return image;
        return image.url || "";
    };

    if (
        !user?.role?.permissions?.some((permission) =>
            permission.includes("order")
        )
    ) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (dataLoading) return <DataLoader />;

    if (!order) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <FiShoppingBag size={42} className="mx-auto text-slate-300" />
                <h2 className="mt-4 text-lg font-bold text-slate-800">
                    Order not found
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    The order you're looking for may not exist.
                </p>
                <button
                    type="button"
                    onClick={() => navigate("/admin/orders")}
                    className="mt-5 rounded-lg bg-[#003963] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002b4a]"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* PAGE HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/admin/orders")}
                        className="mt-1 rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
                        aria-label="Back to orders"
                    >
                        <FiArrowLeft size={20} />
                    </button>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            Order Details
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            #{order.orderNumber || order._id}
                        </p>
                    </div>
                </div>

                <span
                    className={`inline-block w-fit rounded-lg px-3 py-2 text-xs font-semibold ${getStatusClass(order.orderStatus)}`}
                >
                    {getStatusLabel(order.orderStatus)}
                </span>
            </div>

            {/* ORDER INFO */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-medium uppercase text-slate-400">
                        Order Date
                    </p>
                    <p className="mt-2 font-semibold text-slate-800">
                        {formatDate(order.placedAt || order.createdAt)}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-medium uppercase text-slate-400">
                        Order Status
                    </p>
                    <span
                        className={`mt-2 inline-block rounded-lg px-3 py-1.5 text-xs font-semibold ${getStatusClass(order.orderStatus)}`}
                    >
                        {getStatusLabel(order.orderStatus)}
                    </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-medium uppercase text-slate-400">
                        Payment Status
                    </p>
                    <span
                        className={`mt-2 inline-block rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${getPaymentStatusClass(order.paymentStatus)}`}
                    >
                        {order.paymentStatus || "pending"}
                    </span>
                </div>
            </div>

            {/* CUSTOMER + ADDRESS */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <FiShoppingBag className="text-[#003963]" size={19} />
                        <h3 className="font-bold text-slate-800">
                            Customer Details
                        </h3>
                    </div>

                    <p className="font-semibold text-slate-700">
                        {order.user?.name || "Customer"}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                        {order.user?.email || "-"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        {order.user?.phone || "-"}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <FiMapPin className="text-[#003963]" size={19} />
                        <h3 className="font-bold text-slate-800">
                            Delivery Address
                        </h3>
                    </div>

                    {order.address ? (
                        <>
                            <p className="font-semibold text-slate-700">
                                {order.address.type || "Address"}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                {[
                                    order.address.houseNumber,
                                    order.address.street,
                                    order.address.landmark,
                                    order.address.city,
                                    order.address.state,
                                    order.address.pincode,
                                    order.address.country,
                                ].filter(Boolean).join(", ")}
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-slate-400">
                            Address not available
                        </p>
                    )}
                </div>
            </div>

            {/* ORDER ITEMS */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                    <h3 className="font-bold text-slate-800">
                        Ordered Products
                    </h3>
                </div>

                <div className="divide-y divide-slate-100">
                    {order.items?.length > 0 ? (
                        order.items.map((item) => {
                            const image = getImageUrl(item.product?.image);

                            return (
                                <div
                                    key={item._id}
                                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                                >
                                    {image ? (
                                        <img
                                            src={image}
                                            alt={item.productName || "Product"}
                                            className="h-16 w-16 rounded-xl border border-slate-200 bg-white object-contain p-1"
                                        />
                                    ) : (
                                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                            <FiPackage size={25} />
                                        </div>
                                    )}

                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-slate-800">
                                            {item.productName || item.product?.name || "Product"}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {item.variantName || ""}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            SKU: {item.sku || "-"}
                                        </p>
                                    </div>

                                    <div className="sm:text-right">
                                        <p className="text-sm text-slate-500">
                                            {formatCurrency(item.price)} × {item.quantity}
                                        </p>
                                        <p className="mt-1 font-bold text-slate-800">
                                            {formatCurrency(item.totalPrice)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="p-5 text-center text-sm text-slate-400">
                            No order items found
                        </p>
                    )}
                </div>
            </div>

            {/* PAYMENT + PRICE DETAILS */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <FiCreditCard className="text-[#003963]" size={19} />
                        <h3 className="font-bold text-slate-800">
                            Payment Details
                        </h3>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between gap-3">
                            <span className="text-slate-500">Payment Method</span>
                            <span className="font-semibold uppercase text-slate-700">
                                {order.paymentMethod || "-"}
                            </span>
                        </div>
                        <div className="flex justify-between gap-3">
                            <span className="text-slate-500">Payment Status</span>
                            <span className="font-semibold capitalize text-slate-700">
                                {order.paymentStatus || "pending"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 font-bold text-slate-800">
                        Price Summary
                    </h3>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between gap-3">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="font-medium text-slate-700">
                                {formatCurrency(order.subtotal)}
                            </span>
                        </div>

                        <div className="flex justify-between gap-3">
                            <span className="text-slate-500">Discount</span>
                            <span className="font-medium text-green-600">
                                - {formatCurrency(order.discount)}
                            </span>
                        </div>

                        <div className="flex justify-between gap-3">
                            <span className="text-slate-500">Delivery Fee</span>
                            <span className="font-medium text-slate-700">
                                {formatCurrency(order.deliveryFee)}
                            </span>
                        </div>

                        <div className="flex justify-between gap-3">
                            <span className="text-slate-500">Tax</span>
                            <span className="font-medium text-slate-700">
                                {formatCurrency(order.tax)}
                            </span>
                        </div>

                        <div className="border-t border-slate-200 pt-3">
                            <div className="flex justify-between gap-3">
                                <span className="font-bold text-slate-800">
                                    Total Amount
                                </span>
                                <span className="text-lg font-bold text-[#003963]">
                                    {formatCurrency(order.totalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ORDER TIMELINE */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 font-bold text-slate-800">
                    Order Timeline
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                        {
                            label: "Placed",
                            date: order.placedAt,
                            icon: FiShoppingBag,
                        },
                        {
                            label: "Confirmed",
                            date: order.confirmedAt,
                            icon: FiCheckCircle,
                        },
                        {
                            label: "Delivered",
                            date: order.deliveredAt,
                            icon: FiTruck,
                        },
                        {
                            label: "Cancelled",
                            date: order.cancelledAt,
                            icon: FiXCircle,
                        },
                    ].filter((item) => item.date).map((item) => {
                        const Icon = item.icon;

                        return (
                            <div key={item.label} className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-[#003963]">
                                    <Icon size={17} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">
                                        {item.label}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {formatDate(item.date)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {order.cancellationReason && (
                    <div className="mt-4 rounded-lg bg-red-50 p-3">
                        <p className="text-xs font-semibold text-red-700">
                            Cancellation Reason
                        </p>
                        <p className="mt-1 text-sm text-red-600">
                            {order.cancellationReason}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetail;
