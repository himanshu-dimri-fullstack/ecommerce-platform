
"use client";

import React, { useEffect, useState } from "react";
import {
    FiX,
    FiPackage,
    FiSearch,
    FiChevronDown,
    FiChevronLeft,
    FiChevronRight,
    FiCheckCircle,
} from "react-icons/fi";
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
    store,
    initialProduct,
    initialVariant,
}) => {
    // Dropdown states
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [showVariantDropdown, setShowVariantDropdown] = useState(false);

    // Product states
    const [products, setProducts] = useState([]);
    const [productSearch, setProductSearch] = useState("");
    const [debouncedProductSearch, setDebouncedProductSearch] = useState("");
    const [productPage, setProductPage] = useState(1);
    const [productTotalPages, setProductTotalPages] = useState(1);
    const [productLoading, setProductLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(
        initialProduct || null
    );

    // Variant states
    const [variants, setVariants] = useState([]);
    const [variantSearch, setVariantSearch] = useState("");
    const [debouncedVariantSearch, setDebouncedVariantSearch] = useState("");
    const [variantPage, setVariantPage] = useState(1);
    const [variantTotalPages, setVariantTotalPages] = useState(1);
    const [variantLoading, setVariantLoading] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(
        initialVariant || null
    );

    // Search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedProductSearch(productSearch);
            setProductPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [productSearch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedVariantSearch(variantSearch);
            setVariantPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [variantSearch]);

    // Fetch products with server-side pagination
    useEffect(() => {
        let isMounted = true;

        const getProducts = async () => {
            try {
                setProductLoading(true);

                const res = await API.get("/product/get", {
                    params: {
                        page: productPage,
                        limit: 10,
                        search: debouncedProductSearch,
                    },
                });

                if (!isMounted) return;

                const data = res.data;

                setProducts(data.products || []);
                setProductTotalPages(data.totalPages || 1);

                if (data.currentPage && data.currentPage !== productPage) {
                    setProductPage(data.currentPage);
                }
            } catch (error) {
                if (isMounted) {
                    console.error("Products fetch error:", error);
                    setProducts([]);
                    setProductTotalPages(1);
                }
            } finally {
                if (isMounted) {
                    setProductLoading(false);
                }
            }
        };

        getProducts();

        return () => {
            isMounted = false;
        };
    }, [productPage, debouncedProductSearch]);

    // Fetch variants according to selected product
    useEffect(() => {
        let isMounted = true;

        const getVariants = async () => {
            if (!formData.product) {
                setVariants([]);
                setVariantTotalPages(1);
                return;
            }

            try {
                setVariantLoading(true);

                const res = await API.get("/variant/get", {
                    params: {
                        product: formData.product,
                        page: variantPage,
                        limit: 10,
                        search: debouncedVariantSearch,
                    },
                });

                if (!isMounted) return;

                const data = res.data;

                setVariants(
                    data.variants ||
                    data.productVariants ||
                    data.data ||
                    []
                );

                setVariantTotalPages(data.totalPages || 1);

                if (data.currentPage && data.currentPage !== variantPage) {
                    setVariantPage(data.currentPage);
                }
            } catch (error) {
                if (isMounted) {
                    console.error("Variants fetch error:", error);
                    setVariants([]);
                    setVariantTotalPages(1);
                }
            } finally {
                if (isMounted) {
                    setVariantLoading(false);
                }
            }
        };

        getVariants();

        return () => {
            isMounted = false;
        };
    }, [formData.product, variantPage, debouncedVariantSearch]);

    // Current selected product
    const currentSelectedProduct =
        products.find(
            (item) => item._id === formData.product
        ) ||
        (selectedProduct?._id === formData.product
            ? selectedProduct
            : initialProduct?._id === formData.product
                ? initialProduct
                : null);

    // Current selected variant
    const currentSelectedVariant =
        variants.find(
            (item) => item._id === formData.variant
        ) ||
        (selectedVariant?._id === formData.variant
            ? selectedVariant
            : initialVariant?._id === formData.variant
                ? initialVariant
                : null);

    // Product selection
    const selectProduct = (product) => {
        setSelectedProduct(product);
        setSelectedVariant(null);

        handleChange({
            target: {
                name: "product",
                value: product._id,
            },
        });

        handleChange({
            target: {
                name: "variant",
                value: "",
            },
        });

        setVariantSearch("");
        setDebouncedVariantSearch("");
        setVariantPage(1);
        setVariants([]);
        setVariantTotalPages(1);

        setShowProductDropdown(false);
        setShowVariantDropdown(false);
    };

    // Variant selection
    const selectVariant = (variant) => {
        setSelectedVariant(variant);

        handleChange({
            target: {
                name: "variant",
                value: variant._id,
            },
        });

        setShowVariantDropdown(false);
    };

    // Close modal
    const closeModal = () => {
        setShowProductDropdown(false);
        setShowVariantDropdown(false);
        setShowModal(false);
        resetForm();
    };

    // Variant display label
    const getVariantLabel = (variant) => {
        if (!variant) return "";

        return [
            variant.name,
            variant.sku,
            variant.title,
            variant.unit,
            variant.attributes
                ? Object.entries(variant.attributes)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(", ")
                : null,
        ]
            .filter(Boolean)
            .join(" | ");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl">

                {/* Header */}
                <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#003963] flex items-center justify-center">
                            <FiPackage size={22} />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {isEdit ? "Update Inventory" : "Add Inventory"}
                            </h2>

                            <p className="text-sm text-gray-500">
                                {isEdit
                                    ? "Update store inventory details"
                                    : "Add a new product to store inventory"}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={closeModal}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-500 transition"
                    >
                        <FiX size={21} />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();

                        if (isEdit) {
                            handleEditInventory(e);
                        } else {
                            handleAddInventory(e);
                        }
                    }}
                    className="p-6 space-y-6"
                >

                    {/* Store */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Store
                        </label>

                        <div className="relative">
                            <select
                                name="store"
                                value={formData.store || store?._id || ""}
                                disabled
                                className={`${inputClass} w-full cursor-not-allowed bg-gray-100 text-gray-700 opacity-100`}
                            >
                                <option value={store?._id || formData.store || ""}>
                                    {store?.name
                                        ? `${store.name}${store.code ? ` (${store.code})` : ""}`
                                        : "Current Store"}
                                </option>
                            </select>
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                            Inventory will be managed for this store only.
                        </p>
                    </div>

                    {/* Product */}
                    <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Product <span className="text-red-500">*</span>
                        </label>

                        <button
                            type="button"
                            onClick={() => {
                                setShowProductDropdown(!showProductDropdown);
                                setShowVariantDropdown(false);
                            }}
                            className={`${inputClass} w-full flex items-center justify-between text-left bg-white`}
                        >
                            <span className={
                                currentSelectedProduct
                                    ? "text-gray-800"
                                    : "text-gray-400"
                            }>
                                {currentSelectedProduct?.name ||
                                    "Select Product"}
                            </span>

                            <FiChevronDown
                                className={`transition-transform ${showProductDropdown ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {showProductDropdown && (
                            <div className="absolute z-30 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">

                                {/* Search */}
                                <div className="p-3 border-b border-gray-100">
                                    <div className="relative">
                                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                        <input
                                            type="text"
                                            value={productSearch}
                                            onChange={(e) =>
                                                setProductSearch(e.target.value)
                                            }
                                            placeholder="Search products..."
                                            className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#003963]"
                                        />

                                        {productSearch && (
                                            <button
                                                type="button"
                                                onClick={() => setProductSearch("")}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                                            >
                                                <FiX />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Product list */}
                                <div className="max-h-56 overflow-y-auto">
                                    {productLoading ? (
                                        <div className="py-8 flex justify-center">
                                            <div className="w-6 h-6 border-2 border-gray-200 border-t-[#003963] rounded-full animate-spin" />
                                        </div>
                                    ) : products.length > 0 ? (
                                        products.map((product) => (
                                            <button
                                                type="button"
                                                key={product._id}
                                                onClick={() => selectProduct(product)}
                                                className={`w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition ${formData.product === product._id
                                                    ? "bg-green-50 text-green-700"
                                                    : "text-gray-700"
                                                    }`}
                                            >
                                                <span className="text-sm font-medium">
                                                    {product.name}
                                                </span>

                                                {formData.product === product._id && (
                                                    <FiCheckCircle className="text-green-600" />
                                                )}
                                            </button>
                                        ))
                                    ) : (
                                        <p className="py-8 text-center text-sm text-gray-400">
                                            No products found
                                        </p>
                                    )}
                                </div>

                                {/* Pagination */}
                                <div className="px-3 py-3 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        Page {productPage} of {productTotalPages}
                                    </span>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            disabled={productPage <= 1 || productLoading}
                                            onClick={() =>
                                                setProductPage((prev) => prev - 1)
                                            }
                                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                                        >
                                            <FiChevronLeft />
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                productPage >= productTotalPages ||
                                                productLoading
                                            }
                                            onClick={() =>
                                                setProductPage((prev) => prev + 1)
                                            }
                                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                                        >
                                            <FiChevronRight />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Variant */}
                    <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Variant <span className="text-red-500">*</span>
                        </label>

                        <button
                            type="button"
                            disabled={!formData.product}
                            onClick={() => {
                                setShowVariantDropdown(!showVariantDropdown);
                                setShowProductDropdown(false);
                            }}
                            className={`${inputClass} w-full flex items-center justify-between text-left bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        >
                            <span className={
                                currentSelectedVariant
                                    ? "text-gray-800"
                                    : "text-gray-400"
                            }>
                                {currentSelectedVariant
                                    ? getVariantLabel(currentSelectedVariant)
                                    : formData.product
                                        ? "Select Variant"
                                        : "Select Product First"}
                            </span>

                            <FiChevronDown
                                className={`transition-transform ${showVariantDropdown ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {showVariantDropdown && (
                            <div className="absolute z-30 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">

                                {/* Search */}
                                <div className="p-3 border-b border-gray-100">
                                    <div className="relative">
                                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                        <input
                                            type="text"
                                            value={variantSearch}
                                            onChange={(e) =>
                                                setVariantSearch(e.target.value)
                                            }
                                            placeholder="Search variants..."
                                            className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#003963]"
                                        />

                                        {variantSearch && (
                                            <button
                                                type="button"
                                                onClick={() => setVariantSearch("")}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                                            >
                                                <FiX />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Variant list */}
                                <div className="max-h-56 overflow-y-auto">
                                    {variantLoading ? (
                                        <div className="py-8 flex justify-center">
                                            <div className="w-6 h-6 border-2 border-gray-200 border-t-[#003963] rounded-full animate-spin" />
                                        </div>
                                    ) : variants.length > 0 ? (
                                        variants.map((variant) => (
                                            <button
                                                type="button"
                                                key={variant._id}
                                                onClick={() => selectVariant(variant)}
                                                className={`w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition ${formData.variant === variant._id
                                                    ? "bg-green-50 text-green-700"
                                                    : "text-gray-700"
                                                    }`}
                                            >
                                                <span className="text-sm font-medium">
                                                    {getVariantLabel(variant)}
                                                </span>

                                                {formData.variant === variant._id && (
                                                    <FiCheckCircle className="text-green-600 shrink-0" />
                                                )}
                                            </button>
                                        ))
                                    ) : (
                                        <p className="py-8 text-center text-sm text-gray-400">
                                            No variants found
                                        </p>
                                    )}
                                </div>

                                {/* Pagination */}
                                <div className="px-3 py-3 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        Page {variantPage} of {variantTotalPages}
                                    </span>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            disabled={variantPage <= 1 || variantLoading}
                                            onClick={() =>
                                                setVariantPage((prev) => prev - 1)
                                            }
                                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                                        >
                                            <FiChevronLeft />
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                variantPage >= variantTotalPages ||
                                                variantLoading
                                            }
                                            onClick={() =>
                                                setVariantPage((prev) => prev + 1)
                                            }
                                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                                        >
                                            <FiChevronRight />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stock fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Total Quantity <span className="text-red-500">*</span>
                            </label>

                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                placeholder="Enter total quantity"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Reserved Quantity <span className="text-red-500">*</span>
                            </label>

                            <input
                                type="number"
                                name="reservedQuantity"
                                value={formData.reservedQuantity}
                                onChange={handleChange}
                                placeholder="Enter reserved quantity"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Reorder Level <span className="text-red-500">*</span>
                            </label>

                            <input
                                type="number"
                                name="reorderLevel"
                                value={formData.reorderLevel}
                                onChange={handleChange}
                                placeholder="Enter reorder level"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Maximum Stock Level <span className="text-red-500">*</span>
                            </label>

                            <input
                                type="number"
                                name="maxStockLevel"
                                value={formData.maxStockLevel}
                                onChange={handleChange}
                                placeholder="Enter maximum stock level"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-5 border-t border-gray-200 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                !formData.store ||
                                !formData.product ||
                                !formData.variant
                            }
                            className="px-6 py-2.5 rounded-lg bg-[#003963] text-white font-semibold hover:bg-[#002b4a] disabled:opacity-50 disabled:cursor-not-allowed transition"
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
