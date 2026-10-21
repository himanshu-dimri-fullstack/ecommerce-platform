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
} from "react-icons/fi";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../api/axios";
import DeleteModal from "../../components/brand/DeleteModal";
import FormModal from "../../components/brand/FormModal";
import DataLoader from "../../components/DataLoader";
import { useSelector } from "react-redux"

const Brand = () => {
    const user = useSelector((store) => store.auth.user)
    const navigate = useNavigate();
    const [dataLoading, setDataLoading] = useState(true)

    const [search, setSearch] = useState("");
    const [brands, setBrands] = useState([]);

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
    const [existingImage, setExistingImage] = useState(null)

    // =========================
    // STATISTICS
    // =========================

    const totalBrands = brands.length;

    const activeBrands = brands.filter(
        (brand) => brand.status === "active"
    ).length;

    const inactiveBrands = brands.filter(
        (brand) => brand.status === "inactive"
    ).length;

    // =========================
    // FORM CHANGE
    // =========================

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (files) {
            setFormData((prev) => ({
                ...prev,
                [name]: files[0]
            }))
        }
        else {
            setFormData((prev) => ({
                ...prev,
                [name]: value
            }))
        }
    };

    // =========================
    // GET ALL BRANDS
    // =========================

    const getAllBrands = async () => {
        try {
            const res = await API.get("/admin/brands");

            setBrands(res.data.brands || []);
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to fetch brands"
            );
        }
        finally {
            setDataLoading(false)
        }
    };

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
        setExistingImage(null)

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
            finalFormData.append("image", formData.image);

            setDataLoading(true);

            const res = await API.post(
                "/admin/brands",
                finalFormData
            );

            await getAllBrands();
            toast.success(res.data.message)
        } catch (error) {
            toast.error(
                error?.response?.data?.message)
        } finally {
            setDataLoading(false)
            setShowModal(false)
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
        });
        if (brand.image) {
            setExistingImage(brand.image?.url)
        }

        setShowModal(true);
    };

    // =========================
    // UPDATE BRAND
    // =========================

    const handleEditBrand = async (e) => {
        e.preventDefault()

        try {
            const finalFormData = new FormData()

            finalFormData.append("name", formData.name)
            finalFormData.append("description", formData.description)
            if (formData.image) {
                finalFormData.append("image", formData.image)
            }
            else if (existingImage) {
                finalFormData.append("existingImage", existingImage)
            }


            setDataLoading(true)

            const res = await API.put(
                `/admin/brands/${editId}`,
                finalFormData
            );

            await getAllBrands()

            toast.success(res.data.message)

        } catch (error) {
            toast.error(error?.response?.data?.message)
        } finally {
            setDataLoading(false)
            setShowModal(false)
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
                `/admin/brands/${deleteId}`
            );

            await getAllBrands();

            toast.success(
                res.data.message)
        } catch (error) {
            toast.error(
                error?.response?.data?.message)
        } finally {
            setDataLoading(false);
            setShowDeleteModal(false);
            setDeleteId(null);
        }
    };

    // =========================
    // CHANGE STATUS
    // =========================

    const changeStatus = async (id) => {
        try {
            setDataLoading(true)

            const res = await API.patch(
                `/admin/brands/status/${id}`
            );

            await getAllBrands()

            toast.success(
                res.data.message
            );
        } catch (error) {
            toast.error(
                error?.response?.data?.message
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
    // SEARCH
    // =========================

    const filteredBrands = brands.filter((brand) => {
        const searchValue = search.toLowerCase();

        return (
            brand.name?.toLowerCase().includes(searchValue) ||
            brand.slug?.toLowerCase().includes(searchValue)
        );
    });

    // =========================
    // INITIAL FETCH
    // =========================

    useEffect(() => {
        getAllBrands();
    }, []);

    if (!user?.role.permissions.some((permission) => permission.includes("brand"))) {
        return <Navigate to="/admin/dashboard" replace />
    }

    if (dataLoading) {
        return <DataLoader />
    }

    return (
        <div className="space-y-6">

            {/* PAGE HEADER */}

            <div>
                <h1 className="text-2xl font-bold text-slate-800">
                    Brands
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Manage your product brands and their status.
                </p>
            </div>

            {/* STAT CARDS */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {/* TOTAL */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
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

                {/* ACTIVE */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
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

                {/* INACTIVE */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
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
                            placeholder="Search brands..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="
                                w-full rounded-xl border border-slate-200
                                bg-slate-50 py-2.5 pl-10 pr-4 text-sm
                                outline-none transition
                                focus:border-[#003963] focus:bg-white
                                focus:ring-2 focus:ring-[#003963]/10
                            "
                        />
                    </div>

                    {
                        user?.role?.permissions.includes("brand:add") &&
                        <button
                            type="button"
                            onClick={handleAddBrandModal}
                            className="
                            flex items-center justify-center gap-2
                            rounded-xl  bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] px-5 py-2.5
                            text-sm font-semibold text-white
                            transition active:scale-95
                        "
                        >
                            <FiPlus size={19} />
                            Add Brand
                        </button>


                    }


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
                            {filteredBrands.length > 0 ? (
                                filteredBrands.map((brand) => (
                                    <tr
                                        key={brand._id}
                                        className="transition hover:bg-slate-50"
                                    >
                                        {/* BRAND */}

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {brand.image?.url ? (
                                                    <img
                                                        src={brand.image.url}
                                                        alt={brand.name}
                                                        className="h-11 w-11 rounded-xl border border-slate-200 bg-white object-contain p-1"
                                                    />
                                                ) : (
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#003963]/10 text-[#003963]">
                                                        <FiAward size={20} />
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
                                                type="button"
                                                onClick={() =>
                                                    changeStatus(
                                                        brand._id
                                                    )
                                                }
                                                className={`
                                            rounded-lg
                                            p-2
                                            transition
                                            ${brand?.status === "active"
                                                        ? "text-green-500 text-sm bg-green-100"
                                                        : "text-red-600 text-sm bg-red-100"
                                                    }
                                        `}
                                            >
                                                {brand?.status === "active" ? (
                                                    "active"
                                                ) : (
                                                    "inactive"
                                                )}

                                            </button>
                                        </td>

                                        {/* ACTIONS */}

                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">

                                                {/* VIEW */}

                                                <div className="group relative">
                                                    {
                                                        user?.role?.permissions.includes("brand:read") &&
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
                                                    }


                                                    <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                                                        View
                                                    </span>
                                                </div>

                                                {/* EDIT */}

                                                <div className="group relative">
                                                    {
                                                        user?.role?.permissions.includes("brand:update") &&
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
                                                    }


                                                    <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                                                        Edit
                                                    </span>
                                                </div>

                                                {/* DELETE */}

                                                <div className="group relative">
                                                    {
                                                        user?.role?.permissions.includes("brand:delete") &&
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
                                                    }


                                                    <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                                                        Delete
                                                    </span>
                                                </div>

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-12 text-center"
                                    >
                                        <FiAward
                                            size={40}
                                            className="mx-auto text-slate-300"
                                        />

                                        <p className="mt-3 font-medium text-slate-600">
                                            No brands found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            Try changing your search or add a new brand.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
