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
    FiLayers,
} from "react-icons/fi";
import { API } from "../../api/axios";
import { useState, useEffect } from "react";
import DataLoader from "../../components/DataLoader";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const SubcategoryDetail = () => {
    const { id } = useParams();
    const user = useSelector((store) => store.auth.user)

    const [dataLoading, setDataLoading] = useState(true)
    const [subcategory, setSubcategory] = useState({});

    useEffect(() => {
        const fetchSubcategory = async () => {
            try {
                const res = await API.get(`/subcategory/get/${id}`);

                setSubcategory(res.data.subcategory);
            } catch (error) {
                console.log(error);
            }
            finally {
                setDataLoading(false)
            }
        };

        fetchSubcategory();
    }, [id]);

    const parentCategory =
        typeof subcategory.category === "object"
            ? subcategory.category
            : null;


    if (!user?.role.permissions.some((permission) => permission.includes("subcategory"))) {
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
                            to="/admin/subcategories"
                            className="transition hover:text-[#003963]"
                        >
                            Subcategories
                        </Link>

                        <span>/</span>

                        <span className="text-gray-700">
                            View Subcategory
                        </span>

                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                        Subcategory Details
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        View complete information about this subcategory.
                    </p>

                </div>

                <Link
                    to="/admin/subcategories"
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

                {/* Subcategory Profile Card */}

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                    <div className="flex flex-col items-center text-center">

                        {/* Subcategory Image */}

                        <div
                            className="
                                mb-5 flex h-32 w-32
                                items-center justify-center
                                overflow-hidden rounded-2xl
                                border border-gray-100
                                bg-slate-50
                                shadow-sm
                            "
                        >
                            {subcategory.image?.url ? (
                                <img
                                    src={subcategory.image.url}
                                    alt={
                                        subcategory.name ||
                                        "Subcategory"
                                    }
                                    className="
                                        h-full w-full
                                        object-cover
                                    "
                                />
                            ) : (
                                <div
                                    className="
                                        flex h-full w-full
                                        items-center justify-center
                                        bg-[#003963]
                                        text-white
                                    "
                                >
                                    <FiLayers size={42} />
                                </div>
                            )}

                        </div>


                        <h2 className="text-xl font-bold text-gray-800">
                            {subcategory.name || "-"}
                        </h2>

                        <p className="mt-1 break-all text-sm text-gray-500">
                            {subcategory.slug || "-"}
                        </p>


                        {/* Status */}

                        <span
                            className={`
                                mt-4 rounded-full px-4 py-1.5
                                text-xs font-semibold
                                ${subcategory.status?.toLowerCase() ===
                                    "active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }
                            `}
                        >
                            {subcategory.status || "Active"}
                        </span>

                    </div>


                    <div className="my-6 border-t border-gray-100" />


                    <div className="space-y-4">

                        {/* Subcategory Name */}

                        <div className="flex items-center gap-3">

                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiTag className="text-[#003963]" />
                            </div>

                            <div>

                                <p className="text-xs text-gray-500">
                                    Subcategory
                                </p>

                                <p className="font-medium text-gray-800">
                                    {subcategory.name || "-"}
                                </p>

                            </div>

                        </div>


                        {/* Parent Category */}

                        <div className="flex items-center gap-3">

                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiGrid className="text-[#003963]" />
                            </div>

                            <div>

                                <p className="text-xs text-gray-500">
                                    Parent Category
                                </p>

                                <p className="font-medium text-gray-800">
                                    {parentCategory?.name ||
                                        subcategory.category?.name ||
                                        "-"}
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
                                    {subcategory.createdAt
                                        ? new Date(
                                            subcategory.createdAt
                                        ).toLocaleDateString()
                                        : "-"}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* Subcategory Information */}

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">

                    <div className="mb-6">

                        <h2 className="text-lg font-bold text-gray-800">
                            Subcategory Information
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Basic information associated with this
                            subcategory.
                        </p>

                    </div>


                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        {/* Subcategory Name */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">

                                <FiTag />

                                <span className="text-sm">
                                    Subcategory Name
                                </span>

                            </div>

                            <p className="font-semibold text-gray-800">
                                {subcategory.name || "-"}
                            </p>

                        </div>


                        {/* Slug */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">

                                <FiLink />

                                <span className="text-sm">
                                    Subcategory Slug
                                </span>

                            </div>

                            <p className="break-all font-semibold text-gray-800">
                                {subcategory.slug || "-"}
                            </p>

                        </div>


                        {/* Parent Category */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">

                                <FiGrid />

                                <span className="text-sm">
                                    Parent Category
                                </span>

                            </div>

                            <p className="font-semibold text-gray-800">
                                {parentCategory?.name || "-"}
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
                                {subcategory.status || "Active"}
                            </p>

                        </div>


                        {/* Subcategory ID */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">

                                <FiGrid />

                                <span className="text-sm">
                                    Subcategory ID
                                </span>

                            </div>

                            <p className="break-all font-semibold text-gray-800">
                                {subcategory._id || "-"}
                            </p>

                        </div>


                        {/* Parent Category ID */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">

                                <FiLayers />

                                <span className="text-sm">
                                    Parent Category ID
                                </span>

                            </div>

                            <p className="break-all font-semibold text-gray-800">
                                {parentCategory?._id ||
                                    subcategory.category ||
                                    "-"}
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
                            {subcategory.description ||
                                "No description available."}
                        </p>

                    </div>


                    {/* Image Information */}

                    <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">

                        <div className="mb-3 flex items-center gap-2 text-gray-500">

                            <FiImage />

                            <span className="text-sm">
                                Subcategory Image
                            </span>

                        </div>


                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                            <div
                                className="
                                    h-20 w-20 shrink-0
                                    overflow-hidden rounded-lg
                                    border border-gray-200
                                    bg-white
                                "
                            >

                                {subcategory.image?.url ? (
                                    <img
                                        src={subcategory.image.url}
                                        alt={
                                            subcategory.name ||
                                            "Subcategory"
                                        }
                                        className="
                                            h-full w-full
                                            object-cover
                                        "
                                    />
                                ) : (
                                    <div
                                        className="
                                            flex h-full w-full
                                            items-center justify-center
                                            text-gray-400
                                        "
                                    >
                                        <FiImage size={24} />
                                    </div>
                                )}

                            </div>


                            <div className="min-w-0">

                                <p className="text-xs text-gray-500">
                                    Cloudinary Public ID
                                </p>

                                <p className="mt-1 break-all text-sm font-medium text-gray-700">
                                    {subcategory.image?.public_id ||
                                        "-"}
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* Timeline */}

                    <div className="mt-8 border-t border-gray-100 pt-6">

                        <h2 className="mb-5 text-lg font-bold text-gray-800">
                            Subcategory Timeline
                        </h2>


                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                            {/* Created */}

                            <div
                                className="
                                    flex items-center gap-4
                                    rounded-xl
                                    border border-gray-100
                                    p-4
                                "
                            >

                                <div className="rounded-lg bg-green-50 p-3">

                                    <FiCalendar className="text-green-600" />

                                </div>

                                <div>

                                    <p className="text-xs text-gray-500">
                                        Subcategory Created
                                    </p>

                                    <p className="font-medium text-gray-800">
                                        {subcategory.createdAt
                                            ? new Date(
                                                subcategory.createdAt
                                            ).toLocaleString()
                                            : "-"}
                                    </p>

                                </div>

                            </div>


                            {/* Updated */}

                            <div
                                className="
                                    flex items-center gap-4
                                    rounded-xl
                                    border border-gray-100
                                    p-4
                                "
                            >

                                <div className="rounded-lg bg-blue-50 p-3">

                                    <FiClock className="text-[#003963]" />

                                </div>

                                <div>

                                    <p className="text-xs text-gray-500">
                                        Last Updated
                                    </p>

                                    <p className="font-medium text-gray-800">
                                        {subcategory.updatedAt
                                            ? new Date(
                                                subcategory.updatedAt
                                            ).toLocaleString()
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

export default SubcategoryDetail;