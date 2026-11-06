import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiArrowLeft, FiPackage, FiLayers } from "react-icons/fi";
import { API } from "../../api/axios";
import { toast } from "react-toastify";
import DataLoader from "../../components/DataLoader";

const InventoryDetail = () => {
    const { storeId, inventoryId } = useParams();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);

    const [loading, setLoading] = useState(true);
    const [inventory, setInventory] = useState(null);

    const getInventory = async () => {
        try {
            const res = await API.get(`/inventory/get/${inventoryId}`);
            setInventory(res.data.inventory);
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to fetch inventory details"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getInventory();
    }, [inventoryId]);

    if (!user?.role?.permissions?.includes("inventory:read")) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (loading) return <DataLoader />;

    if (!inventory) {
        return <div className="p-6 text-center">Inventory not found.</div>;
    }

    const details = [
        ["Store", inventory.store?.name || "—"],
        ["Product", inventory.product?.name || "—"],
        ["Variant", inventory.variant?.name || inventory.variant?.sku || "—"],
        ["SKU", inventory.variant?.sku || "—"],
        ["Total Quantity", inventory.quantity],
        ["Reserved Quantity", inventory.reservedQuantity],
        ["Available Quantity", inventory.availableQuantity],
        ["Reorder Level", inventory.reorderLevel],
        ["Maximum Stock Level", inventory.maxStockLevel],
        ["Status", inventory.status],
        [
            "Last Restocked",
            inventory.lastRestockedAt
                ? new Date(inventory.lastRestockedAt).toLocaleString()
                : "Not restocked yet",
        ],
        [
            "Created At",
            inventory.createdAt
                ? new Date(inventory.createdAt).toLocaleString()
                : "—",
        ],
        [
            "Updated At",
            inventory.updatedAt
                ? new Date(inventory.updatedAt).toLocaleString()
                : "—",
        ],
    ];

    return (
        <div className="space-y-6">
            <div>
                <button
                    onClick={() =>
                        navigate(`/admin/inventory/store/${storeId}`)
                    }
                    className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#003963]"
                >
                    <FiArrowLeft />
                    Back to Store Inventory
                </button>

                <h1 className="text-2xl font-bold text-slate-800">
                    Inventory Details
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Complete stock information and inventory details.
                </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-[#003963]">
                        <FiPackage size={27} />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            {inventory.product?.name || "Product"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {inventory.variant?.name ||
                                inventory.variant?.sku ||
                                "Variant"}
                        </p>
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {details.map(([label, value]) => (
                        <div
                            key={label}
                            className="rounded-xl bg-slate-50 p-4"
                        >
                            <p className="text-xs font-medium text-slate-500">
                                {label}
                            </p>

                            <p className="mt-2 wrap-break-words text-sm font-semibold text-slate-800">
                                {String(value ?? "—")}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InventoryDetail;