import React, { useEffect, useState } from "react";
import {
    FiSearch,
    FiPlus,
    FiEye,
    FiEdit2,
    FiTrash2,
    FiCheckCircle,
    FiXCircle,
    FiPackage,
    FiAlertTriangle,
    FiX,
    FiRefreshCw,
    FiBox,
    FiLayers,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { API } from "../../api/axios";
import DataLoader from "../../components/DataLoader";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import DeleteModal from "../../components/inventory/DeleteModal";
import FormModal from "../../components/inventory/FormModal";

const initialFormData = {
    store: "",
    product: "",
    variant: "",
    quantity: "0",
    reservedQuantity: "0",
    reorderLevel: "10",
    maxStockLevel: "100",
    status: "active",
};

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#003963] focus:bg-white focus:ring-2 focus:ring-[#003963]/10";

const Inventory = () => {
    const user = useSelector((store) => store.auth.user);

    const [dataLoading, setDataLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [inventories, setInventories] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [selectedInventory, setSelectedInventory] = useState(null);

    const [formData, setFormData] = useState({ ...initialFormData });

    // STATISTICS
    const totalInventory = inventories.length;

    const activeInventory = inventories.filter(
        (item) => item.status === "active"
    ).length;

    const inactiveInventory = inventories.filter(
        (item) => item.status === "inactive"
    ).length;

    const lowStockInventory = inventories.filter(
        (item) =>
            item.status === "active" &&
            Number(item.availableQuantity) <= Number(item.reorderLevel)
    ).length;

    // FETCH ALL INVENTORY
    const getAllInventory = async () => {
        try {
            const res = await API.get("/store-inventory");

            setInventories(
                res.data.inventories || []
            );
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to fetch inventory"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // RESET FORM
    const resetForm = () => {
        setFormData({ ...initialFormData });
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
            store: inventory.store?._id || inventory.store || "",
            product: inventory.product?._id || inventory.product || "",
            variant: inventory.variant?._id || inventory.variant || "",
            quantity: String(inventory.quantity ?? 0),
            reservedQuantity: String(inventory.reservedQuantity ?? 0),
            reorderLevel: String(inventory.reorderLevel ?? 10),
            maxStockLevel: String(inventory.maxStockLevel ?? 100),
            status: inventory.status || "active",
        });

        setShowModal(true);
    };

    // VALIDATE FORM
    const validateForm = () => {
        if (!formData.store.trim()) {
            toast.error("Store ID is required");
            return false;
        }

        if (!formData.product.trim()) {
            toast.error("Product ID is required");
            return false;
        }

        if (!formData.variant.trim()) {
            toast.error("Variant ID is required");
            return false;
        }

        const quantity = Number(formData.quantity);
        const reservedQuantity = Number(formData.reservedQuantity);
        const reorderLevel = Number(formData.reorderLevel);
        const maxStockLevel = Number(formData.maxStockLevel);

        const values = [
            quantity,
            reservedQuantity,
            reorderLevel,
            maxStockLevel,
        ];

        if (
            values.some(
                (value) =>
                    !Number.isFinite(value) ||
                    value < 0 ||
                    !Number.isInteger(value)
            )
        ) {
            toast.error("Stock quantities must be valid non-negative integers");
            return false;
        }

        if (reservedQuantity > quantity) {
            toast.error(
                "Reserved quantity cannot exceed total quantity"
            );
            return false;
        }

        if (maxStockLevel < quantity) {
            toast.error(
                "Maximum stock level cannot be less than total quantity"
            );
            return false;
        }

        return true;
    };

    // BUILD INVENTORY PAYLOAD
    const buildPayload = () => {
        const quantity = Number(formData.quantity);
        const reservedQuantity = Number(formData.reservedQuantity);

        return {
            store: formData.store.trim(),
            product: formData.product.trim(),
            variant: formData.variant.trim(),
            quantity,
            reservedQuantity,
            availableQuantity: quantity - reservedQuantity,
            reorderLevel: Number(formData.reorderLevel),
            maxStockLevel: Number(formData.maxStockLevel),
            status: formData.status,
        };
    };

    // ADD INVENTORY
    const handleAddInventory = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setDataLoading(true);

            const res = await API.post(
                "/store-inventory",
                buildPayload()
            );

            toast.success(
                res.data.message || "Inventory created successfully"
            );

            setShowModal(false);
            resetForm();

            await getAllInventory();
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

        if (!validateForm()) return;

        try {
            setDataLoading(true);

            const res = await API.put(
                `/store-inventory/${editId}`,
                buildPayload()
            );

            toast.success(
                res.data.message || "Inventory updated successfully"
            );

            setShowModal(false);
            resetForm();

            await getAllInventory();
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
                `/store-inventory/${deleteId}`
            );

            toast.success(
                res.data.message || "Inventory deleted successfully"
            );

            setShowDeleteModal(false);
            setDeleteId(null);

            await getAllInventory();
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

    // CHANGE STATUS
    const changeStatus = async (inventory) => {
        try {
            setDataLoading(true);

            const newStatus =
                inventory.status === "active" ? "inactive" : "active";

            const res = await API.put(
                `/store-inventory/${inventory._id}`,
                {
                    status: newStatus,
                }
            );

            toast.success(
                res.data.message || "Inventory status updated"
            );

            await getAllInventory();
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

    // SEARCH
    const filteredInventory = inventories.filter((item) => {
        const searchValue = search.toLowerCase();

        const storeName =
            typeof item.store === "object"
                ? item.store?.name || ""
                : "";

        const productName =
            typeof item.product === "object"
                ? item.product?.name || ""
                : "";

        const variantName =
            typeof item.variant === "object"
                ? item.variant?.name || item.variant?.sku || ""
                : "";

        return (
            storeName.toLowerCase().includes(searchValue) ||
            productName.toLowerCase().includes(searchValue) ||
            variantName.toLowerCase().includes(searchValue) ||
            String(item.store?._id || item.store || "")
                .toLowerCase()
                .includes(searchValue) ||
            String(item.product?._id || item.product || "")
                .toLowerCase()
                .includes(searchValue) ||
            String(item.variant?._id || item.variant || "")
                .toLowerCase()
                .includes(searchValue) ||
            item.status?.toLowerCase().includes(searchValue)
        );
    });

    // INITIAL FETCH
    useEffect(() => {
        getAllInventory();
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
                        Manage store stock, reserved quantities and stock levels.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={getAllInventory}
                    className="flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    <FiRefreshCw size={17} />
                    Refresh
                </button>
            </div>

            {/* STATISTICS */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                {/* TOTAL */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Total Inventory
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {totalInventory}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#003963]">
                            <FiPackage size={24} />
                        </div>
                    </div>
                </div>

                {/* ACTIVE */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Active Inventory
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-green-600">
                                {activeInventory}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                            <FiCheckCircle size={24} />
                        </div>
                    </div>
                </div>

                {/* INACTIVE */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Inactive Inventory
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-red-500">
                                {inactiveInventory}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                            <FiXCircle size={24} />
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
                                {lowStockInventory}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <FiAlertTriangle size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* SEARCH + ADD */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div className="relative w-full sm:max-w-md">
                        <FiSearch
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={19}
                        />

                        <input
                            type="text"
                            placeholder="Search store, product, variant or status..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`${inputClass} pl-10`}
                        />
                    </div>

                    {user?.role?.permissions?.includes("inventory:add") && (
                        <button
                            type="button"
                            onClick={handleAddModal}
                            className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] px-5 py-2.5 text-sm font-semibold text-white transition active:scale-95"
                        >
                            <FiPlus size={19} />
                            Add Inventory
                        </button>
                    )}
                </div>
            </div>

            {/* INVENTORY TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-275">
                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                {[
                                    "Store",
                                    "Product",
                                    "Variant",
                                    "Total Stock",
                                    "Reserved",
                                    "Available",
                                    "Stock Status",
                                    "Status",
                                    "Actions",
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredInventory.length > 0 ? (
                                filteredInventory.map((item) => {
                                    const storeName =
                                        typeof item.store === "object"
                                            ? item.store?.name
                                            : null;

                                    const productName =
                                        typeof item.product === "object"
                                            ? item.product?.name
                                            : null;

                                    const variantName =
                                        typeof item.variant === "object"
                                            ? item.variant?.name ||
                                            item.variant?.sku
                                            : null;

                                    const isLowStock =
                                        Number(item.availableQuantity) <=
                                        Number(item.reorderLevel);

                                    return (
                                        <tr
                                            key={item._id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            {/* STORE */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FiLayers
                                                        className="shrink-0 text-[#003963]"
                                                        size={17}
                                                    />

                                                    <div>
                                                        <p className="font-semibold text-slate-800">
                                                            {storeName || "Store"}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {String(
                                                                item.store?._id ||
                                                                item.store ||
                                                                "—"
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* PRODUCT */}
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-slate-800">
                                                    {productName || "Product"}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    {String(
                                                        item.product?._id ||
                                                        item.product ||
                                                        "—"
                                                    )}
                                                </p>
                                            </td>

                                            {/* VARIANT */}
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-slate-700">
                                                    {variantName || "Variant"}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    {String(
                                                        item.variant?._id ||
                                                        item.variant ||
                                                        "—"
                                                    )}
                                                </p>
                                            </td>

                                            {/* TOTAL */}
                                            <td className="px-5 py-4">
                                                <span className="font-semibold text-slate-800">
                                                    {item.quantity}
                                                </span>
                                            </td>

                                            {/* RESERVED */}
                                            <td className="px-5 py-4">
                                                <span className="font-medium text-amber-600">
                                                    {item.reservedQuantity}
                                                </span>
                                            </td>

                                            {/* AVAILABLE */}
                                            <td className="px-5 py-4">
                                                <span className="font-semibold text-green-700">
                                                    {item.availableQuantity}
                                                </span>
                                            </td>

                                            {/* STOCK STATUS */}
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold ${isLowStock
                                                        ? "bg-amber-100 text-amber-700"
                                                        : "bg-green-100 text-green-700"
                                                        }`}
                                                >
                                                    {isLowStock
                                                        ? "Low Stock"
                                                        : "In Stock"}
                                                </span>
                                            </td>

                                            {/* STATUS */}
                                            <td className="px-5 py-4">
                                                {user?.role?.permissions?.includes(
                                                    "inventory:update"
                                                ) ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            changeStatus(item)
                                                        }
                                                        className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${item.status === "active"
                                                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                            : "bg-red-100 text-red-700 hover:bg-red-200"
                                                            }`}
                                                    >
                                                        {item.status || "inactive"}
                                                    </button>
                                                ) : (
                                                    <span className="text-sm text-slate-600">
                                                        {item.status || "inactive"}
                                                    </span>
                                                )}
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">

                                                    {user?.role?.permissions?.includes(
                                                        "inventory:read"
                                                    ) && (
                                                            <button
                                                                type="button"
                                                                title="View Inventory"
                                                                onClick={() => {
                                                                    setSelectedInventory(item);
                                                                    setShowViewModal(true);
                                                                }}
                                                                className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                            >
                                                                <FiEye size={18} />
                                                            </button>
                                                        )}

                                                    {user?.role?.permissions?.includes(
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

                                                    {user?.role?.permissions?.includes(
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
                                        colSpan={9}
                                        className="px-6 py-12 text-center"
                                    >
                                        <FiBox
                                            size={40}
                                            className="mx-auto text-slate-300"
                                        />

                                        <p className="mt-3 font-medium text-slate-600">
                                            No inventory found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            Try changing your search or add new inventory.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
                />
            )}

            {/* VIEW INVENTORY MODAL */}
            {showViewModal && selectedInventory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
                    <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">
                                    Inventory Details
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Complete stock information
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowViewModal(false);
                                    setSelectedInventory(null);
                                }}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                            >
                                <FiX size={21} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                            {[
                                ["Inventory ID", selectedInventory._id],
                                [
                                    "Store",
                                    selectedInventory.store?.name ||
                                    selectedInventory.store?._id ||
                                    selectedInventory.store,
                                ],
                                [
                                    "Product",
                                    selectedInventory.product?.name ||
                                    selectedInventory.product?._id ||
                                    selectedInventory.product,
                                ],
                                [
                                    "Variant",
                                    selectedInventory.variant?.name ||
                                    selectedInventory.variant?.sku ||
                                    selectedInventory.variant?._id ||
                                    selectedInventory.variant,
                                ],
                                ["Total Quantity", selectedInventory.quantity],
                                [
                                    "Reserved Quantity",
                                    selectedInventory.reservedQuantity,
                                ],
                                [
                                    "Available Quantity",
                                    selectedInventory.availableQuantity,
                                ],
                                [
                                    "Reorder Level",
                                    selectedInventory.reorderLevel,
                                ],
                                [
                                    "Maximum Stock",
                                    selectedInventory.maxStockLevel,
                                ],
                                ["Status", selectedInventory.status],
                                [
                                    "Last Restocked",
                                    selectedInventory.lastRestockedAt
                                        ? new Date(
                                            selectedInventory.lastRestockedAt
                                        ).toLocaleString()
                                        : "Not restocked yet",
                                ],
                                [
                                    "Created At",
                                    selectedInventory.createdAt
                                        ? new Date(
                                            selectedInventory.createdAt
                                        ).toLocaleString()
                                        : "—",
                                ],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                                >
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        {label}
                                    </p>

                                    <p className="mt-2 break-all text-sm font-semibold text-slate-800">
                                        {value ?? "—"}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end border-t border-slate-100 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowViewModal(false);
                                    setSelectedInventory(null);
                                }}
                                className="rounded-xl bg-[#003963] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002b4a]"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {showDeleteModal && (
                <DeleteModal setShowDeleteModal={setShowDeleteModal}
                    handleDeleteInventory={handleDeleteInventory}
                    setDeleteId={setDeleteId} />
            )}
        </div>
    );
};

export default Inventory;