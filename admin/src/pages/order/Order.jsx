
import React, { useEffect, useState } from "react";
import {
    FiSearch,
    FiEye,
    FiShoppingBag,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiCalendar,
    FiTruck,
    FiUserCheck,
    FiX,
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
    FiMapPin,
    FiDollarSign,
    FiTrendingUp,
    FiBriefcase,
} from "react-icons/fi";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../api/axios";
import DataLoader from "../../components/DataLoader";
import { useSelector } from "react-redux";

const BUTTON_THEME =
    "bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] text-white hover:brightness-110";

const Order = () => {
    const user = useSelector((store) => store.auth.user);
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [totalOrders, setTotalOrders] = useState(0);
    const [pendingOrders, setPendingOrders] = useState(0);
    const [deliveredOrders, setDeliveredOrders] = useState(0);
    const [cancelledOrders, setCancelledOrders] = useState(0);

    // ROLE-BASED REVENUE SUMMARY
    const [revenueSummary, setRevenueSummary] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [filteredCount, setFilteredCount] = useState(0);

    // ASSIGN DELIVERY PARTNER STATES
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [orderToAssign, setOrderToAssign] = useState(null);
    const [deliveryPartners, setDeliveryPartners] = useState([]);
    const [partnersLoading, setPartnersLoading] = useState(false);
    const [assigningPartnerId, setAssigningPartnerId] = useState(null);

    // DELIVERY ASSIGNMENT SUMMARY
    const [assignmentSummary, setAssignmentSummary] = useState(null);

    // ROLE CHECK
    const userRole =
        typeof user?.role === "object"
            ? user.role?.name
            : user?.role;

    const isDeliveryPartner = userRole === "delivery_partner";
    const isManager = userRole === "manager";
    const isSuperAdmin = userRole === "super_admin";

    const canEditOrders =
        user?.role?.permissions?.includes("order:assign");

    // GET ALL ORDERS
    const getAllOrders = async (
        page = currentPage,
        limit = entriesPerPage,
        searchValue = debouncedSearch,
        statusValue = statusFilter
    ) => {
        try {
            const res = await API.get("/order/get", {
                params: {
                    page,
                    limit,
                    search: searchValue,
                    status: statusValue,
                },
            });

            const data = res.data;

            setOrders(data.orders || []);

            setTotalOrders(data.totalOrders ?? 0);
            setPendingOrders(data.pendingOrders ?? 0);
            setDeliveredOrders(data.deliveredOrders ?? 0);
            setCancelledOrders(data.cancelledOrders ?? 0);

            // FINANCIAL SUMMARY FROM BACKEND
            setRevenueSummary(data.revenueSummary || null);

            setFilteredCount(data.filteredCount ?? 0);
            setTotalPages(data.totalPages ?? 1);
            setCurrentPage(data.currentPage ?? page);
        } catch (error) {
            console.error("Fetch orders error:", error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to fetch orders"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // DEBOUNCED SEARCH
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    // FETCH WHEN PAGE, LIMIT, SEARCH OR STATUS CHANGES
    useEffect(() => {
        getAllOrders(
            currentPage,
            entriesPerPage,
            debouncedSearch,
            statusFilter
        );
    }, [currentPage, entriesPerPage, debouncedSearch, statusFilter]);

    // VIEW ORDER DETAILS PAGE
    const handleViewOrder = (order) => {
        navigate(`/admin/orders/${order._id}`);
    };

    // GET DELIVERY PARTNERS AVAILABLE FOR ASSIGNMENT
    const getAvailableDeliveryPartners = async () => {
        try {
            setPartnersLoading(true);
            setDeliveryPartners([]);

            const res = await API.get(
                "/delivery-partner/available-for-assignment"
            );

            setDeliveryPartners(
                res.data?.deliveryPartners || []
            );
        } catch (error) {
            console.error("Fetch available delivery partners error:", error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to fetch available delivery partners"
            );
        } finally {
            setPartnersLoading(false);
        }
    };

    // OPEN ASSIGN MODAL
    const handleOpenAssignModal = async (order) => {
        setOrderToAssign(order);
        setShowAssignModal(true);

        await getAvailableDeliveryPartners();
    };

    // ASSIGN DELIVERY PARTNER
    const handleAssignPartner = async (partner) => {
        if (!orderToAssign || assigningPartnerId) return;

        try {
            setAssigningPartnerId(partner._id);

            const res = await API.patch(
                "/order/assign-delivery-partner",
                {
                    orderId: orderToAssign._id,
                    deliveryPartnerId: partner._id,
                }
            );

            if (!res.data?.success) {
                throw new Error(
                    res.data?.message ||
                    "Failed to assign delivery partner"
                );
            }

            const updatedOrder = res.data.order;

            // UPDATE ORDER IN CURRENT LIST
            if (updatedOrder) {
                setOrders((prev) =>
                    prev.map((order) =>
                        order._id === updatedOrder._id
                            ? updatedOrder
                            : order
                    )
                );
            } else {
                setOrders((prev) =>
                    prev.map((order) =>
                        order._id === orderToAssign._id
                            ? {
                                ...order,
                                deliveryPartner: partner,
                            }
                            : order
                    )
                );
            }

            // SAVE ROUTE AND EARNING DETAILS FROM BACKEND
            setAssignmentSummary({
                orderNumber:
                    updatedOrder?.orderNumber ||
                    orderToAssign.orderNumber ||
                    orderToAssign._id,

                partnerName: getPartnerName(
                    res.data.deliveryPartner?.user || partner.user
                ),

                route: res.data.route || null,
                earning: res.data.earning || null,
            });

            toast.success(
                res.data.message ||
                `${getPartnerName(partner.user)} assigned successfully`
            );

            setShowAssignModal(false);
            setOrderToAssign(null);
            setDeliveryPartners([]);

            getAllOrders();
        } catch (error) {
            console.error("Assign delivery partner error:", error);

            toast.error(
                error?.response?.data?.message ||
                error.message ||
                "Failed to assign delivery partner"
            );

            getAvailableDeliveryPartners();
        } finally {
            setAssigningPartnerId(null);
        }
    };

    // CLOSE ASSIGN MODAL
    const handleCloseAssignModal = () => {
        if (assigningPartnerId) return;

        setShowAssignModal(false);
        setOrderToAssign(null);
        setDeliveryPartners([]);
    };

    // CLOSE ASSIGNMENT SUMMARY
    const handleCloseAssignmentSummary = () => {
        setAssignmentSummary(null);
    };

    // GET PARTNER NAME
    const getPartnerName = (partnerUser) => {
        if (!partnerUser) return "";

        return (
            partnerUser.name ||
            `${partnerUser.firstName || ""} ${partnerUser.lastName || ""}`.trim() ||
            partnerUser.email ||
            "Delivery Partner"
        );
    };

    // FORMAT CURRENCY
    const formatCurrency = (amount) => {
        if (!Number.isFinite(Number(amount))) return "₹0";

        return Number(amount).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        });
    };

    // FORMAT TRAVEL DURATION
    const formatDuration = (minutes) => {
        if (!Number.isFinite(Number(minutes))) return "-";

        const totalMinutes = Math.round(Number(minutes));

        if (totalMinutes < 60) {
            return `${totalMinutes} min`;
        }

        const hours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;

        return remainingMinutes
            ? `${hours} hr ${remainingMinutes} min`
            : `${hours} hr`;
    };

    // CHANGE ENTRIES PER PAGE
    const handleEntriesChange = (e) => {
        setEntriesPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    // PAGINATION NUMBERS
    const getPaginationNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(
            1,
            currentPage - Math.floor(maxVisiblePages / 2)
        );

        let endPage = Math.min(
            totalPages,
            startPage + maxVisiblePages - 1
        );

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    // HELPERS
    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

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

    const getPayoutStatusClass = (status) => {
        switch (status) {
            case "payable":
                return "bg-blue-100 text-blue-700";
            case "paid":
                return "bg-green-100 text-green-700";
            case "failed":
                return "bg-red-100 text-red-700";
            default:
                return "bg-amber-100 text-amber-700";
        }
    };

    // PERMISSION CHECK
    if (
        !isDeliveryPartner &&
        !user?.role?.permissions?.some((permission) =>
            permission.includes("order")
        )
    ) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (dataLoading) return <DataLoader />;

    const startEntry =
        filteredCount === 0
            ? 0
            : (currentPage - 1) * entriesPerPage + 1;

    const endEntry = Math.min(
        currentPage * entriesPerPage,
        filteredCount
    );

    // ROLE-BASED FINANCIAL SUMMARY VALUES
    const totalEarnings = revenueSummary?.totalEarnings ?? 0;
    const payableAmount = revenueSummary?.payableAmount ?? 0;
    const paidAmount = revenueSummary?.paidAmount ?? 0;
    const pendingAmount = revenueSummary?.pendingAmount ?? 0;
    const totalRevenue = revenueSummary?.totalRevenue ?? 0;
    const revenueDeliveredOrders = revenueSummary?.deliveredOrders ?? 0;

    return (
        <div className="space-y-6">

            {/* PAGE HEADER */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">
                    Orders
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    {isDeliveryPartner
                        ? "View and manage your assigned delivery orders."
                        : "Manage customer orders and track their status."}
                </p>
            </div>

            {/* ORDER STAT CARDS */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Orders</p>
                            <h2 className="mt-2 text-3xl font-bold text-slate-800">{totalOrders}</h2>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FiShoppingBag size={24} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Pending Orders</p>
                            <h2 className="mt-2 text-3xl font-bold text-amber-500">{pendingOrders}</h2>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                            <FiClock size={24} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Delivered Orders</p>
                            <h2 className="mt-2 text-3xl font-bold text-green-600">{deliveredOrders}</h2>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                            <FiCheckCircle size={24} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Cancelled Orders</p>
                            <h2 className="mt-2 text-3xl font-bold text-red-500">{cancelledOrders}</h2>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                            <FiXCircle size={24} />
                        </div>
                    </div>
                </div>

            </div>

            {/* DELIVERY PARTNER EARNINGS */}
            {isDeliveryPartner && (
                <div>
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-slate-800">
                            My Earnings
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Your delivery earnings and payout overview.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                        <div className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Total Earnings
                                    </p>
                                    <h2 className="mt-2 text-2xl font-bold text-green-600">
                                        {formatCurrency(totalEarnings)}
                                    </h2>
                                    <p className="mt-2 text-xs text-slate-400">
                                        Completed deliveries
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                                    <FiTrendingUp size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Payable Amount
                                    </p>
                                    <h2 className="mt-2 text-2xl font-bold text-blue-600">
                                        {formatCurrency(payableAmount)}
                                    </h2>
                                    <p className="mt-2 text-xs text-slate-400">
                                        Awaiting settlement
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <FiBriefcase size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Paid Amount
                                    </p>
                                    <h2 className="mt-2 text-2xl font-bold text-emerald-600">
                                        {formatCurrency(paidAmount)}
                                    </h2>
                                    <p className="mt-2 text-xs text-slate-400">
                                        Already settled
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <FiCheckCircle size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Pending Amount
                                    </p>
                                    <h2 className="mt-2 text-2xl font-bold text-amber-600">
                                        {formatCurrency(pendingAmount)}
                                    </h2>
                                    <p className="mt-2 text-xs text-slate-400">
                                        Delivery not completed yet
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                    <FiClock size={24} />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* MANAGER / SUPER ADMIN REVENUE */}
            {(isManager || isSuperAdmin) && (
                <div>
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-slate-800">
                            {isSuperAdmin ? "Platform Revenue" : "Store Revenue"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {isSuperAdmin
                                ? "Overall revenue generated across the platform."
                                : "Revenue generated by your assigned store(s)."}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                        <div className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        {isSuperAdmin ? "Total Platform Revenue" : "Total Store Revenue"}
                                    </p>
                                    <h2 className="mt-2 text-3xl font-bold text-green-600">
                                        {formatCurrency(totalRevenue)}
                                    </h2>
                                    <p className="mt-2 text-xs text-slate-400">
                                        Excluding delivery charges
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                                    <FiDollarSign size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Revenue Orders
                                    </p>
                                    <h2 className="mt-2 text-3xl font-bold text-blue-600">
                                        {revenueDeliveredOrders}
                                    </h2>
                                    <p className="mt-2 text-xs text-slate-400">
                                        Successfully delivered orders
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <FiShoppingBag size={24} />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* SEARCH + FILTER + ENTRIES */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div className="relative w-full lg:max-w-md">
                        <FiSearch
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={19}
                        />

                        <input
                            type="text"
                            placeholder="Search order number or customer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#003963] focus:bg-white focus:ring-2 focus:ring-[#003963]/10"
                        />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">

                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none transition focus:border-[#003963] focus:bg-white focus:ring-2 focus:ring-[#003963]/10 sm:w-48"
                        >
                            <option value="all">All Orders</option>
                            <option value="placed">Placed</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="packed">Packed</option>
                            <option value="shipped">Shipped</option>
                            <option value="out_for_delivery">Out For Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <div className="flex items-center gap-2">
                            <label
                                htmlFor="orderEntries"
                                className="whitespace-nowrap text-sm font-medium text-slate-500"
                            >
                                Show entries:
                            </label>

                            <select
                                id="orderEntries"
                                value={entriesPerPage}
                                onChange={handleEntriesChange}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                            >
                                {[10, 20, 50, 100].map((value) => (
                                    <option key={value} value={value}>{value}</option>
                                ))}
                            </select>
                        </div>

                    </div>
                </div>
            </div>

            {/* ORDERS TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-250">
                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                {["Order", "Date", "Payment", "Status", "Actions"].map(
                                    (heading) => (
                                        <th
                                            key={heading}
                                            className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                                        >
                                            {heading}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {orders.length > 0 ? (
                                orders.map((order) => {
                                    const assignedPartner = order.deliveryPartner;

                                    return (
                                        <tr
                                            key={order._id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            {/* ORDER */}
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-semibold text-slate-800">
                                                        #{order.orderNumber || order._id}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        ID: #{order._id}
                                                    </p>

                                                    {assignedPartner && (
                                                        <p className="mt-2 text-xs font-medium text-green-700">
                                                            Assigned to:{" "}
                                                            {getPartnerName(assignedPartner?.user)}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            {/* DATE */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                                    <FiCalendar
                                                        className="text-slate-400"
                                                        size={15}
                                                    />
                                                    {formatDate(order.placedAt || order.createdAt)}
                                                </div>
                                            </td>

                                            {/* PAYMENT */}
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium uppercase text-slate-700">
                                                    {order.paymentMethod || "-"}
                                                </p>

                                                <span
                                                    className={`mt-1 inline-block rounded-md px-2 py-1 text-xs font-semibold capitalize ${getPaymentStatusClass(
                                                        order.paymentStatus
                                                    )}`}
                                                >
                                                    {order.paymentStatus || "pending"}
                                                </span>
                                            </td>

                                            {/* STATUS */}
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-block whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold ${getStatusClass(
                                                        order.orderStatus
                                                    )}`}
                                                >
                                                    {getStatusLabel(order.orderStatus)}
                                                </span>
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        title="View Order"
                                                        onClick={() => handleViewOrder(order)}
                                                        className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                    >
                                                        <FiEye size={18} />
                                                    </button>

                                                    {canEditOrders &&
                                                        order.orderStatus !== "delivered" &&
                                                        order.orderStatus !== "cancelled" && (
                                                            <button
                                                                type="button"
                                                                title={
                                                                    assignedPartner
                                                                        ? "Reassign Order"
                                                                        : "Assign Order"
                                                                }
                                                                onClick={() =>
                                                                    handleOpenAssignModal(order)
                                                                }
                                                                className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                                                            >
                                                                <FiUserCheck size={18} />
                                                            </button>
                                                        )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <FiShoppingBag
                                            size={40}
                                            className="mx-auto text-slate-300"
                                        />

                                        <p className="mt-3 font-medium text-slate-600">
                                            No orders found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            Try changing your search or status filter.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {totalPages > 0 && (
                    <div className="flex flex-col gap-4 border-t border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                        <p className="text-sm text-slate-500">
                            Showing{" "}
                            <span className="font-semibold text-slate-800">
                                {startEntry}
                            </span>
                            {" "}to{" "}
                            <span className="font-semibold text-slate-800">
                                {endEntry}
                            </span>
                            {" "}of{" "}
                            <span className="font-semibold text-slate-800">
                                {filteredCount}
                            </span>
                            {" "}orders
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-1.5">

                            {/* FIRST PAGE */}
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(1)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#047857] hover:bg-emerald-50 hover:text-[#047857] disabled:cursor-not-allowed disabled:opacity-40"
                                title="First page"
                            >
                                <FiChevronsLeft size={17} />
                            </button>

                            {/* PREVIOUS */}
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setCurrentPage((prev) => Math.max(1, prev - 1))
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#047857] hover:bg-emerald-50 hover:text-[#047857] disabled:cursor-not-allowed disabled:opacity-40"
                                title="Previous page"
                            >
                                <FiChevronLeft size={17} />
                            </button>

                            {/* FIRST PAGE + ELLIPSIS */}
                            {getPaginationNumbers().length > 0 &&
                                getPaginationNumbers()[0] > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage(1)}
                                            className="h-9 min-w-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:border-[#047857] hover:bg-emerald-50 hover:text-[#047857]"
                                        >
                                            1
                                        </button>

                                        {getPaginationNumbers()[0] > 2 && (
                                            <span className="px-1 text-slate-400">
                                                ...
                                            </span>
                                        )}
                                    </>
                                )}

                            {/* PAGE NUMBERS */}
                            {getPaginationNumbers().map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition ${currentPage === page
                                        ? "bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] text-white shadow-sm"
                                        : "border border-slate-200 text-slate-600 hover:border-[#047857] hover:bg-emerald-50 hover:text-[#047857]"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            {/* LAST PAGE + ELLIPSIS */}
                            {getPaginationNumbers().length > 0 &&
                                getPaginationNumbers()[
                                getPaginationNumbers().length - 1
                                ] < totalPages && (
                                    <>
                                        {getPaginationNumbers()[
                                            getPaginationNumbers().length - 1
                                        ] < totalPages - 1 && (
                                                <span className="px-1 text-slate-400">
                                                    ...
                                                </span>
                                            )}

                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage(totalPages)}
                                            className="h-9 min-w-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:border-[#047857] hover:bg-emerald-50 hover:text-[#047857]"
                                        >
                                            {totalPages}
                                        </button>
                                    </>
                                )}

                            {/* NEXT */}
                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(totalPages, prev + 1)
                                    )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#047857] hover:bg-emerald-50 hover:text-[#047857] disabled:cursor-not-allowed disabled:opacity-40"
                                title="Next page"
                            >
                                <FiChevronRight size={17} />
                            </button>

                            {/* LAST PAGE */}
                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(totalPages)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#047857] hover:bg-emerald-50 hover:text-[#047857] disabled:cursor-not-allowed disabled:opacity-40"
                                title="Last page"
                            >
                                <FiChevronsRight size={17} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ASSIGN DELIVERY PARTNER MODAL */}
            {showAssignModal && orderToAssign && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={handleCloseAssignModal}
                >
                    <div
                        className="max-h-[85vh] w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">
                                    Assign Delivery Partner
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Order #{orderToAssign.orderNumber || orderToAssign._id}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseAssignModal}
                                disabled={!!assigningPartnerId}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
                                aria-label="Close modal"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="max-h-[60vh] space-y-3 overflow-y-auto p-6">
                            {partnersLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#003963]" />
                                    <p className="mt-3 text-sm font-medium text-slate-500">
                                        Fetching available delivery partners...
                                    </p>
                                </div>
                            ) : deliveryPartners.length > 0 ? (
                                deliveryPartners.map((partner) => {
                                    const isAssigned =
                                        orderToAssign.deliveryPartner?._id === partner._id;

                                    const partnerUser = partner.user;

                                    return (
                                        <div
                                            key={partner._id}
                                            className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-[#003963]/30 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#003963]">
                                                    <FiTruck size={20} />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-800">
                                                        {getPartnerName(partnerUser)}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {partnerUser?.phone || "No phone"}
                                                    </p>
                                                    <p className="mt-0.5 truncate text-xs text-slate-400">
                                                        {partnerUser?.email || "No email"}
                                                    </p>
                                                    <p className="mt-1 text-xs font-medium capitalize text-green-600">
                                                        {partner.vehicleType || "Vehicle"} · Online & Available
                                                    </p>
                                                </div>
                                            </div>

                                            {/* ASSIGN BUTTON - SAME GREEN BACKGROUND */}
                                            <button
                                                type="button"
                                                onClick={() => handleAssignPartner(partner)}
                                                disabled={!!assigningPartnerId || isAssigned}
                                                className={`shrink-0 rounded-lg bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${isAssigned ? "cursor-not-allowed opacity-60" : ""
                                                    }`}
                                            >
                                                {isAssigned
                                                    ? "Assigned"
                                                    : assigningPartnerId === partner._id
                                                        ? "Assigning..."
                                                        : "Assign"}
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-12 text-center">
                                    <FiTruck size={40} className="mx-auto text-slate-300" />
                                    <p className="mt-3 font-semibold text-slate-600">
                                        No available delivery partners
                                    </p>
                                    <p className="mt-1 text-sm text-slate-400">
                                        There are currently no active, online and available delivery partners.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={getAvailableDeliveryPartners}
                                        className="mt-4 rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end border-t border-slate-200 px-6 py-4">
                            <button
                                type="button"
                                onClick={handleCloseAssignModal}
                                disabled={!!assigningPartnerId}
                                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELIVERY ASSIGNMENT SUMMARY MODAL */}
            {assignmentSummary && (
                <div
                    className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
                    onClick={handleCloseAssignmentSummary}
                >
                    <div
                        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* HEADER */}
                        <div className="shrink-0 border-b border-slate-200 px-6 py-5">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                                        <FiCheckCircle size={26} />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800">
                                            Partner Assigned
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Delivery assignment successful
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleCloseAssignmentSummary}
                                    className={`rounded-lg p-2 transition ${BUTTON_THEME}`}
                                    aria-label="Close summary"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>
                        </div>

                        {/* SCROLLABLE CONTENT */}
                        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-6">

                            {/* ORDER AND PARTNER */}
                            <div className="rounded-xl bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Order
                                </p>
                                <p className="mt-1 font-bold text-slate-800">
                                    #{assignmentSummary.orderNumber}
                                </p>

                                <div className="mt-3 border-t border-slate-200 pt-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Delivery Partner
                                    </p>
                                    <p className="mt-1 font-semibold text-slate-800">
                                        {assignmentSummary.partnerName}
                                    </p>
                                </div>
                            </div>

                            {/* ROUTE DETAILS */}
                            <div>
                                <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
                                    <FiMapPin className="text-[#003963]" size={18} />
                                    Delivery Route
                                </h3>

                                {assignmentSummary.route ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-xl border border-slate-200 p-4">
                                            <p className="text-xs font-medium text-slate-500">
                                                Road Distance
                                            </p>
                                            <p className="mt-2 text-2xl font-bold text-slate-800">
                                                {Number(assignmentSummary.route.distanceKm).toFixed(2)}
                                                <span className="ml-1 text-sm font-semibold text-slate-500">
                                                    km
                                                </span>
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-slate-200 p-4">
                                            <p className="flex items-center gap-1 text-xs font-medium text-slate-500">
                                                <FiClock size={13} />
                                                Estimated Time
                                            </p>
                                            <p className="mt-2 text-2xl font-bold text-slate-800">
                                                {formatDuration(
                                                    assignmentSummary.route.durationMinutes
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
                                        Route information was not returned by the server.
                                    </p>
                                )}
                            </div>

                            {/* PARTNER EARNING */}
                            <div>
                                <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
                                    <FiDollarSign className="text-green-600" size={18} />
                                    Partner Earning
                                </h3>

                                {assignmentSummary.earning ? (
                                    <div className="overflow-hidden rounded-xl border border-slate-200">
                                        <div className="flex items-center justify-between p-4">
                                            <span className="text-sm font-medium text-slate-500">
                                                Delivery Earning
                                            </span>
                                            <span className="text-lg font-bold text-slate-800">
                                                {formatCurrency(
                                                    assignmentSummary.earning.totalEarning
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-4">
                                            <span className="font-semibold text-slate-700">
                                                Total Estimated Earning
                                            </span>
                                            <span className="text-2xl font-bold text-green-600">
                                                {formatCurrency(
                                                    assignmentSummary.earning.totalEarning
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
                                        Earning information was not returned by the server.
                                    </p>
                                )}
                            </div>

                            {/* PAYOUT STATUS */}
                            <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">
                                        Payout Status
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Earning becomes payable after successful delivery OTP verification.
                                    </p>
                                </div>

                                <span className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold capitalize ${getPayoutStatusClass(
                                    assignmentSummary.earning?.payoutStatus || "pending"
                                )}`}>
                                    {assignmentSummary.earning?.payoutStatus || "Pending"}
                                </span>
                            </div>

                        </div>

                        {/* FIXED FOOTER */}
                        <div className="shrink-0 flex justify-end border-t border-slate-200 bg-white px-6 py-4">
                            <button
                                type="button"
                                onClick={handleCloseAssignmentSummary}
                                className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition ${BUTTON_THEME}`}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Order;
