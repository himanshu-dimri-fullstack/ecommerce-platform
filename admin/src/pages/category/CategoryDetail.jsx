import { Link, useParams } from "react-router-dom";
import {
    FiArrowLeft,
    FiGrid,
    FiTag,
    FiLink,
    FiCalendar,
    FiClock,
    FiImage,
    FiFileText,
} from "react-icons/fi";
import { API } from "../../api/axios";
import { useState, useEffect } from "react";
import DataLoader from "../../components/DataLoader";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom"

const CategoryDetail = () => {
    const user = useSelector((store) => store.auth.user)
    const { id } = useParams();
    const [category, setCategory] = useState({});
    const [dataLoading, setDataLoading] = useState(true)

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const res = await API.get(`/admin/categories/${id}`);
                setCategory(res.data.category);
            } catch (error) {
                console.log(error);
            }
            finally {
                setDataLoading(false)
            }
        };

        fetchCategory();
    }, [id]);

    if (!user?.role.permissions.some((permission) => permission.includes("category"))) {
        return <Navigate to="/admin/dashboard" replace />
    }
    if (dataLoading) {
        return <DataLoader />
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">

            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                    <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">

                        <Link
                            to="/admin/categories"
                            className="transition hover:text-[#003963]"
                        >
                            Categories
                        </Link>

                        <span>/</span>

                        <span className="text-gray-700">
                            View Category
                        </span>

                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                        Category Details
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        View complete information about this category.
                    </p>

                </div>

                <Link
                    to="/admin/categories"
                    className="
                        flex items-center gap-2 self-start
                        rounded-lg border border-gray-300
                        bg-white px-4 py-2.5
                        text-sm font-medium text-gray-700
                        transition hover:bg-gray-100
                    "
                >
                    <FiArrowLeft />
                    Back
                </Link>

            </div>

            {/* Main Card */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                {/* Category Profile Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                    <div className="flex flex-col items-center text-center">

                        {/* Category Image */}
                        <div className="
                            mb-5 flex h-32 w-32
                            items-center justify-center
                            overflow-hidden rounded-2xl
                            border border-gray-100
                            bg-slate-50
                            shadow-sm
                        ">

                            {category.image?.url ? (
                                <img
                                    src={category.image.url}
                                    alt={category.name || "Category"}
                                    className="
                                        h-full w-full
                                        object-cover
                                    "
                                />
                            ) : (
                                <div className="
                                    flex h-full w-full
                                    items-center justify-center
                                    bg-[#003963]
                                    text-white
                                ">
                                    <FiGrid size={42} />
                                </div>
                            )}

                        </div>

                        <h2 className="text-xl font-bold text-gray-800">
                            {category.name}
                        </h2>

                        <p className="mt-1 break-all text-sm text-gray-500">
                            {category.slug}
                        </p>

                        {/* Status */}
                        <span
                            className={`
                                mt-4 rounded-full px-4 py-1.5
                                text-xs font-semibold
                                ${category.status?.toLowerCase() === "active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }
                            `}
                        >
                            {category.status || "Active"}
                        </span>

                    </div>

                    <div className="my-6 border-t border-gray-100" />

                    <div className="space-y-4">

                        {/* Category Name */}
                        <div className="flex items-center gap-3">

                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiTag className="text-[#003963]" />
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Category
                                </p>

                                <p className="font-medium text-gray-800">
                                    {category.name}
                                </p>
                            </div>

                        </div>

                        {/* Created */}
                        <div className="flex items-center gap-3">

                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiCalendar className="text-[#003963]" />
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Created
                                </p>

                                <p className="font-medium text-gray-800">
                                    {category.createdAt
                                        ? new Date(category.createdAt).toLocaleDateString()
                                        : "-"}
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

                {/* Category Information */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">

                    <div className="mb-6">

                        <h2 className="text-lg font-bold text-gray-800">
                            Category Information
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Basic information associated with this category.
                        </p>

                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        {/* Category Name */}
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiTag />

                                <span className="text-sm">
                                    Category Name
                                </span>
                            </div>

                            <p className="font-semibold text-gray-800">
                                {category.name || "-"}
                            </p>

                        </div>

                        {/* Slug */}
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiLink />

                                <span className="text-sm">
                                    Category Slug
                                </span>
                            </div>

                            <p className="break-all font-semibold text-gray-800">
                                {category.slug || "-"}
                            </p>

                        </div>

                        {/* Status */}
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiGrid />

                                <span className="text-sm">
                                    Status
                                </span>
                            </div>

                            <p className="font-semibold text-gray-800">
                                {category.status || "Active"}
                            </p>

                        </div>

                        {/* Category ID */}
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiGrid />

                                <span className="text-sm">
                                    Category ID
                                </span>
                            </div>

                            <p className="break-all font-semibold text-gray-800">
                                {category._id || "-"}
                            </p>

                        </div>

                    </div>

                    {/* Description */}
                    <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">

                        <div className="mb-2 flex items-center gap-2 text-gray-500">
                            <FiFileText />

                            <span className="text-sm">
                                Description
                            </span>
                        </div>

                        <p className="text-sm leading-6 text-gray-700">
                            {category.description || "No description available."}
                        </p>

                    </div>

                    {/* Image Information */}
                    <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">

                        <div className="mb-3 flex items-center gap-2 text-gray-500">
                            <FiImage />

                            <span className="text-sm">
                                Category Image
                            </span>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                            <div className="
                                h-20 w-20 shrink-0
                                overflow-hidden rounded-lg
                                border border-gray-200
                                bg-white
                            ">
                                {category.image?.url ? (
                                    <img
                                        src={category.image.url}
                                        alt={category.name || "Category"}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="
                                        flex h-full w-full
                                        items-center justify-center
                                        text-gray-400
                                    ">
                                        <FiImage size={24} />
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0">

                                <p className="text-xs text-gray-500">
                                    Cloudinary Public ID
                                </p>

                                <p className="mt-1 break-all text-sm font-medium text-gray-700">
                                    {category.image?.public_id || "-"}
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* Account Information */}
                    <div className="mt-8 border-t border-gray-100 pt-6">

                        <h2 className="mb-5 text-lg font-bold text-gray-800">
                            Category Timeline
                        </h2>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                            {/* Created */}
                            <div className="flex items-center gap-4 rounded-xl border border-gray-100 p-4">

                                <div className="rounded-lg bg-green-50 p-3">
                                    <FiCalendar className="text-green-600" />
                                </div>

                                <div>

                                    <p className="text-xs text-gray-500">
                                        Category Created
                                    </p>

                                    <p className="font-medium text-gray-800">
                                        {category.createdAt
                                            ? new Date(category.createdAt).toLocaleString()
                                            : "-"}
                                    </p>

                                </div>

                            </div>

                            {/* Updated */}
                            <div className="flex items-center gap-4 rounded-xl border border-gray-100 p-4">

                                <div className="rounded-lg bg-blue-50 p-3">
                                    <FiClock className="text-[#003963]" />
                                </div>

                                <div>

                                    <p className="text-xs text-gray-500">
                                        Last Updated
                                    </p>

                                    <p className="font-medium text-gray-800">
                                        {category.updatedAt
                                            ? new Date(category.updatedAt).toLocaleString()
                                            : "-"}
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default CategoryDetail;