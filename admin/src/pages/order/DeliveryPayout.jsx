
import React, { useCallback, useEffect, useState } from "react";
import {
    FiSearch,
    FiDollarSign,
    FiClock,
    FiCheckCircle,
    FiTruck,
    FiPackage,
    FiCalendar,
    FiMapPin,
    FiRefreshCw,
    FiX,
    FiCreditCard,
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
    FiArrowUpRight,
    FiUser,
    FiFileText,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { API } from "../../api/axios";
import DataLoader from "../../components/DataLoader";

const DeliveryPayout = () => {
    const [payouts, setPayouts] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [summary, setSummary] = useState({
        totalPayouts: 0,
        pendingAmount: 0,
        payableAmount: 0,
        paidAmount: 0,
        pendingCount: 0,
        payableCount: 0,
        paidCount: 0,
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [filteredCount, setFilteredCount] = useState(0);

    // SETTLEMENT MODAL
    const [showSettleModal, setShowSettleModal] = useState(false);
    const [selectedPayout, setSelectedPayout] = useState(null);
    const [paymentReference, setPaymentReference] = useState("");
    const [settlementNote, setSettlementNote] = useState("");
    const [settling, setSettling] = useState(false);

    // FETCH PAYOUTS
    const getPayouts = useCallback(async (
        page = currentPage,
        limit = entriesPerPage,
        searchValue = debouncedSearch,
        statusValue = statusFilter,
        showRefresh = false
    ) => {
        try {
            if (showRefresh) setRefreshing(true);

            const res = await API.get("/delivery-payout/get", {
                params: {
                    page,
                    limit,
                    search: searchValue,
                    status: statusValue,
                },
            });

            const data = res.data;

            setPayouts(data.payouts || []);

            setSummary({
                totalPayouts: data.summary?.totalPayouts ?? 0,
                pendingAmount: data.summary?.pendingAmount ?? 0,
                payableAmount: data.summary?.payableAmount ?? 0,
                paidAmount: data.summary?.paidAmount ?? 0,
                pendingCount: data.summary?.pendingCount ?? 0,
                payableCount: data.summary?.payableCount ?? 0,
                paidCount: data.summary?.paidCount ?? 0,
            });

            setFilteredCount(data.filteredCount ?? 0);
            setTotalPages(data.totalPages ?? 1);
            setCurrentPage(data.currentPage ?? page);
        } catch (error) {
            console.error("Fetch delivery payouts error:", error);
            toast.error(
                error?.response?.data?.message ||
                "Failed to fetch delivery payouts"
            );
        } finally {
            setDataLoading(false);
            setRefreshing(false);
        }
    }, [
        currentPage,
        entriesPerPage,
        debouncedSearch,
        statusFilter,
    ]);

    // DEBOUNCED SEARCH
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    // FETCH WHEN FILTERS CHANGE
    useEffect(() => {
        getPayouts(
            currentPage,
            entriesPerPage,
            debouncedSearch,
            statusFilter
        );
    }, [
        currentPage,
        entriesPerPage,
        debouncedSearch,
        statusFilter,
        getPayouts,
    ]);

    // FORMAT CURRENCY
    const formatCurrency = (amount = 0) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(Number(amount) || 0);
    };

    // FORMAT DATE
    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatDateTime = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getPartnerName = (partner) => {
        const partnerUser = partner?.user || partner;

        if (!partnerUser) return "Unknown Partner";

        return (
            partnerUser.name ||
            `${partnerUser.firstName || ""} ${partnerUser.lastName || ""}`.trim() ||
            partnerUser.email ||
            "Delivery Partner"
        );
    };

    const getStatusClass = (status) => {
        const classes = {
            pending: "bg-amber-50 text-amber-700 border-amber-200",
            payable: "bg-blue-50 text-blue-700 border-blue-200",
            paid: "bg-green-50 text-green-700 border-green-200",
            failed: "bg-red-50 text-red-700 border-red-200",
        };

        return classes[status] || "bg-slate-50 text-slate-600 border-slate-200";
    };

    const getStatusLabel = (status) => {
        return (status || "unknown")
            .replaceAll("_", " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    // OPEN SETTLEMENT MODAL
    const handleOpenSettleModal = (payout) => {
        if (payout.payoutStatus !== "payable") {
            toast.error("Only payable payouts can be settled.");
            return;
        }

        setSelectedPayout(payout);
        setPaymentReference(payout.paymentReference || "");
        setSettlementNote(payout.settlementNote || "");
        setShowSettleModal(true);
    };

    // CLOSE SETTLEMENT MODAL
    const handleCloseSettleModal = () => {
        if (settling) return;

        setShowSettleModal(false);
        setSelectedPayout(null);
        setPaymentReference("");
        setSettlementNote("");
    };

    // SETTLE PAYOUT
    const handleSettlePayout = async (e) => {
        e.preventDefault();

        if (!selectedPayout || settling) return;

        try {
            setSettling(true);

            const res = await API.patch(
                `/delivery-payout/settle/${selectedPayout._id}`,
                {
                    paymentReference: paymentReference.trim(),
                    settlementNote: settlementNote.trim(),
                }
            );

            if (!res.data?.success) {
                throw new Error(
                    res.data?.message || "Failed to settle payout"
                );
            }

            toast.success(
                res.data.message || "Payout settled successfully"
            );

            handleCloseSettleModal();

            await getPayouts(
                currentPage,
                entriesPerPage,
                debouncedSearch,
                statusFilter
            );
        } catch (error) {
            console.error("Settle payout error:", error);

            toast.error(
                error?.response?.data?.message ||
                error.message ||
                "Failed to settle payout"
            );
        } finally {
            setSettling(false);
        }
    };

    // PAGINATION
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

    const handleEntriesChange = (e) => {
        setEntriesPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const startEntry = filteredCount === 0
        ? 0
        : (currentPage - 1) * entriesPerPage + 1;

    const endEntry = Math.min(
        currentPage * entriesPerPage,
        filteredCount
    );

    if (dataLoading) return <DataLoader />;

    return (
        <div className="space-y-6">

            {/* PAGE HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Delivery Payouts
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Track delivery partner earnings and manage settlements.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => getPayouts(
                        currentPage,
                        entriesPerPage,
                        debouncedSearch,
                        statusFilter,
                        true
                    )}
                    disabled={refreshing}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <FiRefreshCw
                        size={16}
                        className={refreshing ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Total Payouts
                            </p>
                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {summary.totalPayouts}
                            </h2>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <FiDollarSign size={24} />
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-400">
                        All delivery payout records
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Pending Amount
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-amber-600">
                                {formatCurrency(summary.pendingAmount)}
                            </h2>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <FiClock size={24} />
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-400">
                        {summary.pendingCount} pending payouts
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Payable Amount
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-blue-600">
                                {formatCurrency(summary.payableAmount)}
                            </h2>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FiCreditCard size={24} />
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-400">
                        {summary.payableCount} ready for settlement
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Paid Amount
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-green-600">
                                {formatCurrency(summary.paidAmount)}
                            </h2>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                            <FiCheckCircle size={24} />
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-400">
                        {summary.paidCount} successfully settled
                    </p>
                </div>

            </div>

            {/* SEARCH AND FILTER */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div className="relative w-full lg:max-w-md">
                        <FiSearch
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={19}
                        />

                        <input
                            type="text"
                            placeholder="Search order, partner or payment reference..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#003963] focus:bg-white focus:ring-2 focus:ring-[#003963]/10"
                        />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none transition focus:border-[#003963] focus:bg-white focus:ring-2 focus:ring-[#003963]/10 sm:w-48"
                        >
                            <option value="all">All Payouts</option>
                            <option value="pending">Pending</option>
                            <option value="payable">Payable</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                        </select>

                        <div className="flex items-center gap-2">
                            <label
                                htmlFor="payoutEntries"
                                className="whitespace-nowrap text-sm font-medium text-slate-500"
                            >
                                Show entries:
                            </label>

                            <select
                                id="payoutEntries"
                                value={entriesPerPage}
                                onChange={handleEntriesChange}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-[#003963] focus:ring-2 focus:ring-[#003963]/10"
                            >
                                {[10, 20, 50, 100].map((value) => (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>
                </div>
            </div>

            {/* PAYOUT TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-bold text-slate-800">
                            Payout Records
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Delivery-wise earning and settlement details
                        </p>
                    </div>

                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        {filteredCount} Records
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-175">

                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                {[
                                    "Order / Partner",
                                    "Distance",
                                    // "Earning Breakdown",
                                    "Payout",
                                    "Status",
                                    "Date",
                                    "Action",
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className={`whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${heading === "Action" ? "text-center" : ""
                                            }`}
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {payouts.length > 0 ? (
                                payouts.map((payout) => {
                                    const partnerName = getPartnerName(
                                        payout.deliveryPartner
                                    );

                                    const orderNumber =
                                        payout.order?.orderNumber ||
                                        payout.order?._id ||
                                        "-";

                                    return (
                                        <tr
                                            key={payout._id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            {/* ORDER / PARTNER */}
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-800">
                                                    #{orderNumber}
                                                </p>

                                                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                                    <FiUser size={12} />
                                                    {partnerName}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    {payout.deliveryPartner?.user?.email || ""}
                                                </p>
                                            </td>

                                            {/* DISTANCE */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FiMapPin
                                                        size={15}
                                                        className="text-slate-400"
                                                    />
                                                    <span className="font-semibold text-slate-700">
                                                        {Number(payout.distanceKm || 0).toFixed(2)} km
                                                    </span>
                                                </div>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    {payout.durationSeconds
                                                        ? `${Math.round(payout.durationSeconds / 60)} min route`
                                                        : "Road distance"}
                                                </p>
                                            </td>

                                            {/* EARNING BREAKDOWN */}
                                            {/* <td className="px-5 py-4">
                                                <div className="space-y-1 text-xs">
                                                    <div className="flex justify-between gap-5">
                                                        <span className="text-slate-500">
                                                            Base earning
                                                        </span>
                                                        <span className="font-medium text-slate-700">
                                                            {formatCurrency(payout.baseEarning)}
                                                        </span>
                                                    </div>

                                                    {Number(payout.extraDistanceEarning) > 0 && (
                                                        <div className="flex justify-between gap-5">
                                                            <span className="text-slate-500">
                                                                Extra distance
                                                            </span>
                                                            <span className="font-medium text-slate-700">
                                                                {formatCurrency(payout.extraDistanceEarning)}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {Number(payout.incentive) > 0 && (
                                                        <div className="flex justify-between gap-5">
                                                            <span className="text-slate-500">
                                                                Incentive
                                                            </span>
                                                            <span className="font-medium text-green-600">
                                                                +{formatCurrency(payout.incentive)}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {Number(payout.deduction) > 0 && (
                                                        <div className="flex justify-between gap-5">
                                                            <span className="text-slate-500">
                                                                Deduction
                                                            </span>
                                                            <span className="font-medium text-red-600">
                                                                -{formatCurrency(payout.deduction)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td> */}

                                            {/* TOTAL PAYOUT */}
                                            <td className="px-5 py-4">
                                                <p className="text-base font-bold text-slate-800">
                                                    {formatCurrency(payout.totalEarning)}
                                                </p>

                                                {payout.extraKm > 0 && (
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        {payout.extraKm} extra km
                                                    </p>
                                                )}
                                            </td>

                                            {/* STATUS */}
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold ${getStatusClass(payout.payoutStatus)}`}
                                                >
                                                    {getStatusLabel(payout.payoutStatus)}
                                                </span>

                                                {payout.paidAt && (
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        Paid: {formatDate(payout.paidAt)}
                                                    </p>
                                                )}
                                            </td>

                                            {/* DATE */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <FiCalendar
                                                        size={14}
                                                        className="text-slate-400"
                                                    />
                                                    {formatDate(payout.createdAt)}
                                                </div>

                                                {payout.payableAt && (
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        Payable: {formatDate(payout.payableAt)}
                                                    </p>
                                                )}
                                            </td>

                                            {/* ACTION */}
                                            <td className="px-5 py-4">
                                                <div className="flex justify-center">
                                                    {payout.payoutStatus === "payable" ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenSettleModal(payout)}
                                                            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#003963] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#002b4a]"
                                                        >
                                                            <FiCheckCircle size={15} />
                                                            Settle
                                                        </button>
                                                    ) : payout.payoutStatus === "paid" ? (
                                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600">
                                                            <FiCheckCircle size={15} />
                                                            Settled
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-medium text-slate-400">
                                                            Not payable yet
                                                        </span>
                                                    )}
                                                </div>

                                                {payout.paymentReference && (
                                                    <p className="mt-2 text-center text-xs text-slate-400">
                                                        Ref: {payout.paymentReference}
                                                    </p>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                            <FiDollarSign size={30} />
                                        </div>

                                        <p className="mt-4 font-semibold text-slate-700">
                                            No payout records found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            Payouts will appear here once delivery records are generated.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>

                {/* PAGINATION */}
                <div className="flex flex-col gap-4 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

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
                        {" "}payouts
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5">

                        <button
                            type="button"
                            title="First Page"
                            disabled={currentPage === 1 || totalPages <= 1}
                            onClick={() => setCurrentPage(1)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#003963] hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <FiChevronsLeft size={17} />
                        </button>

                        <button
                            type="button"
                            title="Previous Page"
                            disabled={currentPage === 1 || totalPages <= 1}
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#003963] hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <FiChevronLeft size={17} />
                        </button>

                        {getPaginationNumbers().map((page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-semibold transition ${currentPage === page
                                    ? "bg-[#003963] text-white shadow-sm"
                                    : "border border-slate-200 text-slate-600 hover:border-[#003963] hover:bg-blue-50"
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
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#003963] hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <FiChevronRight size={17} />
                        </button>

                        <button
                            type="button"
                            title="Last Page"
                            disabled={currentPage >= totalPages || totalPages <= 1}
                            onClick={() => setCurrentPage(totalPages)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#003963] hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <FiChevronsRight size={17} />
                        </button>

                    </div>
                </div>
            </div>

            {/* SETTLEMENT MODAL */}
            {showSettleModal && selectedPayout && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:p-5"
                    onClick={handleCloseSettleModal}
                >
                    <div
                        className="my-auto w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-2.5rem)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* MODAL HEADER */}
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">
                                    Settle Delivery Payout
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Confirm payment to delivery partner
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseSettleModal}
                                disabled={settling}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSettlePayout}>
                            <div className="space-y-5 p-6">

                                {/* PAYOUT DETAILS */}
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                Order
                                            </p>
                                            <p className="mt-1 font-bold text-slate-800">
                                                #{selectedPayout.order?.orderNumber || selectedPayout.order?._id || "-"}
                                            </p>
                                        </div>

                                        <span className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                                            Payable
                                        </span>
                                    </div>

                                    <div className="my-4 border-t border-slate-200" />

                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Delivery Partner
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-slate-800">
                                                {getPartnerName(selectedPayout.deliveryPartner)}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xs text-slate-500">
                                                Road Distance
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-slate-800">
                                                {Number(selectedPayout.distanceKm || 0).toFixed(2)} km
                                            </p>
                                        </div>
                                    </div>

                                    <div className="my-4 border-t border-slate-200" />

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-600">
                                            Total Payable
                                        </span>
                                        <span className="text-2xl font-bold text-green-600">
                                            {formatCurrency(selectedPayout.totalEarning)}
                                        </span>
                                    </div>
                                </div>

                                {/* PAYMENT REFERENCE */}
                                <div>
                                    <label
                                        htmlFor="paymentReference"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Payment Reference
                                        <span className="ml-1 font-normal text-slate-400">
                                            (Optional)
                                        </span>
                                    </label>

                                    <input
                                        id="paymentReference"
                                        type="text"
                                        value={paymentReference}
                                        onChange={(e) => setPaymentReference(e.target.value)}
                                        placeholder="Enter UTR / transaction ID"
                                        maxLength={100}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#003963] focus:bg-white focus:ring-2 focus:ring-[#003963]/10"
                                    />
                                </div>

                                {/* SETTLEMENT NOTE */}
                                <div>
                                    <label
                                        htmlFor="settlementNote"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Settlement Note
                                        <span className="ml-1 font-normal text-slate-400">
                                            (Optional)
                                        </span>
                                    </label>

                                    <textarea
                                        id="settlementNote"
                                        rows={3}
                                        value={settlementNote}
                                        onChange={(e) => setSettlementNote(e.target.value)}
                                        placeholder="Add a note about this settlement..."
                                        maxLength={500}
                                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#003963] focus:bg-white focus:ring-2 focus:ring-[#003963]/10"
                                    />
                                </div>

                                <div className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                                    Please verify that the payment has actually been transferred before marking this payout as paid.
                                </div>
                            </div>

                            {/* MODAL FOOTER */}
                            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={handleCloseSettleModal}
                                    disabled={settling}
                                    className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={settling}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {settling ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            Settling...
                                        </>
                                    ) : (
                                        <>
                                            <FiCheckCircle size={16} />
                                            Confirm Settlement
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default DeliveryPayout;
