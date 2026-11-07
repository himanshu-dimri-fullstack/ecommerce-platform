import React, { useEffect, useState } from "react";
import {
    FiSearch,
    FiPlus,
    FiEye,
    FiEdit2,
    FiTrash2,
    FiCheckCircle,
    FiXCircle,
    FiAward,
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
} from "react-icons/fi";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../api/axios";
import DeleteModal from "../../components/brand/DeleteModal";
import FormModal from "../../components/brand/FormModal";
import DataLoader from "../../components/DataLoader";
import { useSelector } from "react-redux";

const Brand = () => {
    const user = useSelector((store) => store.auth.user);
    const navigate = useNavigate();

    const [dataLoading, setDataLoading] = useState(true);

    // SEARCH & PAGINATION
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    // BRAND DATA
    const [brands, setBrands] = useState([]);
    const [totalBrands, setTotalBrands] = useState(0);
    const [activeBrands, setActiveBrands] = useState(0);
    const [inactiveBrands, setInactiveBrands] = useState(0);
    const [filteredCount, setFilteredCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

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
                [name]: files[0],
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // =========================
    // GET ALL BRANDS
    // =========================

    const getAllBrands = async (
        page = currentPage,
        limit = entriesPerPage,
        searchValue = debouncedSearch
    ) => {
        try {
            const res = await API.get("/brand/get", {
                params: {
                    page,
                    limit,
                    search: searchValue,
                },
            });

            setBrands(res.data.brands || []);
            setTotalBrands(res.data.totalBrands || 0);
            setActiveBrands(res.data.activeBrands || 0);
            setInactiveBrands(res.data.inactiveBrands || 0);
            setFilteredCount(res.data.filteredCount || 0);
            setTotalPages(res.data.totalPages || 0);

            // Backend may adjust the page after deleting the last item.
            if (res.data.currentPage && res.data.currentPage !== currentPage) {
                setCurrentPage(res.data.currentPage);
            }
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to fetch brands"
            );
        } finally {
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
    // FETCH ON FILTER CHANGE
    // =========================

    useEffect(() => {
        getAllBrands(currentPage, entriesPerPage, debouncedSearch);
    }, [currentPage, entriesPerPage, debouncedSearch]);

    // =========================
    // ADD MODAL
    // =========================

    const handleAddBrandModal = () => {
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
    // ADD BRAND
    // =========================

    const handleAddBrand = async (e) => {
        e.preventDefault();

        try {
            const finalFormData = new FormData();

            finalFormData.append("name", formData.name);
            finalFormData.append("description", formData.description);

            if (formData.image) {
                finalFormData.append("image", formData.image);
            }

            setDataLoading(true);

            const res = await API.post(
                "/brand/add",
                finalFormData
            );

            setShowModal(false);
            setCurrentPage(1);

            // Refresh the first page because new brands are sorted first.
            await getAllBrands(1, entriesPerPage, debouncedSearch);

            toast.success(res.data.message);
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to add brand"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // =========================
    // EDIT MODAL
    // =========================

    const handleBrandEdit = (brand) => {
        setEditId(brand._id);
        setIsEdit(true);

        setFormData({
            name: brand.name,
            description: brand.description,
            image: "",
        });

        setExistingImage(brand.image?.url || null);
        setShowModal(true);
    };

    // =========================
    // UPDATE BRAND
    // =========================

    const handleEditBrand = async (e) => {
        e.preventDefault();

        try {
            const finalFormData = new FormData();

            finalFormData.append("name", formData.name);
            finalFormData.append("description", formData.description);

            if (formData.image) {
                finalFormData.append("image", formData.image);
            } else if (existingImage) {
                finalFormData.append("existingImage", existingImage);
            }

            setDataLoading(true);

            const res = await API.put(
                `/brand/update/${editId}`,
                finalFormData
            );

            setShowModal(false);

            await getAllBrands(
                currentPage,
                entriesPerPage,
                debouncedSearch
            );

            toast.success(res.data.message);
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to update brand"
            );
        } finally {
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
    // DELETE BRAND
    // =========================

    const handleDeleteBrand = async () => {
        try {
            setDataLoading(true);

            const res = await API.delete(
                `/brand/delete/${deleteId}`
            );

            setShowDeleteModal(false);
            setDeleteId(null);

            await getAllBrands(
                currentPage,
                entriesPerPage,
                debouncedSearch
            );

            toast.success(res.data.message);
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to delete brand"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // =========================
    // CHANGE STATUS
    // =========================

    const changeStatus = async (id) => {
        try {
            setDataLoading(true);

            const res = await API.patch(
                `/brand/update/status/${id}`
            );

            await getAllBrands(
                currentPage,
                entriesPerPage,
                debouncedSearch
            );

            toast.success(res.data.message);
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to update brand status"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // =========================
    // VIEW BRAND
    // =========================

    const handleBrandView = (id) => {
        navigate(`/admin/brands/${id}`);
    };

    // =========================
    // PAGINATION
    // =========================

    const startIndex =
        filteredCount === 0
            ? 0
            : (currentPage - 1) * entriesPerPage + 1;

    const endIndex = Math.min(
        currentPage * entriesPerPage,
        filteredCount
    );

    const getPageNumbers = () => {
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

    // =========================
    // PERMISSION CHECK
    // =========================

    if (
        !user?.role?.permissions?.some((permission) =>
            permission.includes("brand")
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
                        Brands
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage your product brands and their status.
                    </p>
                </div>

                {user?.role?.permissions?.includes("brand:add") && (
                    <button
                        type="button"
                        onClick={handleAddBrandModal}
                        className="
                            flex items-center justify-center gap-2
                            rounded-xl bg-linear-to-br from-[#064e3b]
                            via-[#047857] to-[#022c22]
                            px-5 py-3 text-sm font-semibold text-white
                            shadow-sm transition hover:shadow-md
                            active:scale-95
                        "
                    >
                        <FiPlus size={19} />
                        Add Brand
                    </button>
                )}
            </div>

            {/* STAT CARDS */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {/* TOTAL BRANDS */}

                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-blue-50 blur-2xl" />

                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Total Brands
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {totalBrands}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FiAward size={24} />
                        </div>
                    </div>
                </div>

                {/* ACTIVE BRANDS */}

                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-green-50 blur-2xl" />

                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Active Brands
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-green-600">
                                {activeBrands}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                            <FiCheckCircle size={24} />
                        </div>
                    </div>
                </div>

                {/* INACTIVE BRANDS */}

                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-red-50 blur-2xl" />

                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Inactive Brands
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-red-500">
                                {inactiveBrands}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                            <FiXCircle size={24} />
                        </div>
                    </div>
                </div>

            </div>

            {/* SEARCH & ENTRIES */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    {/* SEARCH */}

                    <div className="relative w-full lg:max-w-md">
                        <FiSearch
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                            size={19}
                        />

                        <input
                            type="text"
                            placeholder="Search brands by name or slug..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="
                                w-full rounded-xl border border-slate-200
                                bg-slate-50 py-3 pl-11 pr-4 text-sm
                                text-slate-700 outline-none transition
                                placeholder:text-slate-400
                                focus:border-emerald-600 focus:bg-white
                                focus:ring-2 focus:ring-emerald-600/10
                            "
                        />
                    </div>

                    {/* ENTRIES PER PAGE */}

                    <div className="flex items-center gap-3">
                        <label
                            htmlFor="brandEntries"
                            className="whitespace-nowrap text-sm font-medium text-slate-500"
                        >
                            Show entries
                        </label>

                        <select
                            id="brandEntries"
                            value={entriesPerPage}
                            onChange={(e) => {
                                setEntriesPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="
                                rounded-xl border border-slate-200
                                bg-slate-50 px-4 py-3 text-sm font-medium
                                text-slate-700 outline-none transition
                                focus:border-emerald-600 focus:ring-2
                                focus:ring-emerald-600/10
                            "
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>

                </div>

                <div className="mt-4 flex flex-col gap-1 border-t border-slate-100 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        Showing{" "}
                        <span className="font-semibold text-slate-700">
                            {startIndex}
                        </span>{" "}
                        to{" "}
                        <span className="font-semibold text-slate-700">
                            {endIndex}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-slate-700">
                            {filteredCount}
                        </span>{" "}
                        {search ? "filtered" : ""} brands
                    </p>

                    {search && (
                        <p>
                            Search results for:{" "}
                            <span className="font-semibold text-emerald-700">
                                "{search}"
                            </span>
                        </p>
                    )}
                </div>
            </div>

            {/* BRANDS TABLE */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-200">

                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Brand
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
                            {brands.length > 0 ? (
                                brands.map((brand) => (
                                    <tr
                                        key={brand._id}
                                        className="transition hover:bg-emerald-50/30"
                                    >
                                        {/* BRAND */}

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {brand.image?.url ? (
                                                    <img
                                                        src={brand.image.url}
                                                        alt={brand.name}
                                                        className="h-12 w-12 rounded-xl border border-slate-200 bg-white object-contain p-1"
                                                    />
                                                ) : (
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                                        <FiAward size={21} />
                                                    </div>
                                                )}

                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-800">
                                                        {brand.name}
                                                    </p>

                                                    <p className="max-w-56 truncate text-xs text-slate-400">
                                                        ID: #{brand._id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* SLUG */}

                                        <td className="px-6 py-4">
                                            <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs text-slate-600">
                                                {brand.slug || "-"}
                                            </span>
                                        </td>

                                        {/* STATUS */}

                                        <td className="px-6 py-4">
                                            <button
                                                disabled={
                                                    !user?.role?.permissions?.includes("brand:status")
                                                }
                                                type="button"
                                                onClick={() => changeStatus(brand._id)}
                                                className={`
                                                    rounded-lg px-3 py-2 text-xs
                                                    font-semibold transition
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-70
                                                    ${brand.status === "active"
                                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                        : "bg-red-100 text-red-600 hover:bg-red-200"
                                                    }
                                                `}
                                            >
                                                {brand.status === "active"
                                                    ? "Active"
                                                    : "Inactive"}
                                            </button>
                                        </td>

                                        {/* ACTIONS */}

                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">

                                                {/* VIEW */}

                                                {user?.role?.permissions?.includes("brand:read") && (
                                                    <div className="group relative">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleBrandView(brand._id)
                                                            }
                                                            aria-label="View brand"
                                                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                        >
                                                            <FiEye size={18} />
                                                        </button>

                                                        <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                                                            View
                                                        </span>
                                                    </div>
                                                )}

                                                {/* EDIT */}

                                                {user?.role?.permissions?.includes("brand:update") && (
                                                    <div className="group relative">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleBrandEdit(brand)
                                                            }
                                                            aria-label="Edit brand"
                                                            className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                                                        >
                                                            <FiEdit2 size={18} />
                                                        </button>

                                                        <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                                                            Edit
                                                        </span>
                                                    </div>
                                                )}

                                                {/* DELETE */}

                                                {user?.role?.permissions?.includes("brand:delete") && (
                                                    <div className="group relative">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDeleteModal(brand._id)
                                                            }
                                                            aria-label="Delete brand"
                                                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                                        >
                                                            <FiTrash2 size={18} />
                                                        </button>

                                                        <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                                                            Delete
                                                        </span>
                                                    </div>
                                                )}

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-16 text-center"
                                    >
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                            <FiAward size={30} />
                                        </div>

                                        <p className="mt-4 font-semibold text-slate-700">
                                            No brands found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            {search
                                                ? "Try changing your search keyword."
                                                : "Add your first brand to get started."}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}

                {filteredCount > 0 && (
                    <div className="flex flex-col gap-4 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

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
                                className="
                                    flex h-9 w-9 items-center justify-center
                                    rounded-lg border border-slate-200
                                    text-slate-600 transition
                                    hover:border-emerald-600 hover:bg-emerald-50
                                    hover:text-emerald-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                                aria-label="First page"
                            >
                                <FiChevronsLeft size={17} />
                            </button>

                            {/* PREVIOUS */}

                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                                }
                                className="
                                    flex h-9 w-9 items-center justify-center
                                    rounded-lg border border-slate-200
                                    text-slate-600 transition
                                    hover:border-emerald-600 hover:bg-emerald-50
                                    hover:text-emerald-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                                aria-label="Previous page"
                            >
                                <FiChevronLeft size={17} />
                            </button>

                            {/* PAGE NUMBERS */}

                            {getPageNumbers().map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={`
                                        flex h-9 min-w-9 items-center
                                        justify-center rounded-lg px-3
                                        text-sm font-semibold transition
                                        ${currentPage === page
                                            ? "bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] text-white shadow-sm"
                                            : "border border-slate-200 text-slate-600 hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                        }
                                    `}
                                >
                                    {page}
                                </button>
                            ))}

                            {/* NEXT */}

                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(prev + 1, totalPages)
                                    )
                                }
                                className="
                                    flex h-9 w-9 items-center justify-center
                                    rounded-lg border border-slate-200
                                    text-slate-600 transition
                                    hover:border-emerald-600 hover:bg-emerald-50
                                    hover:text-emerald-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                                aria-label="Next page"
                            >
                                <FiChevronRight size={17} />
                            </button>

                            {/* LAST PAGE */}

                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(totalPages)}
                                className="
                                    flex h-9 w-9 items-center justify-center
                                    rounded-lg border border-slate-200
                                    text-slate-600 transition
                                    hover:border-emerald-600 hover:bg-emerald-50
                                    hover:text-emerald-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                                aria-label="Last page"
                            >
                                <FiChevronsRight size={17} />
                            </button>

                        </div>
                    </div>
                )}
            </div>

            {/* FORM MODAL */}

            {showModal && (
                <FormModal
                    setShowModal={setShowModal}
                    handleAddBrand={handleAddBrand}
                    handleEditBrand={handleEditBrand}
                    formData={formData}
                    handleChange={handleChange}
                    isEdit={isEdit}
                    existingImage={existingImage}
                    setExistingImage={setExistingImage}
                />
            )}

            {/* DELETE MODAL */}

            {showDeleteModal && (
                <DeleteModal
                    setShowDeleteModal={setShowDeleteModal}
                    handleDeleteBrand={handleDeleteBrand}
                />
            )}

        </div>
    );
};

export default Brand;