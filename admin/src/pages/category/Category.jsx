import React, { useEffect, useState } from "react";
import {
    FiSearch,
    FiPlus,
    FiEye,
    FiEdit2,
    FiTrash2,
    FiCheckCircle,
    FiXCircle,
    FiGrid,
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
    FiX,
} from "react-icons/fi";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../api/axios";
import DeleteModal from "../../components/category/DeleteModal";
import FormModal from "../../components/category/FormModal";
import DataLoader from "../../components/DataLoader";
import { useSelector } from "react-redux";

const Category = () => {
    const user = useSelector((store) => store.auth.user);
    const navigate = useNavigate();

    const permissions = user?.role?.permissions || [];

    // =========================
    // STATES
    // =========================

    const [dataLoading, setDataLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    const [totalCategories, setTotalCategories] = useState(0);
    const [activeCategories, setActiveCategories] = useState(0);
    const [inactiveCategories, setInactiveCategories] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image: "",
    });

    const [existingImage, setExistingImage] = useState(null);

    // =========================
    // FORM CHANGE
    // =========================

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (files) {
            setFormData((prev) => ({
                ...prev,
                image: files[0],
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // =========================
    // GET ALL CATEGORIES
    // =========================

    const getAllCategories = async (
        page = currentPage,
        searchValue = debouncedSearch,
        pageLimit = limit
    ) => {
        try {
            const res = await API.get("/category/get", {
                params: {
                    page,
                    limit: pageLimit,
                    search: searchValue,
                },
            });

            setCategories(res.data.categories || []);

            setTotalCategories(
                res.data.totalCategories || 0
            );

            setActiveCategories(
                res.data.activeCategories || 0
            );

            setInactiveCategories(
                res.data.inactiveCategories || 0
            );

            setTotalPages(res.data.totalPages || 0);
        } catch (error) {
            console.log(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to fetch categories"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // =========================
    // ADD CATEGORY MODAL
    // =========================

    const handleAddCategoryModal = () => {
        setIsEdit(false);
        setEditId(null);

        setFormData({
            name: "",
            description: "",
            image: "",
        });

        setExistingImage(null);
        setShowModal(true);
    };

    // =========================
    // ADD CATEGORY
    // =========================

    const handleAddCategory = async (e) => {
        e.preventDefault();

        try {
            setDataLoading(true);

            const finalFormData = new FormData();

            finalFormData.append("name", formData.name);
            finalFormData.append("description", formData.description);

            if (formData.image) {
                finalFormData.append("image", formData.image);
            }

            const res = await API.post(
                "/category/add",
                finalFormData
            );

            toast.success(res.data.message);

            setFormData({
                name: "",
                description: "",
                image: "",
            });

            setExistingImage(null);
            setShowModal(false);

            setCurrentPage(1);

            await getAllCategories(
                1,
                debouncedSearch,
                limit
            );
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to add category"
            );

            setDataLoading(false);
        }
    };

    // =========================
    // DELETE MODAL
    // =========================

    const handleDeleteModal = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    // =========================
    // DELETE CATEGORY
    // =========================

    const handleDeleteCategory = async () => {
        try {
            setDataLoading(true);

            const res = await API.delete(
                `/category/delete/${deleteId}`
            );

            toast.success(res.data.message);

            setShowDeleteModal(false);
            setDeleteId(null);

            if (categories.length === 1 && currentPage > 1) {
                setCurrentPage((prev) => prev - 1);
            } else {
                await getAllCategories();
            }
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to delete category"
            );

            setDataLoading(false);
        }
    };

    // =========================
    // CHANGE STATUS
    // =========================

    const changeStatus = async (id, status) => {
        try {
            setDataLoading(true);

            const res = await API.patch(
                "/category/update/status",
                {
                    id,
                    status,
                }
            );

            toast.success(res.data.message);

            await getAllCategories();
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to change category status"
            );

            setDataLoading(false);
        }
    };

    // =========================
    // VIEW CATEGORY
    // =========================

    const handleCategoryView = (id) => {
        navigate(`/admin/categories/${id}`);
    };

    // =========================
    // EDIT CATEGORY MODAL
    // =========================

    const handleEditCategoryModal = (category) => {
        setEditId(category._id);
        setIsEdit(true);

        setFormData({
            name: category.name || "",
            description: category.description || "",
            image: "",
        });

        setExistingImage(category.image?.url || null);
        setShowModal(true);
    };

    // =========================
    // EDIT CATEGORY
    // =========================

    const handleEditCategory = async (e) => {
        e.preventDefault();

        try {
            setDataLoading(true);

            const finalFormData = new FormData();

            finalFormData.append("name", formData.name);
            finalFormData.append("description", formData.description);

            if (formData.image) {
                finalFormData.append("image", formData.image);
            } else if (existingImage) {
                finalFormData.append("existingImage", existingImage);
            }

            const res = await API.put(
                `/category/update/${editId}`,
                finalFormData
            );

            toast.success(res.data.message);

            setFormData({
                name: "",
                description: "",
                image: "",
            });

            setExistingImage(null);
            setShowModal(false);

            await getAllCategories();
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to update category"
            );

            setDataLoading(false);
        }
    };

    // =========================
    // SEARCH DEBOUNCE
    // =========================

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setCurrentPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    // =========================
    // FETCH CATEGORIES
    // =========================

    useEffect(() => {
        getAllCategories();
    }, [currentPage, limit, debouncedSearch]);

    // =========================
    // PAGINATION NUMBERS
    // =========================

    const getPaginationNumbers = () => {
        if (totalPages <= 5) {
            return Array.from(
                { length: totalPages },
                (_, i) => i + 1
            );
        }

        if (currentPage <= 3) {
            return [1, 2, 3, 4, "...", totalPages];
        }

        if (currentPage >= totalPages - 2) {
            return [
                1,
                "...",
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages,
            ];
        }

        return [
            1,
            "...",
            currentPage - 1,
            currentPage,
            currentPage + 1,
            "...",
            totalPages,
        ];
    };

    // =========================
    // PERMISSIONS
    // =========================

    if (
        !permissions.some((permission) =>
            permission.includes("category")
        )
    ) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (dataLoading) {
        return <DataLoader />;
    }

    // =========================
    // PAGINATION INFO
    // =========================

    const startIndex =
        totalCategories === 0
            ? 0
            : (currentPage - 1) * limit + 1;

    const endIndex = Math.min(
        currentPage * limit,
        totalCategories
    );

    // =========================
    // UI
    // =========================

    return (
        <div className="space-y-6">

            {/* PAGE HEADER */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />

                        <span className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
                            Category Management
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold text-slate-800">
                        Categories
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage all product categories and their status.
                    </p>
                </div>

                {permissions.includes("category:add") && (
                    <button
                        onClick={handleAddCategoryModal}
                        className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-lg active:scale-95"
                    >
                        <FiPlus size={19} />
                        Add Category
                    </button>
                )}

            </div>

            {/* STAT CARDS */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {/* TOTAL */}

                <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

                    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-50 transition group-hover:scale-125" />

                    <div className="relative flex items-center justify-between">

                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Total Categories
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {totalCategories}
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                All registered categories
                            </p>
                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                            <FiGrid size={25} />
                        </div>

                    </div>
                </div>

                {/* ACTIVE */}

                <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

                    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-green-50 transition group-hover:scale-125" />

                    <div className="relative flex items-center justify-between">

                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Active Categories
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-green-600">
                                {activeCategories}
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Currently available
                            </p>
                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600">
                            <FiCheckCircle size={25} />
                        </div>

                    </div>
                </div>

                {/* INACTIVE */}

                <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

                    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-red-50 transition group-hover:scale-125" />

                    <div className="relative flex items-center justify-between">

                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Inactive Categories
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-red-500">
                                {inactiveCategories}
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Currently disabled
                            </p>
                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-500">
                            <FiXCircle size={25} />
                        </div>

                    </div>
                </div>

            </div>

            {/* SEARCH + ENTRIES */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                    {/* SEARCH */}

                    <div className="w-full sm:max-w-md">

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Search Categories
                        </label>

                        <div className="relative">

                            <FiSearch
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                size={19}
                            />

                            <input
                                type="text"
                                placeholder="Search by category name or slug..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-11 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                                    title="Clear search"
                                >
                                    <FiX size={17} />
                                </button>
                            )}

                        </div>
                    </div>

                    {/* SHOW ENTRIES */}

                    <div className="flex items-center gap-3">

                        <label className="whitespace-nowrap text-sm font-medium text-slate-500">
                            Show
                        </label>

                        <select
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>

                        <span className="whitespace-nowrap text-sm font-medium text-slate-500">
                            entries
                        </span>

                    </div>

                </div>

                {/* SEARCH INFO */}

                <div className="mt-4 flex flex-col gap-1 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-xs text-slate-400">
                        Showing{" "}
                        <span className="font-semibold text-slate-600">
                            {startIndex}-{endIndex}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-slate-600">
                            {totalCategories}
                        </span>{" "}
                        categories
                    </p>

                    {debouncedSearch && (
                        <p className="text-xs text-emerald-700">
                            Search results for:{" "}
                            <span className="font-semibold">
                                "{debouncedSearch}"
                            </span>
                        </p>
                    )}

                </div>

            </div>

            {/* CATEGORY TABLE */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* TABLE HEADER */}

                <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            Category List
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-400">
                            Manage all your registered categories
                        </p>
                    </div>

                    <span className="w-fit rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        {totalCategories} Total
                    </span>

                </div>

                {/* TABLE */}

                <div className="overflow-x-auto">

                    <table className="w-full min-w-200">

                        <thead className="border-b border-slate-200 bg-slate-50">

                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Category
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Slug
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Status
                                </th>

                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Actions
                                </th>
                            </tr>

                        </thead>

                        <tbody className="divide-y divide-slate-100">

                            {categories.length > 0 ? (
                                categories.map((category) => (

                                    <tr
                                        key={category._id}
                                        className="transition hover:bg-emerald-50/30"
                                    >

                                        {/* CATEGORY */}

                                        <td className="px-6 py-4">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-50 text-emerald-700">

                                                    {category.image?.url ? (
                                                        <img
                                                            src={category.image.url}
                                                            alt={category.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <FiGrid size={20} />
                                                    )}

                                                </div>

                                                <div className="min-w-0">

                                                    <p className="font-semibold text-slate-800">
                                                        {category.name}
                                                    </p>

                                                    <p className="mt-0.5 text-xs text-slate-400">
                                                        ID: #{category._id}
                                                    </p>

                                                </div>

                                            </div>

                                        </td>

                                        {/* SLUG */}

                                        <td className="px-6 py-4">

                                            <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs text-slate-600">
                                                {category.slug || "-"}
                                            </span>

                                        </td>

                                        {/* STATUS */}

                                        <td className="px-6 py-4">

                                            <button
                                                type="button"
                                                disabled={!permissions.includes("category:status")}
                                                onClick={() =>
                                                    changeStatus(
                                                        category._id,
                                                        category.status
                                                    )
                                                }
                                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${category.status === "active"
                                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                        : "bg-red-100 text-red-600 hover:bg-red-200"
                                                    }`}
                                            >
                                                {category.status === "active"
                                                    ? "Active"
                                                    : "Inactive"}
                                            </button>

                                        </td>

                                        {/* ACTIONS */}

                                        <td className="px-6 py-4">

                                            <div className="flex items-center justify-center gap-2">

                                                {permissions.includes("category:read") && (
                                                    <button
                                                        onClick={() =>
                                                            handleCategoryView(category._id)
                                                        }
                                                        title="View"
                                                        className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                    >
                                                        <FiEye size={18} />
                                                    </button>
                                                )}

                                                {permissions.includes("category:update") && (
                                                    <button
                                                        onClick={() =>
                                                            handleEditCategoryModal(category)
                                                        }
                                                        title="Edit"
                                                        className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                                                    >
                                                        <FiEdit2 size={18} />
                                                    </button>
                                                )}

                                                {permissions.includes("category:delete") && (
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteModal(category._id)
                                                        }
                                                        title="Delete"
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
                                    <td colSpan="4" className="px-6 py-16 text-center">

                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                            <FiGrid size={30} />
                                        </div>

                                        <p className="mt-4 font-semibold text-slate-700">
                                            No categories found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            {debouncedSearch
                                                ? "Try changing your search."
                                                : "Add a new category to get started."}
                                        </p>

                                    </td>
                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

                {/* TABLE FOOTER + PAGINATION */}

                <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-xs text-slate-400">
                        Showing{" "}
                        <span className="font-semibold text-slate-600">
                            {startIndex}-{endIndex}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-slate-600">
                            {totalCategories}
                        </span>{" "}
                        categories
                    </p>

                    {totalCategories > 0 && (
                        <div className="flex flex-wrap items-center gap-1">

                            {/* FIRST PAGE */}

                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(1)}
                                title="First page"
                                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <FiChevronsLeft size={17} />
                            </button>

                            {/* PREVIOUS PAGE */}

                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((prev) => prev - 1)}
                                title="Previous page"
                                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <FiChevronLeft size={17} />
                            </button>

                            {/* PAGE NUMBERS */}

                            {getPaginationNumbers().map((page, index) => (
                                page === "..." ? (
                                    <span
                                        key={`dots-${index}`}
                                        className="px-2 text-sm text-slate-400"
                                    >
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`min-w-9 rounded-lg px-3 py-2 text-sm font-semibold transition ${currentPage === page
                                                ? "bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] text-white shadow-sm"
                                                : "border border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                )
                            ))}

                            {/* NEXT PAGE */}

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((prev) => prev + 1)}
                                title="Next page"
                                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <FiChevronRight size={17} />
                            </button>

                            {/* LAST PAGE */}

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(totalPages)}
                                title="Last page"
                                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <FiChevronsRight size={17} />
                            </button>

                        </div>
                    )}

                </div>

            </div>

            {/* CATEGORY MODAL */}

            {showModal && (
                <FormModal
                    handleEditCategory={handleEditCategory}
                    isEdit={isEdit}
                    handleChange={handleChange}
                    setShowModal={setShowModal}
                    formData={formData}
                    handleAddCategory={handleAddCategory}
                    existingImage={existingImage}
                    setExistingImage={setExistingImage}
                />
            )}

            {/* DELETE MODAL */}

            {showDeleteModal && (
                <DeleteModal
                    setShowDeleteModal={setShowDeleteModal}
                    handleDeleteUser={handleDeleteCategory}
                />
            )}

        </div>
    );
};

export default Category;