import React, { useEffect, useState } from "react";
import {
    FiArrowLeft,
    FiSearch,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiCheckCircle,
    FiXCircle,
    FiPackage,
    FiAlertTriangle,
    FiBox,
    FiRefreshCw,
    FiEye,
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
    FiX,
} from "react-icons/fi";

import { toast } from "react-toastify";
import { API } from "../../api/axios";
import DataLoader from "../../components/DataLoader";
import { useSelector } from "react-redux";

import {
    Navigate,
    useNavigate,
    useParams,
} from "react-router-dom";

import DeleteModal from "../../components/inventory/DeleteModal";
import FormModal from "../../components/inventory/FormModal";

const initialFormData = {
    store: "",
    product: "",
    variant: "",
    quantity: "",
    reservedQuantity: "",
    reorderLevel: "",
    maxStockLevel: "",
};

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#003963] focus:bg-white focus:ring-2 focus:ring-[#003963]/10";

const StoreInventory = () => {
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const { storeId } = useParams();

    const permissions = user?.role?.permissions || [];

    const [dataLoading, setDataLoading] = useState(true);

    // INVENTORY SEARCH + PAGINATION
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [filteredCount, setFilteredCount] = useState(0);

    // STORE + INVENTORY
    const [store, setStore] = useState(null);
    const [inventories, setInventories] = useState([]);

    // DATABASE STATISTICS
    const [statistics, setStatistics] = useState({
        totalInventory: 0,
        activeInventory: 0,
        inactiveInventory: 0,
        lowStockInventory: 0,
    });

    // MODALS
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    // FORM DATA
    const [formData, setFormData] = useState({
        ...initialFormData,
    });

    // FETCH STORE INVENTORY WITH SEARCH + PAGINATION
    const getStoreInventory = async (
        page = currentPage,
        searchValue = debouncedSearch,
        pageLimit = limit
    ) => {
        try {

            const res = await API.get(
                `/inventory/store/${storeId}`,
                {
                    params: {
                        page,
                        limit: pageLimit,
                        search: searchValue,
                    },
                }
            );

            setStore(res.data.store || null);
            setInventories(res.data.inventories || []);

            // ALL STORE STATISTICS
            setStatistics(
                res.data.statistics || {
                    totalInventory: 0,
                    activeInventory: 0,
                    inactiveInventory: 0,
                    lowStockInventory: 0,
                }
            );

            // SEARCH + PAGINATION COUNTS
            setFilteredCount(res.data.filteredCount ?? res.data.count ?? 0);
            setTotalPages(res.data.totalPages || 0);
            setCurrentPage(res.data.currentPage || 1);

        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to fetch store inventory"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // SEARCH DEBOUNCE
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1);
            setDebouncedSearch(search.trim());
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    // FETCH INVENTORY WHEN PAGE / LIMIT / SEARCH CHANGES
    useEffect(() => {
        getStoreInventory(
            currentPage,
            debouncedSearch,
            limit
        );
    }, [
        storeId,
        currentPage,
        limit,
        debouncedSearch,
    ]);

    // RESET FORM
    const resetForm = () => {
        setFormData({
            ...initialFormData,
            store: storeId,
        });

        setEditId(null);
        setIsEdit(false);
    };

    // FORM CHANGE
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // OPEN ADD MODAL
    const handleAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    // OPEN EDIT MODAL
    const handleEditModal = (inventory) => {
        setEditId(inventory._id);
        setIsEdit(true);

        setFormData({
            store: inventory.store?._id || storeId,
            product: inventory.product?._id || "",
            variant: inventory.variant?._id || "",
            quantity: inventory.quantity ?? "",
            reservedQuantity: inventory.reservedQuantity ?? "",
            reorderLevel: inventory.reorderLevel ?? "",
            maxStockLevel: inventory.maxStockLevel ?? "",
        });

        setShowModal(true);
    };

    // BUILD PAYLOAD
    const buildPayload = () => ({
        store: storeId,
        product: formData.product,
        variant: formData.variant,
        quantity: Number(formData.quantity),
        reservedQuantity: Number(formData.reservedQuantity),
        reorderLevel: Number(formData.reorderLevel),
        maxStockLevel: Number(formData.maxStockLevel),
    });

    // ADD INVENTORY
    const handleAddInventory = async (e) => {
        e.preventDefault();

        try {
            setDataLoading(true);

            const res = await API.post(
                "/inventory/add",
                buildPayload()
            );

            toast.success(
                res.data.message || "Inventory created successfully"
            );

            setShowModal(false);
            resetForm();

            // New inventory should appear on first page
            setCurrentPage(1);

            await getStoreInventory(
                1,
                debouncedSearch,
                limit
            );

        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to create inventory"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // UPDATE INVENTORY
    const handleEditInventory = async (e) => {
        e.preventDefault();

        try {
            setDataLoading(true);

            const res = await API.put(
                `/inventory/update/${editId}`,
                buildPayload()
            );

            toast.success(
                res.data.message || "Inventory updated successfully"
            );

            setShowModal(false);
            resetForm();

            await getStoreInventory(
                currentPage,
                debouncedSearch,
                limit
            );

        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to update inventory"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // OPEN DELETE MODAL
    const handleDeleteModal = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    // DELETE INVENTORY
    const handleDeleteInventory = async () => {
        try {
            setDataLoading(true);

            const res = await API.delete(
                `/inventory/delete/${deleteId}`
            );

            toast.success(
                res.data.message || "Inventory deleted successfully"
            );

            setShowDeleteModal(false);
            setDeleteId(null);

            await getStoreInventory(
                currentPage,
                debouncedSearch,
                limit
            );

        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to delete inventory"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // CHANGE INVENTORY STATUS
    const changeStatus = async (inventory) => {
        try {
            setDataLoading(true);

            const res = await API.patch(
                `/inventory/update/status/${inventory._id}`
            );

            toast.success(
                res.data.message || "Inventory status updated"
            );

            await getStoreInventory(
                currentPage,
                debouncedSearch,
                limit
            );

        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to change inventory status"
            );
        } finally {
            setDataLoading(false);
        }
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
            startPage = Math.max(
                1,
                endPage - maxVisiblePages + 1
            );
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    const paginationNumbers = getPaginationNumbers();

    // DISPLAY RANGE
    const startItem =
        filteredCount === 0
            ? 0
            : (currentPage - 1) * limit + 1;

    const endItem = Math.min(
        currentPage * limit,
        filteredCount
    );

    // PAGE CHANGE
    const handlePageChange = (page) => {
        if (
            page < 1 ||
            page > totalPages ||
            page === currentPage
        ) {
            return;
        }

        setCurrentPage(page);
    };

    // ENTRIES CHANGE
    const handleLimitChange = (e) => {
        setLimit(Number(e.target.value));
        setCurrentPage(1);
    };

    // PERMISSION CHECK
    if (
        !permissions.some((permission) =>
            permission.startsWith("inventory:")
        )
    ) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (dataLoading) {
        return <DataLoader />;
    }

    if (!store) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <FiBox
                    size={42}
                    className="mx-auto text-slate-300"
                />

                <h2 className="mt-3 text-lg font-bold text-slate-800">
                    Store not found
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    The requested store could not be found.
                </p>

                <button
                    type="button"
                    onClick={() => navigate("/admin/inventory")}
                    className="mt-5 rounded-xl bg-[#003963] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002d4f]"
                >
                    Back to Inventory
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* PAGE HEADER */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <button
                        type="button"
                        onClick={() => navigate("/admin/inventory")}
                        className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#003963] transition hover:text-blue-700"
                    >
                        <FiArrowLeft size={17} />
                        Back to Stores
                    </button>

                    <h1 className="text-2xl font-bold text-slate-800">
                        {store.name}
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage products, variants and stock for this store.
                    </p>

                    <p className="mt-2 text-xs font-medium text-slate-400">
                        Store Code: {store.code || "—"}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">

                    {permissions.includes("inventory:add") && (
                        <button
                            type="button"
                            onClick={handleAddModal}
                            className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md active:scale-95"
                        >
                            <FiPlus size={19} />
                            Add Inventory
                        </button>
                    )}
                </div>
            </div>

            {/* STATISTICS */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                {/* TOTAL INVENTORY */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Total Inventory
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {statistics.totalInventory.toLocaleString("en-IN")}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#003963]">
                            <FiPackage size={24} />
                        </div>
                    </div>
                </div>

                {/* ACTIVE INVENTORY */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Active Inventory
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-green-600">
                                {statistics.activeInventory.toLocaleString("en-IN")}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                            <FiCheckCircle size={24} />
                        </div>
                    </div>
                </div>

                {/* INACTIVE INVENTORY */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Inactive Inventory
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-red-500">
                                {statistics.inactiveInventory.toLocaleString("en-IN")}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                            <FiXCircle size={24} />
                        </div>
                    </div>
                </div>

                {/* LOW STOCK */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Low Stock Items
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-amber-600">
                                {statistics.lowStockInventory.toLocaleString("en-IN")}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <FiAlertTriangle size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* SEARCH + ENTRIES */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    {/* SEARCH */}
                    <div className="relative w-full sm:max-w-md">
                        <FiSearch
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={19}
                        />

                        <input
                            type="text"
                            placeholder="Search product, variant or SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`${inputClass} pl-10 pr-10`}
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-red-500"
                                title="Clear search"
                            >
                                <FiX size={18} />
                            </button>
                        )}
                    </div>

                    {/* ENTRIES SELECT */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-slate-500">
                            Show
                        </span>

                        <select
                            value={limit}
                            onChange={handleLimitChange}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-[#047857] focus:ring-2 focus:ring-[#047857]/10"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>

                        <span className="text-sm text-slate-500">
                            entries
                        </span>
                    </div>
                </div>

                {/* RESULTS INFO */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    <p className="text-xs text-slate-500">
                        Showing{" "}
                        <span className="font-semibold text-slate-700">
                            {startItem}–{endItem}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-slate-700">
                            {filteredCount.toLocaleString("en-IN")}
                        </span>{" "}
                        inventories
                    </p>

                    {debouncedSearch && (
                        <p className="text-xs text-slate-500">
                            Search results for{" "}
                            <span className="font-semibold text-[#047857]">
                                "{debouncedSearch}"
                            </span>
                        </p>
                    )}
                </div>
            </div>

            {/* INVENTORY TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-200">

                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                {[
                                    "Product",
                                    "Variant",
                                    "Status",
                                    "Actions",
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {inventories.length > 0 ? (
                                inventories.map((item) => {
                                    const productName =
                                        typeof item.product === "object"
                                            ? item.product?.name
                                            : "Product";

                                    const variantName =
                                        typeof item.variant === "object"
                                            ? item.variant?.name ||
                                            item.variant?.sku
                                            : "Variant";

                                    const sku =
                                        typeof item.variant === "object"
                                            ? item.variant?.sku
                                            : "";

                                    return (
                                        <tr
                                            key={item._id}
                                            className="transition hover:bg-slate-50"
                                        >

                                            {/* PRODUCT */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#003963]">
                                                        <FiPackage size={20} />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-slate-800">
                                                            {productName}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            ID: {String(
                                                                item.product?._id ||
                                                                item.product ||
                                                                "—"
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* VARIANT */}
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-slate-700">
                                                    {variantName}
                                                </p>

                                                {sku && (
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        SKU: {sku}
                                                    </p>
                                                )}
                                            </td>

                                            {/* STATUS */}
                                            <td className="px-6 py-4">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        !permissions.includes(
                                                            "inventory:status"
                                                        )
                                                    }
                                                    onClick={() =>
                                                        changeStatus(item)
                                                    }
                                                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${item.status === "active"
                                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                        : "bg-red-100 text-red-700 hover:bg-red-200"
                                                        }`}
                                                >
                                                    {item.status || "inactive"}
                                                </button>
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">

                                                    {permissions.includes(
                                                        "inventory:read"
                                                    ) && (
                                                            <button
                                                                type="button"
                                                                title="View Inventory Details"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/admin/inventory/store/${storeId}/details/${item._id}`
                                                                    )
                                                                }
                                                                className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                            >
                                                                <FiEye size={18} />
                                                            </button>
                                                        )}

                                                    {permissions.includes(
                                                        "inventory:update"
                                                    ) && (
                                                            <button
                                                                type="button"
                                                                title="Edit Inventory"
                                                                onClick={() =>
                                                                    handleEditModal(item)
                                                                }
                                                                className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                                                            >
                                                                <FiEdit2 size={18} />
                                                            </button>
                                                        )}

                                                    {permissions.includes(
                                                        "inventory:delete"
                                                    ) && (
                                                            <button
                                                                type="button"
                                                                title="Delete Inventory"
                                                                onClick={() =>
                                                                    handleDeleteModal(
                                                                        item._id
                                                                    )
                                                                }
                                                                className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                                            >
                                                                <FiTrash2 size={18} />
                                                            </button>
                                                        )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-6 py-16 text-center"
                                    >
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
                                            <FiBox size={32} />
                                        </div>

                                        <p className="mt-4 font-semibold text-slate-700">
                                            No inventory found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            {debouncedSearch
                                                ? "Try searching with a different product, variant or SKU."
                                                : "Add inventory for this store to get started."}
                                        </p>

                                        {search && (
                                            <button
                                                type="button"
                                                onClick={() => setSearch("")}
                                                className="mt-3 text-sm font-semibold text-[#047857] hover:underline"
                                            >
                                                Clear search
                                            </button>
                                        )}
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
                            Page{" "}
                            <span className="font-semibold text-slate-800">
                                {currentPage}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-slate-800">
                                {totalPages}
                            </span>
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-1.5">

                            {/* FIRST PAGE */}
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(1)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#047857] hover:bg-emerald-50 hover:text-[#047857] disabled:cursor-not-allowed disabled:opacity-40"
                                title="First page"
                            >
                                <FiChevronsLeft size={17} />
                            </button>

                            {/* PREVIOUS PAGE */}
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#047857] hover:bg-emerald-50 hover:text-[#047857] disabled:cursor-not-allowed disabled:opacity-40"
                                title="Previous page"
                            >
                                <FiChevronLeft size={17} />
                            </button>

                            {/* FIRST NUMBER + ELLIPSIS */}
                            {paginationNumbers.length > 0 &&
                                paginationNumbers[0] > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => handlePageChange(1)}
                                            className="h-9 min-w-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:border-[#047857] hover:bg-emerald-50 hover:text-[#047857]"
                                        >
                                            1
                                        </button>

                                        {paginationNumbers[0] > 2 && (
                                            <span className="px-1 text-slate-400">
                                                ...
                                            </span>
                                        )}
                                    </>
                                )}

                            {/* PAGE NUMBERS */}
                            {paginationNumbers.map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => handlePageChange(page)}
                                    className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition ${currentPage === page
                                        ? "bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] text-white shadow-sm"
                                        : "border border-slate-200 text-slate-600 hover:border-[#047857] hover:bg-emerald-50 hover:text-[#047857]"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            {/* LAST NUMBER + ELLIPSIS */}
                            {paginationNumbers.length > 0 &&
                                paginationNumbers[paginationNumbers.length - 1] < totalPages && (
                                    <>
                                        {paginationNumbers[paginationNumbers.length - 1] < totalPages - 1 && (
                                            <span className="px-1 text-slate-400">
                                                ...
                                            </span>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handlePageChange(totalPages)
                                            }
                                            className="h-9 min-w-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:border-[#047857] hover:bg-emerald-50 hover:text-[#047857]"
                                        >
                                            {totalPages}
                                        </button>
                                    </>
                                )}

                            {/* NEXT PAGE */}
                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    handlePageChange(currentPage + 1)
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
                                onClick={() =>
                                    handlePageChange(totalPages)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#047857] hover:bg-emerald-50 hover:text-[#047857] disabled:cursor-not-allowed disabled:opacity-40"
                                title="Last page"
                            >
                                <FiChevronsRight size={17} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ADD / EDIT MODAL */}
            {showModal && (
                <FormModal
                    isEdit={isEdit}
                    setShowModal={setShowModal}
                    resetForm={resetForm}
                    handleEditInventory={handleEditInventory}
                    handleAddInventory={handleAddInventory}
                    formData={formData}
                    handleChange={handleChange}
                    inputClass={inputClass}
                    store={store}
                    initialProduct={
                        inventories.find((item) => item._id === editId)?.product || null
                    }
                    initialVariant={
                        inventories.find((item) => item._id === editId)?.variant || null
                    }
                />
            )}

            {/* DELETE MODAL */}
            {showDeleteModal && (
                <DeleteModal
                    setShowDeleteModal={setShowDeleteModal}
                    handleDeleteInventory={handleDeleteInventory}
                    setDeleteId={setDeleteId}
                />
            )}
        </div>
    );
};

export default StoreInventory;