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
    FiStar,
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
    FiX,
} from "react-icons/fi";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../api/axios";
import DeleteModal from "../../components/product/DeleteModal";
import FormModal from "../../components/product/FormModal";
import DataLoader from "../../components/DataLoader";
import { useSelector } from "react-redux";

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

const Product = () => {
    const navigate = useNavigate();

    const user = useSelector((store) => store.auth.user);
    const permissions = user?.role?.permissions || [];

    const [dataLoading, setDataLoading] = useState(true);

    // SEARCH STATES
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // MODAL STATES
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    // SELECTED DROPDOWN OPTIONS FOR EDIT MODE
    const [selectedOptions, setSelectedOptions] = useState({
        category: null,
        subcategory: null,
        brand: null,
    });

    // PRODUCT DATA
    const [products, setProducts] = useState([]);

    // PAGINATION STATES
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    // DATABASE COUNTS
    const [totalProductCount, setTotalProductCount] = useState(0);
    const [activeProductCount, setActiveProductCount] = useState(0);
    const [inactiveProductCount, setInactiveProductCount] = useState(0);

    // FORM STATES
    const [formData, setFormData] = useState({
        category: "",
        subcategory: "",
        brand: "",
        name: "",
        description: "",
        images: [],
        unit: "piece",
        tags: [],
        isFeatured: false,
    });

    const [existingImages, setExistingImages] = useState([]);
    const [tagInput, setTagInput] = useState("");

    // FORM CHANGE
    const handleChange = (e) => {
        const { name, value, files, type, checked } = e.target;

        if (type === "file") {
            setFormData((prev) => ({
                ...prev,
                images: Array.from(files || []),
            }));

            return;
        }

        if (name === "category") {
            setFormData((prev) => ({
                ...prev,
                category: value,
                subcategory: "",
            }));

            setSelectedOptions((prev) => ({
                ...prev,
                subcategory: null,
            }));

            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // GET ALL PRODUCTS
    const getAllProducts = async (page = currentPage) => {
        try {
            const res = await API.get("/product/get", {
                params: {
                    page,
                    limit,
                    search: debouncedSearch,
                },
            });

            setProducts(res.data.products || []);
            setTotalPages(res.data.totalPages || 0);

            setTotalProductCount(res.data.totalProducts || 0);
            setActiveProductCount(res.data.activeProducts || 0);
            setInactiveProductCount(res.data.inactiveProducts || 0);
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to fetch products"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // RESET FORM
    const resetForm = () => {
        setFormData({
            category: "",
            subcategory: "",
            brand: "",
            name: "",
            description: "",
            images: [],
            unit: "piece",
            tags: [],
            isFeatured: false,
        });

        setExistingImages([]);
        setTagInput("");

        setSelectedOptions({
            category: null,
            subcategory: null,
            brand: null,
        });
    };

    // OPEN ADD MODAL
    const handleAddProductModal = () => {
        setIsEdit(false);
        setEditId(null);
        resetForm();
        setShowModal(true);
    };

    // BUILD FORMDATA
    const buildProductFormData = () => {
        const finalFormData = new FormData();

        finalFormData.append("category", formData.category);
        finalFormData.append("subcategory", formData.subcategory);
        finalFormData.append("brand", formData.brand);
        finalFormData.append("name", formData.name);
        finalFormData.append("description", formData.description);
        finalFormData.append("unit", formData.unit);
        finalFormData.append("tags", JSON.stringify(formData.tags));
        finalFormData.append("isFeatured", formData.isFeatured);

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

    // ADD PRODUCT
    const handleAddProduct = async (e) => {
        e.preventDefault();

        try {
            setDataLoading(true);

            const finalFormData = buildProductFormData();

            const res = await API.post(
                "/product/add",
                finalFormData
            );

            toast.success(res.data.message);

            setShowModal(false);
            resetForm();

            if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                await getAllProducts(1);
            }
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to add product"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // DELETE MODAL
    const handleDeleteModal = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    // DELETE PRODUCT
    const handleDeleteProduct = async () => {
        try {
            setDataLoading(true);

            const res = await API.delete(
                `/product/delete/${deleteId}`
            );

            toast.success(
                res.data.message || "Product deleted successfully"
            );

            setShowDeleteModal(false);
            setDeleteId(null);

            await getAllProducts();
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to delete product"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // CHANGE PRODUCT STATUS
    const changeStatus = async (id) => {
        try {
            setDataLoading(true);

            const res = await API.patch(
                "/product/update/status",
                { id }
            );

            toast.success(
                res.data.message || "Product status updated"
            );

            await getAllProducts();
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to change product status"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // VIEW PRODUCT
    const handleProductView = (id) => {
        navigate(`/admin/products/${id}`);
    };

    // EDIT PRODUCT
    const handleProductEdit = (product) => {
        setEditId(product._id);
        setIsEdit(true);

        setFormData({
            category: product.category?._id || "",
            subcategory: product.subcategory?._id || "",
            brand: product.brand?._id || "",
            name: product.name,
            description: product.description,
            images: [],
            unit: product.unit,
            tags: product.tags || [],
            isFeatured: product.isFeatured,
        });

        // PRESERVE SELECTED DROPDOWN OPTIONS
        setSelectedOptions({
            category: product.category || null,
            subcategory: product.subcategory || null,
            brand: product.brand || null,
        });

        setExistingImages(product.images || []);
        setShowModal(true);
    };

    // UPDATE PRODUCT
    const handleEditProduct = async (e) => {
        e.preventDefault();

        try {
            setDataLoading(true);

            const finalFormData = buildProductFormData();

            const res = await API.put(
                `/product/update/${editId}`,
                finalFormData
            );

            toast.success(
                res.data.message || "Product updated successfully"
            );

            setShowModal(false);
            setEditId(null);
            resetForm();

            await getAllProducts();
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to update product"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // SEARCH DEBOUNCE
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setCurrentPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    // FETCH PRODUCTS
    useEffect(() => {
        getAllProducts(currentPage);
    }, [currentPage, limit, debouncedSearch]);

    // PERMISSION CHECK
    if (
        !permissions.some((permission) =>
            permission.includes("product")
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
        totalProductCount === 0
            ? 0
            : (currentPage - 1) * limit + 1;

    const endItem = Math.min(
        currentPage * limit,
        totalProductCount
    );

    return (
        <div className="space-y-6">

            {/* PAGE HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Products
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage your products, listings and product status.
                    </p>
                </div>

                {permissions.includes("product:add") && (
                    <button
                        type="button"
                        onClick={handleAddProductModal}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:brightness-110 active:scale-[0.98]"
                    >
                        <FiPlus size={19} />
                        Add Product
                    </button>
                )}
            </div>

            {/* STATISTICS */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {/* TOTAL */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Total Products
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {totalProductCount.toLocaleString("en-IN")}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FiPackage size={24} />
                        </div>
                    </div>
                </div>

                {/* ACTIVE */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Active Products
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-green-600">
                                {activeProductCount.toLocaleString("en-IN")}
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
                                Inactive Products
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-red-500">
                                {inactiveProductCount.toLocaleString("en-IN")}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                            <FiXCircle size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* SEARCH + PAGE LIMIT */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="relative w-full sm:max-w-md">
                        <FiSearch
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={19}
                        />

                        <input
                            type="text"
                            placeholder="Search by product name..."
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
                            {totalProductCount}
                        </span>{" "}
                        products
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

            {/* PRODUCT TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-250">

                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                {[
                                    "Product",
                                    "Category",
                                    "Brand",
                                    "Rating",
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
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <tr
                                        key={product._id}
                                        className="transition hover:bg-slate-50"
                                    >

                                        {/* PRODUCT */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-[#003963]">
                                                    {product.images?.[0]?.url ? (
                                                        <img
                                                            src={product.images[0].url}
                                                            alt={product.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <FiPackage size={20} />
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-slate-800">
                                                        {product.name}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        ID: #{product._id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* CATEGORY */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-700">
                                                {product.category?.name || "—"}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                {product.subcategory?.name || "—"}
                                            </p>
                                        </td>

                                        {/* BRAND */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-700">
                                                {product.brand?.name || "—"}
                                            </p>
                                        </td>

                                        {/* RATING */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
                                                <FiStar
                                                    className="fill-amber-400 text-amber-400"
                                                    size={15}
                                                />

                                                {Number(product.rating || 0).toFixed(1)}

                                                <span className="text-xs text-slate-400">
                                                    ({product.totalReviews || 0})
                                                </span>
                                            </div>
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-6 py-4">
                                            <button
                                                disabled={!permissions.includes("product:status")}
                                                type="button"
                                                onClick={() => changeStatus(product._id)}
                                                className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${product.isActive
                                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                        : "bg-red-100 text-red-700 hover:bg-red-200"
                                                    }`}
                                            >
                                                {product.isActive ? "active" : "inactive"}
                                            </button>
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">

                                                {permissions.includes("product:read") && (
                                                    <button
                                                        type="button"
                                                        title="View Product"
                                                        onClick={() => handleProductView(product._id)}
                                                        className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                    >
                                                        <FiEye size={18} />
                                                    </button>
                                                )}

                                                {permissions.includes("product:update") && (
                                                    <button
                                                        type="button"
                                                        title="Edit Product"
                                                        onClick={() => handleProductEdit(product)}
                                                        className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                                                    >
                                                        <FiEdit2 size={18} />
                                                    </button>
                                                )}

                                                {permissions.includes("product:delete") && (
                                                    <button
                                                        type="button"
                                                        title="Delete Product"
                                                        onClick={() => handleDeleteModal(product._id)}
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
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <FiPackage
                                            size={40}
                                            className="mx-auto text-slate-300"
                                        />

                                        <p className="mt-3 font-medium text-slate-600">
                                            No products found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            Try changing your search or add a new product.
                                        </p>
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
                                onClick={() => setCurrentPage(1)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#047857] hover:bg-emerald-50 hover:text-[#047857] disabled:cursor-not-allowed disabled:opacity-40"
                                title="First page"
                            >
                                <FiChevronsLeft size={17} />
                            </button>

                            {/* PREVIOUS */}
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

                            {/* FIRST PAGE + ELLIPSIS */}
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

                            {/* PAGE NUMBERS */}
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

                            {/* LAST PAGE + ELLIPSIS */}
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

                            {/* NEXT */}
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

                            {/* LAST */}
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

            {/* PRODUCT MODAL */}
            {showModal && (
                <FormModal
                    setShowModal={setShowModal}
                    handleAddProduct={handleAddProduct}
                    handleEditProduct={handleEditProduct}
                    formData={formData}
                    setFormData={setFormData}
                    handleChange={handleChange}
                    isEdit={isEdit}
                    tagInput={tagInput}
                    setTagInput={setTagInput}
                    existingImages={existingImages}
                    setExistingImages={setExistingImages}
                    selectedOptions={selectedOptions}
                />
            )}

            {/* DELETE MODAL */}
            {showDeleteModal && (
                <DeleteModal
                    setShowDeleteModal={setShowDeleteModal}
                    handleDeleteProduct={handleDeleteProduct}
                />
            )}
        </div>
    );
};

export default Product;