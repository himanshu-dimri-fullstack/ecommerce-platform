import { Link, useParams, Navigate } from "react-router-dom";
import {
    FiArrowLeft,
    FiPackage,
    FiHash,
    FiLayers,
    FiBox,
    FiCalendar,
    FiClock,
    FiCheckCircle,
    FiAlertTriangle,
    FiTrendingUp,
    FiActivity,
    FiShoppingCart,
    FiRefreshCw,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import { API } from "../../api/axios";
import DataLoader from "../../components/DataLoader";
import { useSelector } from "react-redux";

const InventoryDetail = () => {
    const { id } = useParams();

    const user = useSelector((store) => store.auth.user);

    const [dataLoading, setDataLoading] = useState(true);
    const [inventory, setInventory] = useState({});

    // FETCH INVENTORY DETAILS
    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const res = await API.get(`/store-inventory/${id}`);

                setInventory(res.data.inventory || {});
            } catch (error) {
                console.error(error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchInventory();
    }, [id]);

    // LOADER
    if (dataLoading) {
        return <DataLoader />;
    }

    // PERMISSION
    if (
        !user?.role?.permissions?.some(
            (permission) => permission === "inventory:read"
        )
    ) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // REFERENCES
    const store =
        typeof inventory.store === "object" && inventory.store !== null
            ? inventory.store
            : null;

    const product =
        typeof inventory.product === "object" && inventory.product !== null
            ? inventory.product
            : null;

    const variant =
        typeof inventory.variant === "object" && inventory.variant !== null
            ? inventory.variant
            : null;

    // QUANTITIES
    const quantity = Number(inventory.quantity || 0);
    const reservedQuantity = Number(inventory.reservedQuantity || 0);

    const availableQuantity =
        inventory.availableQuantity != null
            ? Number(inventory.availableQuantity)
            : quantity - reservedQuantity;

    const reorderLevel = Number(inventory.reorderLevel || 0);
    const maxStockLevel = Number(inventory.maxStockLevel || 0);

    const isActive = inventory.status?.toLowerCase() === "active";

    const isLowStock = availableQuantity <= reorderLevel;

    const isOutOfStock = availableQuantity <= 0;

    const stockPercentage =
        maxStockLevel > 0
            ? Math.min((quantity / maxStockLevel) * 100, 100)
            : 0;

    // DATE FORMAT
    const formatDate = (date, includeTime = false) => {
        if (!date) return "-";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return "-";

        return includeTime
            ? parsedDate.toLocaleString()
            : parsedDate.toLocaleDateString();
    };

    // REFERENCE NAME
    const getReferenceName = (reference, fallback = "-") => {
        if (!reference) return fallback;

        if (typeof reference === "string") {
            return reference;
        }

        return (
            reference.name ||
            reference.title ||
            reference.sku ||
            reference.code ||
            reference._id ||
            fallback
        );
    };

    // REFERENCE ID
    const getReferenceId = (reference) => {
        if (!reference) return "-";

        if (typeof reference === "string") {
            return reference;
        }

        return reference._id || "-";
    };

    // STOCK STATUS
    const getStockStatus = () => {
        if (isOutOfStock) {
            return {
                label: "Out of Stock",
                className: "bg-red-100 text-red-700",
            };
        }

        if (isLowStock) {
            return {
                label: "Low Stock",
                className: "bg-amber-100 text-amber-700",
            };
        }

        return {
            label: "In Stock",
            className: "bg-green-100 text-green-700",
        };
    };

    const stockStatus = getStockStatus();

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">

            {/* HEADER */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">

                        <Link
                            to="/admin/inventory"
                            className="transition hover:text-[#003963]"
                        >
                            Inventory
                        </Link>

                        <span>/</span>

                        <span className="text-gray-700">
                            Inventory Details
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                        Inventory Details
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        View complete stock information and inventory levels.
                    </p>
                </div>

                <Link
                    to="/admin/inventory"
                    className="flex items-center gap-2 self-start rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                    <FiArrowLeft />
                    Back
                </Link>

            </div>

            {/* MAIN CONTENT */}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                {/* INVENTORY PROFILE CARD */}

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                    <div className="flex flex-col items-center text-center">

                        {/* INVENTORY ICON */}

                        <div className="mb-5 flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-[#003963] text-white shadow-sm">
                            <FiPackage size={48} />
                        </div>

                        <h2 className="text-xl font-bold text-gray-800">
                            {getReferenceName(inventory.product, "Inventory")}
                        </h2>

                        <p className="mt-1 break-all text-sm text-gray-500">
                            {getReferenceName(inventory.variant, "No Variant")}
                        </p>

                        {/* INVENTORY STATUS */}

                        <span
                            className={`mt-4 rounded-full px-4 py-1.5 text-xs font-semibold ${isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                        >
                            {inventory.status || "Inactive"}
                        </span>

                        {/* STOCK STATUS */}

                        <span
                            className={`mt-2 rounded-full px-4 py-1.5 text-xs font-semibold ${stockStatus.className}`}
                        >
                            {stockStatus.label}
                        </span>

                    </div>

                    <div className="my-6 border-t border-gray-100" />

                    <div className="space-y-4">

                        {/* INVENTORY ID */}

                        <div className="flex items-center gap-3">

                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiHash className="text-[#003963]" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">
                                    Inventory ID
                                </p>

                                <p className="break-all font-medium text-gray-800">
                                    {inventory._id || "-"}
                                </p>
                            </div>

                        </div>

                        {/* STORE */}

                        <div className="flex items-center gap-3">

                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiLayers className="text-[#003963]" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">
                                    Store
                                </p>

                                <p className="wrap-break-words font-medium text-gray-800">
                                    {getReferenceName(inventory.store)}
                                </p>
                            </div>

                        </div>

                        {/* PRODUCT */}

                        <div className="flex items-center gap-3">

                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiBox className="text-[#003963]" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">
                                    Product
                                </p>

                                <p className="wrap-break-words font-medium text-gray-800">
                                    {getReferenceName(inventory.product)}
                                </p>
                            </div>

                        </div>

                        {/* VARIANT */}

                        <div className="flex items-center gap-3">

                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiPackage className="text-[#003963]" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">
                                    Product Variant
                                </p>

                                <p className="wrap-break-words font-medium text-gray-800">
                                    {getReferenceName(inventory.variant)}
                                </p>
                            </div>

                        </div>

                        {/* LAST RESTOCKED */}

                        <div className="flex items-center gap-3">

                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiRefreshCw className="text-[#003963]" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">
                                    Last Restocked
                                </p>

                                <p className="font-medium text-gray-800">
                                    {formatDate(inventory.lastRestockedAt)}
                                </p>
                            </div>

                        </div>

                        {/* CREATED DATE */}

                        <div className="flex items-center gap-3">

                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiCalendar className="text-[#003963]" />
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Created
                                </p>

                                <p className="font-medium text-gray-800">
                                    {formatDate(inventory.createdAt)}
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

                {/* INVENTORY INFORMATION */}

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">

                    <div className="mb-6">

                        <h2 className="text-lg font-bold text-gray-800">
                            Inventory Information
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Stock quantities, inventory limits and operational details.
                        </p>

                    </div>

                    {/* QUANTITY STATISTICS */}

                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

                        {/* TOTAL STOCK */}

                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-sm font-medium text-blue-800">
                                    Total Stock
                                </span>

                                <FiPackage className="text-blue-700" size={20} />
                            </div>

                            <p className="text-3xl font-bold text-blue-800">
                                {quantity}
                            </p>

                            <p className="mt-1 text-xs text-blue-700">
                                Physical inventory
                            </p>

                        </div>

                        {/* RESERVED STOCK */}

                        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">

                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-sm font-medium text-amber-800">
                                    Reserved
                                </span>

                                <FiShoppingCart
                                    className="text-amber-700"
                                    size={20}
                                />
                            </div>

                            <p className="text-3xl font-bold text-amber-800">
                                {reservedQuantity}
                            </p>

                            <p className="mt-1 text-xs text-amber-700">
                                Units reserved
                            </p>

                        </div>

                        {/* AVAILABLE STOCK */}

                        <div className="rounded-xl border border-green-100 bg-green-50 p-4">

                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-sm font-medium text-green-800">
                                    Available
                                </span>

                                <FiCheckCircle
                                    className="text-green-700"
                                    size={20}
                                />
                            </div>

                            <p className="text-3xl font-bold text-green-800">
                                {availableQuantity}
                            </p>

                            <p className="mt-1 text-xs text-green-700">
                                Available for sale
                            </p>

                        </div>

                    </div>

                    {/* STOCK CAPACITY */}

                    <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-5">

                        <div className="mb-3 flex items-center justify-between gap-3">

                            <div>
                                <h3 className="font-semibold text-gray-800">
                                    Stock Capacity
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    Current stock compared to maximum stock level.
                                </p>
                            </div>

                            <span className="text-lg font-bold text-[#003963]">
                                {stockPercentage.toFixed(0)}%
                            </span>

                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-gray-200">

                            <div
                                className={`h-full rounded-full transition-all ${isLowStock
                                        ? "bg-amber-500"
                                        : "bg-[#003963]"
                                    }`}
                                style={{
                                    width: `${stockPercentage}%`,
                                }}
                            />

                        </div>

                        <div className="mt-3 flex justify-between text-xs text-gray-500">
                            <span>0 units</span>

                            <span>
                                Maximum: {maxStockLevel} units
                            </span>
                        </div>

                    </div>

                    {/* INVENTORY DETAILS */}

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        {/* STORE NAME */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiLayers />
                                <span className="text-sm">Store</span>
                            </div>

                            <p className="wrap-break-words font-semibold text-gray-800">
                                {getReferenceName(inventory.store)}
                            </p>

                        </div>

                        {/* STORE ID */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiHash />
                                <span className="text-sm">Store ID</span>
                            </div>

                            <p className="break-all font-semibold text-gray-800">
                                {getReferenceId(inventory.store)}
                            </p>

                        </div>

                        {/* PRODUCT NAME */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiBox />
                                <span className="text-sm">Product</span>
                            </div>

                            <p className="wrap-break-words font-semibold text-gray-800">
                                {getReferenceName(inventory.product)}
                            </p>

                        </div>

                        {/* PRODUCT ID */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiHash />
                                <span className="text-sm">Product ID</span>
                            </div>

                            <p className="break-all font-semibold text-gray-800">
                                {getReferenceId(inventory.product)}
                            </p>

                        </div>

                        {/* VARIANT NAME */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiPackage />
                                <span className="text-sm">Product Variant</span>
                            </div>

                            <p className="wrap-break-words font-semibold text-gray-800">
                                {getReferenceName(inventory.variant)}
                            </p>

                        </div>

                        {/* VARIANT ID */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiHash />
                                <span className="text-sm">Variant ID</span>
                            </div>

                            <p className="break-all font-semibold text-gray-800">
                                {getReferenceId(inventory.variant)}
                            </p>

                        </div>

                        {/* REORDER LEVEL */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiAlertTriangle />
                                <span className="text-sm">Reorder Level</span>
                            </div>

                            <p className="font-semibold text-gray-800">
                                {reorderLevel} units
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                Restock threshold
                            </p>

                        </div>

                        {/* MAXIMUM STOCK */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiTrendingUp />
                                <span className="text-sm">Maximum Stock Level</span>
                            </div>

                            <p className="font-semibold text-gray-800">
                                {maxStockLevel} units
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                Maximum desired stock
                            </p>

                        </div>

                        {/* INVENTORY STATUS */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiCheckCircle />
                                <span className="text-sm">Inventory Status</span>
                            </div>

                            <p className="font-semibold text-gray-800">
                                {inventory.status || "Inactive"}
                            </p>

                        </div>

                        {/* STOCK STATUS */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiActivity />
                                <span className="text-sm">Stock Status</span>
                            </div>

                            <span
                                className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${stockStatus.className}`}
                            >
                                {stockStatus.label}
                            </span>

                        </div>

                        {/* INVENTORY ID */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 md:col-span-2">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiHash />
                                <span className="text-sm">Inventory ID</span>
                            </div>

                            <p className="break-all font-semibold text-gray-800">
                                {inventory._id || "-"}
                            </p>

                        </div>

                    </div>

                    {/* STOCK ALERT */}

                    {isLowStock && (

                        <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">

                            <FiAlertTriangle
                                className="mt-0.5 shrink-0 text-amber-600"
                                size={20}
                            />

                            <div>

                                <h3 className="font-semibold text-amber-800">
                                    {isOutOfStock
                                        ? "Out of Stock"
                                        : "Low Stock Alert"}
                                </h3>

                                <p className="mt-1 text-sm leading-6 text-amber-700">
                                    {isOutOfStock
                                        ? "No available units remain. Restock this inventory before accepting additional orders."
                                        : `Available stock is ${availableQuantity} units, which has reached or fallen below the reorder level of ${reorderLevel} units. Consider restocking.`}
                                </p>

                            </div>

                        </div>

                    )}

                    {/* LAST RESTOCKED */}

                    <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">

                        <div className="mb-2 flex items-center gap-2 text-gray-500">
                            <FiRefreshCw />
                            <span className="text-sm">
                                Last Restocked At
                            </span>
                        </div>

                        <p className="font-semibold text-gray-800">
                            {formatDate(inventory.lastRestockedAt, true)}
                        </p>

                    </div>

                    {/* TIMELINE */}

                    <div className="mt-8 border-t border-gray-100 pt-6">

                        <h2 className="mb-5 text-lg font-bold text-gray-800">
                            Inventory Timeline
                        </h2>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                            {/* CREATED */}

                            <div className="flex items-center gap-4 rounded-xl border border-gray-100 p-4">

                                <div className="rounded-lg bg-green-50 p-3">
                                    <FiCalendar className="text-green-600" />
                                </div>

                                <div className="min-w-0">

                                    <p className="text-xs text-gray-500">
                                        Inventory Created
                                    </p>

                                    <p className="wrap-break-words font-medium text-gray-800">
                                        {formatDate(inventory.createdAt, true)}
                                    </p>

                                </div>

                            </div>

                            {/* UPDATED */}

                            <div className="flex items-center gap-4 rounded-xl border border-gray-100 p-4">

                                <div className="rounded-lg bg-blue-50 p-3">
                                    <FiClock className="text-[#003963]" />
                                </div>

                                <div className="min-w-0">

                                    <p className="text-xs text-gray-500">
                                        Last Updated
                                    </p>

                                    <p className="wrap-break-words font-medium text-gray-800">
                                        {formatDate(inventory.updatedAt, true)}
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default InventoryDetail;