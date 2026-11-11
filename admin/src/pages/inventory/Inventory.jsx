
import React, { useEffect, useState } from "react";

import {
    FiSearch,
    FiRefreshCw,
    FiLayers,
    FiPackage,
    FiCheckCircle,
    FiAlertTriangle,
    FiArrowRight,
    FiBox,
} from "react-icons/fi";

import { toast } from "react-toastify";
import { API } from "../../api/axios";
import DataLoader from "../../components/DataLoader";
import { useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#003963] focus:bg-white focus:ring-2 focus:ring-[#003963]/10";

const Inventory = () => {
    const user = useSelector((store) => store.auth.user);
    const navigate = useNavigate();

    const [dataLoading, setDataLoading] = useState(true);
    const [stores, setStores] = useState([]);
    const [search, setSearch] = useState("");

    // USER ROLE
    const roleName = (
        user?.role?.name ||
        user?.role?.roleName ||
        (typeof user?.role === "string" ? user.role : "")
    ).toLowerCase();

    const isManager = roleName === "manager";

    // USER ID
    const userId = user?._id || user?.id;

    // FETCH STORES WITH INVENTORY SUMMARY
    const getAllStores = async () => {
        try {
            const res = await API.get("/inventory/get");

            setStores(res.data.stores || []);
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

    // REFRESH
    const handleRefresh = async () => {
        setDataLoading(true);
        await getAllStores();
    };

    // ROLE-BASED STORE FILTER
    // Backend also filters stores for managers.
    // This is an additional frontend safeguard.
    const visibleStores = isManager
        ? stores.filter((store) => {
            const managerId =
                store.manager?._id || store.manager;

            return String(managerId) === String(userId);
        })
        : stores;

    // SEARCH
    const filteredStores = visibleStores.filter((store) => {
        const searchValue = search.toLowerCase();

        return (
            store.name?.toLowerCase().includes(searchValue) ||
            store.code?.toLowerCase().includes(searchValue) ||
            store.address?.toLowerCase().includes(searchValue)
        );
    });

    // STATISTICS
    const totalStores = visibleStores.length;

    const totalProducts = visibleStores.reduce(
        (total, store) =>
            total + Number(store.summary?.totalProducts || 0),
        0
    );

    const activeProducts = visibleStores.reduce(
        (total, store) =>
            total + Number(store.summary?.activeProducts || 0),
        0
    );

    const lowStockItems = visibleStores.reduce(
        (total, store) =>
            total + Number(store.summary?.lowStockItems || 0),
        0
    );

    // OPEN STORE INVENTORY
    const handleStoreClick = (storeId) => {
        navigate(`/admin/inventory/store/${storeId}`);
    };

    // INITIAL FETCH
    useEffect(() => {
        getAllStores();
    }, []);

    // PERMISSION
    if (
        !user?.role?.permissions?.some((permission) =>
            permission.startsWith("inventory:")
        )
    ) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (dataLoading) {
        return <DataLoader />;
    }

    return (
        <div className="space-y-6">

            {/* PAGE HEADER */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Inventory Management
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Select a store to manage its products and stock.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleRefresh}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                >
                    <FiRefreshCw size={17} />
                    Refresh
                </button>
            </div>

            {/* STATISTICS */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                {/* TOTAL STORES */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Total Stores
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {totalStores}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#003963]">
                            <FiLayers size={24} />
                        </div>
                    </div>
                </div>

                {/* TOTAL PRODUCTS */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Total Inventory Items
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {totalProducts}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <FiPackage size={24} />
                        </div>
                    </div>
                </div>

                {/* ACTIVE PRODUCTS */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Active Items
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-green-600">
                                {activeProducts}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                            <FiCheckCircle size={24} />
                        </div>
                    </div>
                </div>

                {/* LOW STOCK */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Low Stock Items
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-amber-600">
                                {lowStockItems}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <FiAlertTriangle size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* SEARCH */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="relative w-full sm:max-w-md">
                    <FiSearch
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={19}
                    />

                    <input
                        type="text"
                        placeholder="Search store by name, code or address..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`${inputClass} pl-10`}
                    />
                </div>
            </div>

            {/* STORE LIST */}
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            Your Stores
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Choose a store to view its inventory.
                        </p>
                    </div>

                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        {filteredStores.length} Stores
                    </span>
                </div>

                {filteredStores.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                        {filteredStores.map((store) => (
                            <div
                                key={store._id}
                                onClick={() => handleStoreClick(store._id)}
                                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#003963]/30 hover:shadow-lg"
                            >
                                {/* STORE HEADER */}
                                <div className="flex items-start justify-between">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#003963] transition group-hover:bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] group-hover:text-white">
                                            <FiLayers size={23} />
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className="truncate text-base font-bold text-slate-800">
                                                {store.name}
                                            </h3>

                                            <p className="mt-1 text-xs font-medium text-slate-400">
                                                Code: {store.code || "—"}
                                            </p>
                                        </div>
                                    </div>

                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${store.status === "active"
                                                ? "bg-green-50 text-green-700"
                                                : "bg-red-50 text-red-600"
                                            }`}
                                    >
                                        {store.status || "inactive"}
                                    </span>
                                </div>

                                {/* ADDRESS */}
                                <p className="mt-4 min-h-10 text-sm leading-5 text-slate-500">
                                    {store.address || "No address available"}
                                </p>

                                {/* SUMMARY */}
                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <div className="rounded-xl bg-slate-50 p-3">
                                        <p className="text-xs font-medium text-slate-500">
                                            Total Items
                                        </p>

                                        <p className="mt-1 text-xl font-bold text-slate-800">
                                            {store.summary?.totalProducts || 0}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-green-50 p-3">
                                        <p className="text-xs font-medium text-green-700">
                                            Active Items
                                        </p>

                                        <p className="mt-1 text-xl font-bold text-green-700">
                                            {store.summary?.activeProducts || 0}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-red-50 p-3">
                                        <p className="text-xs font-medium text-red-600">
                                            Inactive Items
                                        </p>

                                        <p className="mt-1 text-xl font-bold text-red-600">
                                            {store.summary?.inactiveProducts || 0}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-amber-50 p-3">
                                        <p className="text-xs font-medium text-amber-700">
                                            Low Stock
                                        </p>

                                        <p className="mt-1 text-xl font-bold text-amber-700">
                                            {store.summary?.lowStockItems || 0}
                                        </p>
                                    </div>
                                </div>

                                {/* FOOTER */}
                                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                                    <span className="text-sm font-semibold text-[#003963]">
                                        View Inventory
                                    </span>

                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#003963] transition group-hover:bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] group-hover:text-white">
                                        <FiArrowRight size={17} />
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center shadow-sm">
                        <FiBox
                            size={42}
                            className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 font-semibold text-slate-700">
                            No stores found
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                            {search
                                ? "Try changing your search."
                                : isManager
                                    ? "No stores are assigned to you."
                                    : "No stores are available."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Inventory;
