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
} from "react-icons/fi";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../api/axios";
import DataLoader from "../../components/DataLoader";
import { useSelector } from "react-redux";

// Temporary static delivery partners
const deliveryPartners = [
    { _id: "partner_1", name: "Rahul Sharma", phone: "9876543210", email: "rahul@example.com" },
    { _id: "partner_2", name: "Amit Kumar", phone: "9876543211", email: "amit@example.com" },
    { _id: "partner_3", name: "Vikas Singh", phone: "9876543212", email: "vikas@example.com" },
    { _id: "partner_4", name: "Rohit Verma", phone: "9876543213", email: "rohit@example.com" },
];

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

    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [filteredCount, setFilteredCount] = useState(0);

    const [showAssignModal, setShowAssignModal] = useState(false);
    const [orderToAssign, setOrderToAssign] = useState(null);
    const [assignedPartners, setAssignedPartners] = useState({});

    const canEditOrders = user?.role?.permissions?.includes("order:update");

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
        // No setDataLoading(true) here.
        // Full-page loader is only for the initial page load.
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

    // OPEN ASSIGN MODAL
    const handleOpenAssignModal = (order) => {
        setOrderToAssign(order);
        setShowAssignModal(true);
    };

    // ASSIGN DELIVERY PARTNER (TEMPORARY FRONTEND STATE)
    const handleAssignPartner = (partner) => {
        if (!orderToAssign) return;

        setAssignedPartners((prev) => ({
            ...prev,
            [orderToAssign._id]: partner,
        }));

        toast.success(
            `${partner.name} assigned to order #${orderToAssign.orderNumber || orderToAssign._id}`
        );

        setShowAssignModal(false);
        setOrderToAssign(null);
    };

    const handleCloseAssignModal = () => {
        setShowAssignModal(false);
        setOrderToAssign(null);
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

    // PERMISSION CHECK
    if (
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

    return (
        <div className="space-y-6">

            {/* PAGE HEADER */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">
                    Orders
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Manage customer orders and track their status.
                </p>
            </div>

            {/* STAT CARDS */}
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
                                {["Order", "Date", "Payment", "Status", "Actions"].map((heading) => (
                                    <th
                                        key={heading}
                                        className={`whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 ${heading === "Actions" ? "text-center" : "text-left"}`}
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {orders.length > 0 ? (
                                orders.map((order) => {
                                    const assignedPartner = assignedPartners[order._id];

                                    return (
                                        <tr key={order._id} className="transition hover:bg-slate-50">

                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-semibold text-slate-800">
                                                        #{order.orderNumber || order._id}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-400">{order._id}</p>

                                                    {assignedPartner && (
                                                        <p className="mt-2 text-xs font-medium text-green-700">
                                                            Assigned to: {assignedPartner.name}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <FiCalendar className="text-slate-400" size={15} />
                                                    {formatDate(order.placedAt || order.createdAt)}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium uppercase text-slate-700">
                                                    {order.paymentMethod || "-"}
                                                </p>
                                                <span className={`mt-1 inline-block rounded-md px-2 py-1 text-xs font-semibold capitalize ${getPaymentStatusClass(order.paymentStatus)}`}>
                                                    {order.paymentStatus || "pending"}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className={`inline-block whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold ${getStatusClass(order.orderStatus)}`}>
                                                    {getStatusLabel(order.orderStatus)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">

                                                    <div className="group relative">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleViewOrder(order)}
                                                            aria-label="View order"
                                                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                        >
                                                            <FiEye size={18} />
                                                        </button>
                                                        <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                                                            View Order
                                                        </span>
                                                    </div>

                                                    {canEditOrders && (
                                                        <div className="group relative">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenAssignModal(order)}
                                                                aria-label="Assign order"
                                                                className="rounded-lg p-2 text-[#003963] transition hover:bg-blue-50"
                                                            >
                                                                <FiUserCheck size={18} />
                                                            </button>
                                                            <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                                                                {assignedPartner ? "Reassign Order" : "Assign Order"}
                                                            </span>
                                                        </div>
                                                    )}

                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <FiShoppingBag size={40} className="mx-auto text-slate-300" />
                                        <p className="mt-3 font-medium text-slate-600">No orders found</p>
                                        <p className="mt-1 text-sm text-slate-400">
                                            Try changing your search or status filter.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>

                {/* PAGINATION FOOTER */}
                <div className="flex flex-col gap-4 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-sm text-slate-500">
                        Showing{" "}
                        <span className="font-semibold text-slate-800">{startEntry}</span>
                        {" "}to{" "}
                        <span className="font-semibold text-slate-800">{endEntry}</span>
                        {" "}of{" "}
                        <span className="font-semibold text-slate-800">{filteredCount}</span>
                        {" "}orders
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5">

                        <button
                            type="button"
                            title="First Page"
                            disabled={currentPage === 1 || totalPages <= 1}
                            onClick={() => setCurrentPage(1)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600"
                        >
                            <FiChevronsLeft size={17} />
                        </button>

                        <button
                            type="button"
                            title="Previous Page"
                            disabled={currentPage === 1 || totalPages <= 1}
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600"
                        >
                            <FiChevronLeft size={17} />
                        </button>

                        {getPaginationNumbers().map((page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-semibold transition ${currentPage === page
                                    ? "bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] text-white shadow-sm"
                                    : "border border-slate-200 text-slate-600 hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            type="button"
                            title="Next Page"
                            disabled={currentPage >= totalPages || totalPages <= 1}
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600"
                        >
                            <FiChevronRight size={17} />
                        </button>

                        <button
                            type="button"
                            title="Last Page"
                            disabled={currentPage >= totalPages || totalPages <= 1}
                            onClick={() => setCurrentPage(totalPages)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600"
                        >
                            <FiChevronsRight size={17} />
                        </button>

                    </div>
                </div>
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
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                aria-label="Close modal"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="max-h-[60vh] space-y-3 overflow-y-auto p-6">
                            {deliveryPartners.map((partner) => {
                                const isAssigned =
                                    assignedPartners[orderToAssign._id]?._id === partner._id;

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
                                                <p className="font-semibold text-slate-800">{partner.name}</p>
                                                <p className="mt-1 text-sm text-slate-500">{partner.phone}</p>
                                                <p className="mt-0.5 truncate text-xs text-slate-400">{partner.email}</p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleAssignPartner(partner)}
                                            disabled={isAssigned}
                                            className={`shrink-0 rounded-lg px-5 py-2.5 text-sm font-semibold transition ${isAssigned
                                                ? "cursor-not-allowed bg-green-50 text-green-700"
                                                : "bg-[#003963] text-white hover:bg-[#002b4a]"
                                                }`}
                                        >
                                            {isAssigned ? "Assigned" : "Assign"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-end border-t border-slate-200 px-6 py-4">
                            <button
                                type="button"
                                onClick={handleCloseAssignModal}
                                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Order;
