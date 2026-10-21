import { Link, useParams } from "react-router-dom";
import {
    FiArrowLeft,
    FiUser,
    FiMail,
    FiPhone,
    FiShield,
    FiCalendar,
    FiClock,
} from "react-icons/fi";
import { API } from "../../api/axios";
import { useState, useEffect } from "react";
import DataLoader from "../../components/DataLoader";
import { useSelector } from "react-redux";

const UserDetail = () => {
    const { id } = useParams();
    const [dataLoading, setDataLoading] = useState(true)

    const role = useSelector((store) => store.auth.user.role)

    const [user, setUser] = useState({});
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await API.get(`/admin/user/${id}`);
                setUser(res.data.user);
            } catch (error) {
                toast.error(error?.response?.data?.message)
            }
            finally {
                setDataLoading(false)
            }
        };

        fetchUser();
    }, [id]);

    const fullName =
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "N/A";

    const status = user?.status || "inactive";

    if (!role?.permissions.some((permission) => permission.includes("user"))) {
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
                            to="/admin/users"
                            className="transition hover:text-[#003963]"
                        >
                            Users
                        </Link>

                        <span>/</span>

                        <span className="text-gray-700">
                            View User
                        </span>

                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                        User Details
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        View complete information about this user.
                    </p>

                </div>

                <Link
                    to="/admin/users"
                    className="
                        flex items-center gap-2
                        rounded-lg
                        border border-gray-300
                        bg-white
                        px-4 py-2.5
                        text-sm font-medium
                        text-gray-700
                        transition
                        hover:bg-gray-100
                    "
                >
                    <FiArrowLeft />
                    Back
                </Link>

            </div>


            {/* Main Card */}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                {/* Profile Card */}

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                    <div className="flex flex-col items-center text-center">

                        {/* Avatar */}

                        <div className="
                            mb-4
                            flex h-24 w-24
                            items-center justify-center
                            rounded-full
                            bg-[#003963]
                            text-3xl
                            font-bold
                            text-white
                        ">
                            {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
                        </div>


                        {/* Name */}

                        <h2 className="text-xl font-bold text-gray-800">
                            {fullName}
                        </h2>


                        {/* Email */}

                        <p className="mt-1 break-all text-sm text-gray-500">
                            {user?.email || "N/A"}
                        </p>


                        {/* Status */}

                        <span
                            className={`
                                mt-4
                                rounded-full
                                px-4 py-1.5
                                text-xs
                                font-semibold
                                ${status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }
                            `}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>

                    </div>


                    <div className="my-6 border-t border-gray-100" />


                    <div className="space-y-4">

                        {/* Role */}

                        <div className="flex items-center gap-3">

                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiShield className="text-[#003963]" />
                            </div>

                            <div>

                                <p className="text-xs text-gray-500">
                                    Role
                                </p>

                                <p className="font-medium text-gray-800">
                                    {user?.role?.name || "N/A"}
                                </p>

                            </div>

                        </div>


                        {/* Joined */}

                        <div className="flex items-center gap-3">

                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiCalendar className="text-[#003963]" />
                            </div>

                            <div>

                                <p className="text-xs text-gray-500">
                                    Joined
                                </p>

                                <p className="font-medium text-gray-800">
                                    {user?.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString()
                                        : "N/A"}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* User Information */}

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">

                    <div className="mb-6">

                        <h2 className="text-lg font-bold text-gray-800">
                            Personal Information
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Basic information associated with this account.
                        </p>

                    </div>


                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        {/* First Name */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">

                                <FiUser />

                                <span className="text-sm">
                                    First Name
                                </span>

                            </div>

                            <p className="font-semibold text-gray-800">
                                {user?.firstName || "N/A"}
                            </p>

                        </div>


                        {/* Last Name */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">

                                <FiUser />

                                <span className="text-sm">
                                    Last Name
                                </span>

                            </div>

                            <p className="font-semibold text-gray-800">
                                {user?.lastName || "N/A"}
                            </p>

                        </div>


                        {/* Email */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">

                                <FiMail />

                                <span className="text-sm">
                                    Email Address
                                </span>

                            </div>

                            <p className="break-all font-semibold text-gray-800">
                                {user?.email || "N/A"}
                            </p>

                        </div>


                        {/* Phone */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">

                                <FiPhone />

                                <span className="text-sm">
                                    Phone Number
                                </span>

                            </div>

                            <p className="font-semibold text-gray-800">
                                {user?.phone || "N/A"}
                            </p>

                        </div>


                        {/* Role */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">

                                <FiShield />

                                <span className="text-sm">
                                    Account Role
                                </span>

                            </div>

                            <p className="font-semibold text-gray-800">
                                {user?.role?.name || "N/A"}
                            </p>

                        </div>


                        {/* Email Verification */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">

                                <FiMail />

                                <span className="text-sm">
                                    Email Verification
                                </span>

                            </div>

                            <p className="font-semibold text-gray-800">
                                {user?.isEmailVerified ? "Verified" : "Not Verified"}
                            </p>

                        </div>


                        {/* Phone Verification */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">

                                <FiPhone />

                                <span className="text-sm">
                                    Phone Verification
                                </span>

                            </div>

                            <p className="font-semibold text-gray-800">
                                {user?.isPhoneVerified ? "Verified" : "Not Verified"}
                            </p>

                        </div>

                    </div>


                    {/* Account Information */}

                    <div className="mt-8 border-t border-gray-100 pt-6">

                        <h2 className="mb-5 text-lg font-bold text-gray-800">
                            Account Information
                        </h2>


                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                            {/* Created */}

                            <div className="
                                flex items-center gap-4
                                rounded-xl
                                border border-gray-100
                                p-4
                            ">

                                <div className="rounded-lg bg-green-50 p-3">
                                    <FiCalendar className="text-green-600" />
                                </div>

                                <div>

                                    <p className="text-xs text-gray-500">
                                        Account Created
                                    </p>

                                    <p className="font-medium text-gray-800">
                                        {user?.createdAt
                                            ? new Date(user.createdAt).toLocaleString()
                                            : "N/A"}
                                    </p>

                                </div>

                            </div>


                            {/* Last Login */}

                            <div className="
                                flex items-center gap-4
                                rounded-xl
                                border border-gray-100
                                p-4
                            ">

                                <div className="rounded-lg bg-blue-50 p-3">
                                    <FiClock className="text-[#003963]" />
                                </div>

                                <div>

                                    <p className="text-xs text-gray-500">
                                        Last Login
                                    </p>

                                    <p className="font-medium text-gray-800">
                                        {user?.lastLoginAt
                                            ? new Date(user.lastLoginAt).toLocaleString()
                                            : "Never"}
                                    </p>

                                </div>

                            </div>


                            {/* Updated */}

                            <div className="
                                flex items-center gap-4
                                rounded-xl
                                border border-gray-100
                                p-4
                            ">

                                <div className="rounded-lg bg-blue-50 p-3">
                                    <FiClock className="text-[#003963]" />
                                </div>

                                <div>

                                    <p className="text-xs text-gray-500">
                                        Last Updated
                                    </p>

                                    <p className="font-medium text-gray-800">
                                        {user?.updatedAt
                                            ? new Date(user.updatedAt).toLocaleString()
                                            : "N/A"}
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

export default UserDetail;