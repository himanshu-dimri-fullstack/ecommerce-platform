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
    FiX,
    FiImage,
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
} from "react-icons/fi";

import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../api/axios";
import DeleteModal from "../../components/productVariant/DeleteModal";
import FormModal from "../../components/productVariant/FormModal";
import DataLoader from "../../components/DataLoader";
import { useSelector } from "react-redux";

const initialFormData = {
    product: "",
    name: "",
    barcode: "",
    unitValue: "1",
    unit: "piece",
    mrp: "",
    sellingPrice: "",
    discountPercentage: "0",
    weight: "",
    length: "",
    width: "",
    height: "",
    images: [],
};

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#003963] focus:bg-white focus:ring-2 focus:ring-[#003963]/10";

const ProductVariant = () => {
    const navigate = useNavigate();
    const user = useSelector((store) => store.auth.user);

    const permissions = user?.role?.permissions || [];

    const [dataLoading, setDataLoading] = useState(true);

    // VARIANT SEARCH + PAGINATION
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    // PRODUCT DROPDOWN SEARCH + PAGINATION
    const [products, setProducts] = useState([]);
    const [productSearch, setProductSearch] = useState("");
    const [debouncedProductSearch, setDebouncedProductSearch] =
        useState("");
    const [productPage, setProductPage] = useState(1);
    const [productTotalPages, setProductTotalPages] = useState(0);
    const [productLoading, setProductLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // DATABASE COUNTS
    const [totalVariantCount, setTotalVariantCount] = useState(0);
    const [activeVariantCount, setActiveVariantCount] = useState(0);
    const [inactiveVariantCount, setInactiveVariantCount] = useState(0);

    // MODALS
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    // DATA
    const [variants, setVariants] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [formData, setFormData] = useState(initialFormData);

    // DISCOUNT CALCULATION
    const calculateDiscount = (mrp, sellingPrice) => {
        const originalPrice = Number(mrp);
        const finalPrice = Number(sellingPrice);

        if (
            !originalPrice ||
            originalPrice < 0 ||
            finalPrice < 0 ||
            finalPrice > originalPrice
        ) {
            return "0";
        }

        return (
            ((originalPrice - finalPrice) / originalPrice) * 100
        ).toFixed(2);
    };

    // FORM CHANGE
    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "images") {
            setFormData((prev) => ({
                ...prev,
                images: Array.from(files || []),
            }));
            return;
        }

        setFormData((prev) => {
            const updated = {
                ...prev,
                [name]: value,
            };

            if (name === "mrp" || name === "sellingPrice") {
                updated.discountPercentage = calculateDiscount(
                    name === "mrp" ? value : prev.mrp,
                    name === "sellingPrice" ? value : prev.sellingPrice
                );
            }

            return updated;
        });
    };

    // FETCH PRODUCTS FOR FORM DROPDOWN
    const getAllProducts = async (
        page = productPage,
        searchValue = debouncedProductSearch
    ) => {
        try {
            setProductLoading(true);

            const res = await API.get("/product/get", {
                params: {
                    page,
                    limit: 10,
                    search: searchValue,
                },
            });

            setProducts(res.data.products || []);
            setProductTotalPages(res.data.totalPages || 0);
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to fetch products"
            );
        } finally {
            setProductLoading(false);
        }
    };

    // HANDLE PRODUCT SELECTION
    const handleProductChange = (e) => {
        const productId = e.target.value;

        setFormData((prev) => ({
            ...prev,
            product: productId,
        }));

        const product = products.find(
            (item) => item._id === productId
        );

        if (product) {
            setSelectedProduct(product);
        }
    };

    // FETCH VARIANTS WITH SERVER-SIDE SEARCH + PAGINATION
    const getAllVariants = async (page = currentPage) => {
        try {
            const res = await API.get("/variant/get", {
                params: {
                    page,
                    limit,
                    search: debouncedSearch,
                },
            });

            setVariants(res.data.variants || []);
            setTotalPages(res.data.totalPages || 0);

            setTotalVariantCount(res.data.totalVariants || 0);
            setActiveVariantCount(res.data.activeVariants || 0);
            setInactiveVariantCount(res.data.inactiveVariants || 0);
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to fetch product variants"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // RESET FORM
    const resetForm = () => {
        setFormData({ ...initialFormData });
        setExistingImages([]);
        setEditId(null);
        setIsEdit(false);

        // Reset product dropdown
        setSelectedProduct(null);
        setProductSearch("");
        setDebouncedProductSearch("");
        setProductPage(1);
        setProducts([]);
        setProductTotalPages(0);
    };

    // OPEN ADD MODAL
    const handleAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    // BUILD FORMDATA
    const buildVariantFormData = () => {
        const finalFormData = new FormData();

        finalFormData.append("product", formData.product);
        finalFormData.append("name", formData.name.trim());
        finalFormData.append("barcode", formData.barcode.trim());
        finalFormData.append("unitValue", formData.unitValue);
        finalFormData.append("unit", formData.unit);
        finalFormData.append("mrp", formData.mrp);
        finalFormData.append("sellingPrice", formData.sellingPrice);

        finalFormData.append(
            "discountPercentage",
            formData.discountPercentage
        );

        finalFormData.append("weight", formData.weight);

        finalFormData.append(
            "dimensions",
            JSON.stringify({
                length: formData.length || null,
                width: formData.width || null,
                height: formData.height || null,
            })
        );

        formData.images.forEach((image) => {
            finalFormData.append("images", image);
        });

        if (existingImages.length > 0) {
            finalFormData.append(
                "existingImages",
                JSON.stringify(existingImages)
            );
        }

        return finalFormData;
    };

    // VALIDATE FORM
    const validateForm = () => {
        if (!formData.product) {
            toast.error("Please select a product");
            return false;
        }

        if (!formData.name.trim()) {
            toast.error("Variant name is required");
            return false;
        }

        if (
            formData.unitValue === "" ||
            Number(formData.unitValue) <= 0
        ) {
            toast.error("Unit value must be greater than zero");
            return false;
        }

        if (
            formData.mrp === "" ||
            formData.sellingPrice === "" ||
            Number(formData.mrp) < 0 ||
            Number(formData.sellingPrice) < 0
        ) {
            toast.error("Please enter valid prices");
            return false;
        }

        if (Number(formData.sellingPrice) > Number(formData.mrp)) {
            toast.error("Selling price cannot exceed MRP");
            return false;
        }

        return true;
    };

    // ADD VARIANT
    const handleAddVariant = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setDataLoading(true);

            const finalFormData = buildVariantFormData();

            const res = await API.post(
                "/variant/add",
                finalFormData
            );

            toast.success(res.data.message);

            setShowModal(false);
            resetForm();

            // Newest variant appears on first page
            setCurrentPage(1);

            if (currentPage === 1) {
                await getAllVariants(1);
            }
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to add variant"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // OPEN EDIT MODAL
    const handleEditModal = (variant) => {
        setEditId(variant._id);
        setIsEdit(true);

        const dimensions = variant.dimensions || {};

        const product =
            variant.product && typeof variant.product === "object"
                ? variant.product
                : null;

        setSelectedProduct(product);

        setProductSearch("");
        setDebouncedProductSearch("");
        setProductPage(1);
        setProducts([]);
        setProductTotalPages(0);

        setFormData({
            product: product?._id || variant.product || "",
            name: variant.name || "",
            barcode: variant.barcode || "",
            unitValue: String(variant.unitValue ?? 1),
            unit: variant.unit || "piece",
            mrp: String(variant.mrp ?? ""),
            sellingPrice: String(variant.sellingPrice ?? ""),
            discountPercentage: String(
                variant.discountPercentage ?? 0
            ),
            weight: String(variant.weight ?? ""),
            length: String(dimensions.length ?? ""),
            width: String(dimensions.width ?? ""),
            height: String(dimensions.height ?? ""),
            images: [],
        });

        setExistingImages(
            Array.isArray(variant.images) ? variant.images : []
        );

        setShowModal(true);
    };

    // UPDATE VARIANT
    const handleEditVariant = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setDataLoading(true);

            const finalFormData = buildVariantFormData();

            const res = await API.put(
                `/variant/update/${editId}`,
                finalFormData
            );

            toast.success(
                res.data.message || "Variant updated successfully"
            );

            setShowModal(false);
            resetForm();

            await getAllVariants();
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to update variant"
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

    // DELETE VARIANT
    const handleDeleteVariant = async () => {
        try {
            setDataLoading(true);

            const res = await API.delete(
                `/variant/delete/${deleteId}`
            );

            toast.success(
                res.data.message || "Variant deleted successfully"
            );

            setShowDeleteModal(false);
            setDeleteId(null);

            await getAllVariants();
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to delete variant"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // CHANGE STATUS
    const changeStatus = async (id) => {
        try {
            setDataLoading(true);

            const res = await API.patch(
                "/variant/update/status",
                { id }
            );

            toast.success(
                res.data.message || "Variant status updated"
            );

            await getAllVariants();
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to change variant status"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // VARIANT SEARCH DEBOUNCE
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setCurrentPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    // FETCH VARIANTS WHEN PAGE / LIMIT / SEARCH CHANGES
    useEffect(() => {
        getAllVariants(currentPage);
    }, [currentPage, limit, debouncedSearch]);

    // PRODUCT SEARCH DEBOUNCE
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedProductSearch(productSearch.trim());
            setProductPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [productSearch]);

    // FETCH PRODUCTS ONLY WHEN FORM MODAL IS OPEN
    useEffect(() => {
        if (!showModal) return;

        getAllProducts(productPage, debouncedProductSearch);
    }, [showModal, productPage, debouncedProductSearch]);

    // PERMISSION CHECK
    if (
        !permissions.some((permission) =>
            permission.includes("productVariant")
        )
    ) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (dataLoading) {
        return <DataLoader />;
    }

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

    const startItem =
        totalVariantCount === 0
            ? 0
            : (currentPage - 1) * limit + 1;

    const endItem = Math.min(
        currentPage * limit,
        totalVariantCount
    );

    return (
        <div className="space-y-6">

            {/* PAGE HEADER */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Product Variants
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage product variants, SKUs, pricing, images and status.
                    </p>
                </div>

                {permissions.includes("productVariant:add") && (
                    <button
                        type="button"
                        onClick={handleAddModal}
                        className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md active:scale-95"
                    >
                        <FiPlus size={19} />
                        Add Variant
                    </button>
                )}
            </div>

            {/* STATISTICS */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {/* TOTAL */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Total Variants
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {totalVariantCount.toLocaleString("en-IN")}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FiPackage size={24} />
                        </div>
                    </div>
                </div>

                {/* ACTIVE */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Active Variants
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-green-600">
                                {activeVariantCount.toLocaleString("en-IN")}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                            <FiCheckCircle size={24} />
                        </div>
                    </div>
                </div>

                {/* INACTIVE */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Inactive Variants
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-red-500">
                                {inactiveVariantCount.toLocaleString("en-IN")}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                            <FiXCircle size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* SEARCH + RESULTS */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="relative w-full sm:max-w-md">
                        <FiSearch
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={19}
                        />

                        <input
                            type="text"
                            placeholder="Search by variant name..."
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

                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-slate-500">
                            Show
                        </span>

                        <select
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setCurrentPage(1);
                            }}
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

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    <p className="text-xs text-slate-500">
                        Showing{" "}
                        <span className="font-semibold text-slate-700">
                            {startItem}–{endItem}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-slate-700">
                            {totalVariantCount}
                        </span>{" "}
                        variants
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

            {/* VARIANTS TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-250">

                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                {[
                                    "Variant",
                                    "Product",
                                    "Pricing",
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
                            {variants.length > 0 ? (
                                variants.map((variant) => (
                                    <tr
                                        key={variant._id}
                                        className="transition hover:bg-slate-50"
                                    >
                                        {/* VARIANT */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-[#003963]">
                                                    {variant.images?.[0] ? (
                                                        <img
                                                            src={
                                                                typeof variant.images[0] === "string"
                                                                    ? variant.images[0]
                                                                    : variant.images[0]?.url
                                                            }
                                                            alt={variant.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <FiImage size={20} />
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-slate-800">
                                                        {variant.name}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        ID: #{variant._id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* PRODUCT */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-700">
                                                {variant.product?.name || "—"}
                                            </p>
                                        </td>

                                        {/* PRICING */}
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-800">
                                                ₹
                                                {Number(
                                                    variant.sellingPrice || 0
                                                ).toLocaleString("en-IN")}
                                            </p>

                                            <div className="mt-1 flex items-center gap-2">
                                                <span className="text-xs text-slate-400 line-through">
                                                    ₹
                                                    {Number(
                                                        variant.mrp || 0
                                                    ).toLocaleString("en-IN")}
                                                </span>

                                                <span className="text-xs font-medium text-green-600">
                                                    {Number(
                                                        variant.discountPercentage || 0
                                                    )}
                                                    % off
                                                </span>
                                            </div>
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-6 py-4">
                                            <button
                                                disabled={!permissions.includes("productVariant:status")}
                                                type="button"
                                                onClick={() => changeStatus(variant._id)}
                                                className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variant.status === "active"
                                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                        : "bg-red-100 text-red-700 hover:bg-red-200"
                                                    }`}
                                            >
                                                {variant.status || "inactive"}
                                            </button>
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">

                                                {permissions.includes("productVariant:read") && (
                                                    <button
                                                        type="button"
                                                        title="View Variant"
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/product-variants/${variant._id}`
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                    >
                                                        <FiEye size={18} />
                                                    </button>
                                                )}

                                                {permissions.includes("productVariant:update") && (
                                                    <button
                                                        type="button"
                                                        title="Edit Variant"
                                                        onClick={() =>
                                                            handleEditModal(variant)
                                                        }
                                                        className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                                                    >
                                                        <FiEdit2 size={18} />
                                                    </button>
                                                )}

                                                {permissions.includes("productVariant:delete") && (
                                                    <button
                                                        type="button"
                                                        title="Delete Variant"
                                                        onClick={() =>
                                                            handleDeleteModal(variant._id)
                                                        }
                                                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
                                            <FiPackage size={32} />
                                        </div>

                                        <p className="mt-4 font-semibold text-slate-700">
                                            No variants found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            {debouncedSearch
                                                ? "Try searching with a different variant name."
                                                : "Add a new variant to get started."}
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

                {/* VARIANT PAGINATION */}
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

                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(1)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#047857] hover:bg-emerald-50 hover:text-[#047857] disabled:cursor-not-allowed disabled:opacity-40"
                                title="First page"
                            >
                                <FiChevronsLeft size={17} />
                            </button>

                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setCurrentPage((prev) => Math.max(1, prev - 1))
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#047857] hover:bg-emerald-50 hover:text-[#047857] disabled:cursor-not-allowed disabled:opacity-40"
                                title="Previous page"
                            >
                                <FiChevronLeft size={17} />
                            </button>

                            {paginationNumbers.length > 0 &&
                                paginationNumbers[0] > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage(1)}
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

                            {paginationNumbers.map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition ${currentPage === page
                                            ? "bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] text-white shadow-sm"
                                            : "border border-slate-200 text-slate-600 hover:border-[#047857] hover:bg-emerald-50 hover:text-[#047857]"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

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
                                            onClick={() => setCurrentPage(totalPages)}
                                            className="h-9 min-w-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:border-[#047857] hover:bg-emerald-50 hover:text-[#047857]"
                                        >
                                            {totalPages}
                                        </button>
                                    </>
                                )}

                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(totalPages, prev + 1)
                                    )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#047857] hover:bg-emerald-50 hover:text-[#047857] disabled:cursor-not-allowed disabled:opacity-40"
                                title="Next page"
                            >
                                <FiChevronRight size={17} />
                            </button>

                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(totalPages)}
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
                    handleEditVariant={handleEditVariant}
                    handleAddVariant={handleAddVariant}
                    formData={formData}
                    handleChange={handleChange}
                    handleProductChange={handleProductChange}
                    products={products}
                    productSearch={productSearch}
                    setProductSearch={setProductSearch}
                    productPage={productPage}
                    setProductPage={setProductPage}
                    productTotalPages={productTotalPages}
                    productLoading={productLoading}
                    selectedProduct={selectedProduct}
                    existingImages={existingImages}
                    setExistingImages={setExistingImages}
                    setFormData={setFormData}
                />
            )}

            {/* DELETE MODAL */}
            {showDeleteModal && (
                <DeleteModal
                    setShowDeleteModal={setShowDeleteModal}
                    handleDeleteVariant={handleDeleteVariant}
                />
            )}
        </div>
    );
};

export default ProductVariant;