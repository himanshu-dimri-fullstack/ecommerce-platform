"use client";

import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { API } from "../../api/axios";

const FormModal = ({
    isEdit,
    setShowModal,
    resetForm,
    handleEditInventory,
    handleAddInventory,
    formData,
    handleChange,
    inputClass,
}) => {
    const [stores, setStores] = useState([]);
    const [products, setProducts] = useState([]);
    const [variants, setVariants] = useState([]);

    const [loadingStores, setLoadingStores] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingVariants, setLoadingVariants] = useState(false);

    // Fetch stores and products
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                setLoadingStores(true);
                setLoadingProducts(true);

                const [storeRes, productRes] = await Promise.all([
                    API.get("/store/get"),
                    API.get("/product/get"),
                ]);

                setStores(
                    storeRes.data.stores ||
                    storeRes.data.data ||
                    []
                );

                setProducts(
                    productRes.data.products ||
                    productRes.data.data ||
                    []
                );
            } catch (error) {
                console.error("Failed to fetch inventory options:", error);
            } finally {
                setLoadingStores(false);
                setLoadingProducts(false);
            }
        };

        fetchOptions();
    }, []);

    // Fetch variants when product changes
    useEffect(() => {
        const fetchVariants = async () => {
            if (!formData.product) {
                setVariants([]);
                return;
            }

            try {
                setLoadingVariants(true);

                const res = await API.get(
                    `/variant/get?product=${formData.product}`
                );

                const data =
                    res.data.variants ||
                    res.data.productVariants ||
                    res.data.data ||
                    [];

                setVariants(data);
            } catch (error) {
                console.error("Failed to fetch variants:", error);
                setVariants([]);
            } finally {
                setLoadingVariants(false);
            }
        };

        fetchVariants();
    }, [formData.product]);

    // Generic select handler
    const handleSelectChange = (e) => {
        const { name, value } = e.target;

        handleChange(e);

        // Reset variant whenever product changes
        if (name === "product") {
            handleChange({
                target: {
                    name: "variant",
                    value: "",
                },
            });
        }
    };

    const getId = (item) => item._id || item.id;

    const getStoreName = (store) =>
        store.name ||
        store.storeName ||
        store.code ||
        "Unnamed Store";

    const getProductName = (product) =>
        product.name ||
        product.productName ||
        "Unnamed Product";

    const getVariantName = (variant) => {
        const attributes = variant.attributes
            ? Object.values(variant.attributes).join(" / ")
            : "";

        return [
            variant.name,
            variant.sku,
            variant.title,
            variant.unit,
            attributes,
        ]
            .filter(Boolean)
            .join(" - ") || "Unnamed Variant";
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {isEdit ? "Edit Inventory" : "Add Inventory"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage store stock and inventory levels.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setShowModal(false);
                            resetForm();
                        }}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                    >
                        <FiX size={21} />
                    </button>
                </div>

                <form
                    onSubmit={
                        isEdit
                            ? handleEditInventory
                            : handleAddInventory
                    }
                    className="space-y-5 p-6"
                >
                    {/* STORE, PRODUCT AND VARIANT */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Store *
                            </label>

                            <select
                                name="store"
                                value={formData.store}
                                onChange={handleSelectChange}
                                className={inputClass}
                            >
                                <option value="">
                                    {loadingStores
                                        ? "Loading stores..."
                                        : "Select Store"}
                                </option>

                                {stores.map((store) => (
                                    <option
                                        key={getId(store)}
                                        value={getId(store)}
                                    >
                                        {getStoreName(store)}
                                        {store.code
                                            ? ` (${store.code})`
                                            : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Product *
                            </label>

                            <select
                                name="product"
                                value={formData.product}
                                onChange={handleSelectChange}
                                className={inputClass}
                            >
                                <option value="">
                                    {loadingProducts
                                        ? "Loading products..."
                                        : "Select Product"}
                                </option>

                                {products.map((product) => (
                                    <option
                                        key={getId(product)}
                                        value={getId(product)}
                                    >
                                        {getProductName(product)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Variant *
                            </label>

                            <select
                                name="variant"
                                value={formData.variant}
                                onChange={handleChange}
                                className={inputClass}
                                disabled={!formData.product || loadingVariants}
                            >
                                <option value="">
                                    {!formData.product
                                        ? "Select product first"
                                        : loadingVariants
                                            ? "Loading variants..."
                                            : "Select Variant"}
                                </option>

                                {variants.map((variant) => (
                                    <option
                                        key={getId(variant)}
                                        value={getId(variant)}
                                    >
                                        {getVariantName(variant)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* STOCK INFORMATION */}
                    <div>
                        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                            Stock Information
                        </h3>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Total Quantity *
                                </label>

                                <input
                                    type="number"
                                    name="quantity"
                                    min="0"
                                    step="1"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Reserved Quantity *
                                </label>

                                <input
                                    type="number"
                                    name="reservedQuantity"
                                    min="0"
                                    step="1"
                                    value={formData.reservedQuantity}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Reorder Level *
                                </label>

                                <input
                                    type="number"
                                    name="reorderLevel"
                                    min="0"
                                    step="1"
                                    value={formData.reorderLevel}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Maximum Stock Level *
                                </label>

                                <input
                                    type="number"
                                    name="maxStockLevel"
                                    min="0"
                                    step="1"
                                    value={formData.maxStockLevel}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        {/* AVAILABLE QUANTITY */}
                        <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-4">
                            <p className="text-sm font-medium text-green-800">
                                Available Quantity
                            </p>

                            <p className="mt-1 text-2xl font-bold text-green-700">
                                {Math.max(
                                    0,
                                    Number(formData.quantity || 0) -
                                    Number(
                                        formData.reservedQuantity || 0
                                    )
                                )}
                            </p>

                            <p className="mt-1 text-xs text-green-700">
                                Total quantity − Reserved quantity
                            </p>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                setShowModal(false);
                                resetForm();
                            }}
                            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="rounded-xl bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] px-6 py-2.5 text-sm font-semibold text-white transition active:scale-95"
                        >
                            {isEdit ? "Update Inventory" : "Create Inventory"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormModal;