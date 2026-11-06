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
} from "react-icons/fi";
import { FiEye } from "react-icons/fi";
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

    const [dataLoading, setDataLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [store, setStore] = useState(null);
    const [inventories, setInventories] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const [formData, setFormData] = useState({
        ...initialFormData,
    });

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

    // FETCH SELECTED STORE INVENTORY
    const getStoreInventory = async () => {
        try {
            const res = await API.get(
                `/inventory/store/${storeId}`
            );

            setStore(res.data.store || null);
            setInventories(res.data.inventories || []);
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
        await getStoreInventory();
    };

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

    // VALIDATE FORM
    // const validateForm = () => {
    //     const quantity = Number(formData.quantity);
    //     const reservedQuantity = Number(formData.reservedQuantity);
    //     const reorderLevel = Number(formData.reorderLevel);
    //     const maxStockLevel = Number(formData.maxStockLevel);

    //     const values = [
    //         quantity,
    //         reservedQuantity,
    //         reorderLevel,
    //         maxStockLevel,
    //     ];

    //     if (
    //         !formData.product ||
    //         !formData.variant ||
    //         !formData.store || !formData.quantity || !formData.maxStockLevel
    //     ) {
    //         toast.error("Please fill all required fields");
    //         return false;
    //     }

    //     if (
    //         values.some(
    //             (value) =>
    //                 !Number.isFinite(value) ||
    //                 value < 0 ||
    //                 !Number.isInteger(value)
    //         )
    //     ) {
    //         toast.error(
    //             "Stock quantities must be valid non-negative integers"
    //         );
    //         return false;
    //     }

    //     if (reservedQuantity > quantity) {
    //         toast.error("Reserved quantity cannot exceed total quantity")
    //         return false
    //     }

    //     if (reorderLevel > reservedQuantity) {
    //         toast.error("Reorder level cannot exceed reserved quantity")
    //         return false
    //     }

    //     if (quantity > maxStockLevel) {
    //         toast.error("Quantity cannot exceed maximum stock level")
    //         return false
    //     }

    //     return true;
    // };

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

        // if (!validateForm()) return;

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

            await getStoreInventory();
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

        // if (!validateForm()) return;

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

            await getStoreInventory();
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

            await getStoreInventory();
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

            const res = await API.patch(
                `/inventory/update/status/${inventory._id}`
            );

            toast.success(
                res.data.message || "Inventory status updated"
            );

            await getStoreInventory();
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

        const productName =
            typeof item.product === "object"
                ? item.product?.name || ""
                : "";

        const variantName =
            typeof item.variant === "object"
                ? item.variant?.name || item.variant?.sku || ""
                : "";

        const sku =
            typeof item.variant === "object"
                ? item.variant?.sku || ""
                : "";

        return (
            productName.toLowerCase().includes(searchValue) ||
            variantName.toLowerCase().includes(searchValue) ||
            sku.toLowerCase().includes(searchValue) ||
            item.status?.toLowerCase().includes(searchValue)
        );
    });

    // INITIAL FETCH
    useEffect(() => {
        getStoreInventory();
    }, [storeId]);

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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                    >
                        <FiRefreshCw size={17} />
                        Refresh
                    </button>
                </div>
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

            {/* SEARCH */}
            <div className="flex justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="relative w-full sm:max-w-md">
                    <FiSearch
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={19}
                    />

                    <input
                        type="text"
                        placeholder="Search product, variant, SKU or status..."
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

            {/* INVENTORY TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-212.5">
                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                {[
                                    "Product",
                                    "Variant",
                                    // "Quantity",
                                    // "Reserved",
                                    // "Available",
                                    // "Reorder Level",
                                    "Status",
                                    "Actions",
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredInventory.length > 0 ? (
                                filteredInventory.map((item) => {
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

                                    const isLowStock =
                                        Number(item.availableQuantity) <=
                                        Number(item.reorderLevel);

                                    return (
                                        <tr
                                            key={item._id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            {/* PRODUCT */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#003963]">
                                                        <FiPackage size={17} />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-slate-800">
                                                            {productName}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {String(
                                                                item.product?._id ||
                                                                item.product ||
                                                                "—"
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* VARIANT */}
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-slate-700">
                                                    {variantName}
                                                </p>

                                                {sku && (
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        SKU: {sku}
                                                    </p>
                                                )}
                                            </td>

                                            {/* QUANTITY */}
                                            {/* <td className="px-4 py-3">
                                                <span className="font-semibold text-slate-700">
                                                    {item.quantity}
                                                </span>
                                            </td> */}

                                            {/* RESERVED */}
                                            {/* <td className="px-4 py-3">
                                                <span className="font-medium text-amber-600">
                                                    {item.reservedQuantity}
                                                </span>
                                            </td> */}

                                            {/* AVAILABLE */}
                                            {/* <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1">
                                                    <span
                                                        className={`font-semibold ${isLowStock
                                                            ? "text-red-600"
                                                            : "text-green-600"
                                                            }`}
                                                    >
                                                        {item.availableQuantity}
                                                    </span>

                                                    {isLowStock && (
                                                        <span className="text-[10px] font-semibold text-red-500">
                                                            Low Stock
                                                        </span>
                                                    )}
                                                </div>
                                            </td> */}

                                            {/* REORDER LEVEL */}
                                            {/* <td className="px-4 py-3">
                                                <span className="text-sm text-slate-600">
                                                    {item.reorderLevel}
                                                </span>
                                            </td> */}

                                            {/* STATUS */}
                                            <td className="px-4 py-3">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        !user?.role?.permissions?.includes(
                                                            "inventory:status"
                                                        )
                                                    }
                                                    onClick={() =>
                                                        changeStatus(item)
                                                    }
                                                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${item.status === "active"
                                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                        : "bg-red-100 text-red-700 hover:bg-red-200"
                                                        } disabled:cursor-not-allowed disabled:opacity-60`}
                                                >
                                                    {item.status || "inactive"}
                                                </button>
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    {
                                                        user.role.permissions.includes("inventory:read")
                                                        && (
                                                            <button
                                                                type="button"
                                                                title="View Inventory Details"
                                                                onClick={() =>
                                                                    navigate(`/admin/inventory/store/${storeId}/details/${item._id}`)
                                                                }
                                                                className="rounded-lg p-1.5 text-blue-600 transition hover:bg-blue-50"
                                                            >
                                                                <FiEye size={17} />
                                                            </button>
                                                        )
                                                    }
                                                    {user?.role?.permissions?.includes(
                                                        "inventory:update"
                                                    ) && (
                                                            <button
                                                                type="button"
                                                                title="Edit Inventory"
                                                                onClick={() =>
                                                                    handleEditModal(item)
                                                                }
                                                                className="rounded-lg p-1.5 text-amber-600 transition hover:bg-amber-50"
                                                            >
                                                                <FiEdit2 size={17} />
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
                                                                className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50"
                                                            >
                                                                <FiTrash2 size={17} />
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
                                        colSpan={8}
                                        className="px-4 py-10 text-center"
                                    >
                                        <FiBox
                                            size={40}
                                            className="mx-auto text-slate-300"
                                        />

                                        <p className="mt-3 font-medium text-slate-600">
                                            No inventory found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            Add inventory for this store or
                                            change your search.
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