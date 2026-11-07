import React, { useEffect, useState } from "react";
import {
    FiSearch,
    FiPlus,
    FiEye,
    FiEdit2,
    FiTrash2,
    FiUserCheck,
    FiUserX,
    FiUsers,
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
} from "react-icons/fi";
import FormModal from "../../components/users/FormModal";
import { API } from "../../api/axios";
import { toast } from "react-toastify";
import DeleteModal from "../../components/users/DeleteModal";
import { Navigate, useNavigate } from "react-router-dom";
import DataLoader from "../../components/DataLoader";
import { useSelector } from "react-redux";

const Users = () => {
    const navigate = useNavigate();

    const user = useSelector((store) => store.auth.user);
    const permissions = user?.role?.permissions || [];

    // =========================
    // STATES
    // =========================

    const [dataLoading, setDataLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [deleteId, setDeleteId] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);

    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);

    // SERVER STATISTICS
    const [totalUsers, setTotalUsers] = useState(0);
    const [activeUsers, setActiveUsers] = useState(0);
    const [inactiveUsers, setInactiveUsers] = useState(0);
    const [filteredCount, setFilteredCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "",
    });

    // =========================
    // FORM CHANGE
    // =========================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =========================
    // GET ALL USERS
    // =========================

    const getAllUsers = async (
        page = currentPage,
        limit = entriesPerPage,
        searchValue = debouncedSearch
    ) => {
        try {
            const res = await API.get("/admin/get", {
                params: {
                    page,
                    limit,
                    search: searchValue,
                },
            });

            setUsers(res.data.users || []);

            setTotalUsers(res.data.totalUsers || 0);
            setActiveUsers(res.data.activeUsers || 0);
            setInactiveUsers(res.data.inactiveUsers || 0);
            setFilteredCount(res.data.filteredCount || 0);
            setTotalPages(res.data.totalPages || 0);

            if (
                res.data.currentPage &&
                res.data.currentPage !== currentPage
            ) {
                setCurrentPage(res.data.currentPage);
            }
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to fetch users"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // =========================
    // GET ALL ROLES
    // =========================

    const getAllRoles = async () => {
        try {
            const res = await API.get("/role/get");
            setRoles(res.data.roles || []);
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to fetch roles"
            );
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
        getAllUsers(
            currentPage,
            entriesPerPage,
            debouncedSearch
        );
    }, [currentPage, entriesPerPage, debouncedSearch]);

    // =========================
    // INITIAL ROLES FETCH
    // =========================

    useEffect(() => {
        getAllRoles();
    }, []);

    // =========================
    // ADD USER MODAL
    // =========================

    const handleAddUserModal = () => {
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            role: "",
        });

        setIsEdit(false);
        setEditId(null);
        setShowModal(true);
    };

    // =========================
    // ADD USER
    // =========================

    const handleAddUser = async (e) => {
        e.preventDefault();

        try {
            setDataLoading(true);

            const res = await API.post("/admin/add", formData);

            setShowModal(false);
            setCurrentPage(1);

            await getAllUsers(
                1,
                entriesPerPage,
                debouncedSearch
            );

            toast.success(res.data.message);
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to add user"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // =========================
    // DELETE USER MODAL
    // =========================

    const handleDeleteModal = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    // =========================
    // DELETE USER
    // =========================

    const handleDeleteUser = async () => {
        try {
            setDataLoading(true);

            const res = await API.delete(
                `/admin/delete/${deleteId}`
            );

            setShowDeleteModal(false);
            setDeleteId(null);

            await getAllUsers(
                currentPage,
                entriesPerPage,
                debouncedSearch
            );

            toast.success(res.data.message);
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to delete user"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // =========================
    // CHANGE STATUS
    // =========================

    const changeStatus = async (email, status) => {
        try {
            setDataLoading(true);

            const res = await API.patch(
                "/admin/update/status",
                { email, status }
            );

            await getAllUsers(
                currentPage,
                entriesPerPage,
                debouncedSearch
            );

            toast.success(res.data.message);
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to update user status"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // =========================
    // VIEW USER
    // =========================

    const handleUserView = (id) => {
        navigate(`/admin/users/${id}`);
    };

    // =========================
    // EDIT USER MODAL
    // =========================

    const handleEditUserModal = (selectedUser) => {
        setFormData({
            firstName: selectedUser.firstName,
            lastName: selectedUser.lastName,
            email: selectedUser.email,
            phone: selectedUser.phone,
            role: selectedUser.role?._id || selectedUser.role,
        });

        setIsEdit(true);
        setEditId(selectedUser._id);
        setShowModal(true);
    };

    // =========================
    // EDIT USER
    // =========================

    const handleEditUser = async (e) => {
        e.preventDefault();

        try {
            setDataLoading(true);

            const res = await API.put(
                `/admin/update/${editId}`,
                formData
            );

            setShowModal(false);

            await getAllUsers(
                currentPage,
                entriesPerPage,
                debouncedSearch
            );

            toast.success(res.data.message);
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to update user"
            );
        } finally {
            setDataLoading(false);
        }
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
        !permissions.some((permission) =>
            permission.includes("user")
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
                        Users
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage all users and their account status.
                    </p>
                </div>

                {permissions.includes("user:add") && (
                    <button
                        type="button"
                        onClick={handleAddUserModal}
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
                        Add User
                    </button>
                )}
            </div>

            {/* STAT CARDS */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {/* TOTAL USERS */}

                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-blue-50 blur-2xl" />

                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Total Users
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {totalUsers}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FiUsers size={24} />
                        </div>
                    </div>
                </div>

                {/* ACTIVE USERS */}

                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-green-50 blur-2xl" />

                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Active Users
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-green-600">
                                {activeUsers}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                            <FiUserCheck size={24} />
                        </div>
                    </div>
                </div>

                {/* INACTIVE USERS */}

                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-red-50 blur-2xl" />

                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Inactive Users
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-red-500">
                                {inactiveUsers}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                            <FiUserX size={24} />
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
                            placeholder="Search by name, email or phone..."
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
                            htmlFor="userEntries"
                            className="whitespace-nowrap text-sm font-medium text-slate-500"
                        >
                            Show entries
                        </label>

                        <select
                            id="userEntries"
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

                {/* SEARCH INFO */}

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
                        {search ? "filtered" : ""} users
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

            {/* USERS TABLE */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-212.5">

                        {/* TABLE HEADER */}

                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    User
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Email
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Role
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Status
                                </th>

                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        {/* TABLE BODY */}

                        <tbody className="divide-y divide-slate-100">
                            {users.length > 0 ? (
                                users.map((selectedUser) => {
                                    const fullName =
                                        `${selectedUser?.firstName || ""} ${selectedUser?.lastName || ""}`.trim() ||
                                        "N/A";

                                    return (
                                        <tr
                                            key={selectedUser?._id}
                                            className="transition hover:bg-emerald-50/30"
                                        >
                                            {/* USER */}

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="
                                                        flex h-11 w-11 shrink-0
                                                        items-center justify-center
                                                        rounded-full bg-emerald-50
                                                        font-semibold text-emerald-700
                                                    ">
                                                        {selectedUser?.firstName
                                                            ?.charAt(0)
                                                            ?.toUpperCase() || "U"}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-slate-800">
                                                            {fullName}
                                                        </p>

                                                        <p className="max-w-56 truncate text-xs text-slate-400">
                                                            ID: #{selectedUser?._id || "N/A"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* EMAIL */}

                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                <span className="block max-w-55 truncate">
                                                    {selectedUser?.email || "N/A"}
                                                </span>
                                            </td>

                                            {/* ROLE */}

                                            <td className="px-6 py-4">
                                                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                                                    {selectedUser?.role?.name || "N/A"}
                                                </span>
                                            </td>

                                            {/* STATUS */}

                                            <td className="px-6 py-4">
                                                <button
                                                    disabled={!permissions.includes("user:status")}
                                                    type="button"
                                                    onClick={() =>
                                                        changeStatus(
                                                            selectedUser?.email,
                                                            selectedUser?.status
                                                        )
                                                    }
                                                    className={`
                                                        rounded-lg px-3 py-2
                                                        text-xs font-semibold
                                                        transition
                                                        disabled:cursor-not-allowed
                                                        disabled:opacity-70
                                                        ${selectedUser?.status === "active"
                                                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                            : "bg-red-100 text-red-600 hover:bg-red-200"
                                                        }
                                                    `}
                                                >
                                                    {selectedUser?.status === "active"
                                                        ? "Active"
                                                        : "Inactive"}
                                                </button>
                                            </td>

                                            {/* ACTIONS */}

                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">

                                                    {/* VIEW */}

                                                    {permissions.includes("user:read") && (
                                                        <div className="group relative">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleUserView(selectedUser?._id)
                                                                }
                                                                aria-label="View user"
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

                                                    {permissions.includes("user:update") && (
                                                        <div className="group relative">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleEditUserModal(selectedUser)
                                                                }
                                                                aria-label="Edit user"
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

                                                    {permissions.includes("user:delete") && (
                                                        <div className="group relative">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDeleteModal(selectedUser?._id)
                                                                }
                                                                aria-label="Delete user"
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
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-16 text-center"
                                    >
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                            <FiUsers size={30} />
                                        </div>

                                        <p className="mt-4 font-semibold text-slate-700">
                                            No users found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            {search
                                                ? "Try changing your search keyword."
                                                : "Add your first user to get started."}
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
                                aria-label="First page"
                                className="
                                    flex h-9 w-9 items-center justify-center
                                    rounded-lg border border-slate-200
                                    text-slate-600 transition
                                    hover:border-emerald-600 hover:bg-emerald-50
                                    hover:text-emerald-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
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
                                aria-label="Previous page"
                                className="
                                    flex h-9 w-9 items-center justify-center
                                    rounded-lg border border-slate-200
                                    text-slate-600 transition
                                    hover:border-emerald-600 hover:bg-emerald-50
                                    hover:text-emerald-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
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
                                aria-label="Next page"
                                className="
                                    flex h-9 w-9 items-center justify-center
                                    rounded-lg border border-slate-200
                                    text-slate-600 transition
                                    hover:border-emerald-600 hover:bg-emerald-50
                                    hover:text-emerald-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >
                                <FiChevronRight size={17} />
                            </button>

                            {/* LAST PAGE */}

                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(totalPages)}
                                aria-label="Last page"
                                className="
                                    flex h-9 w-9 items-center justify-center
                                    rounded-lg border border-slate-200
                                    text-slate-600 transition
                                    hover:border-emerald-600 hover:bg-emerald-50
                                    hover:text-emerald-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >
                                <FiChevronsRight size={17} />
                            </button>

                        </div>
                    </div>
                )}
            </div>

            {/* ADD / EDIT USER MODAL */}

            {showModal && (
                <FormModal
                    setShowModal={setShowModal}
                    handleAddUser={handleAddUser}
                    handleChange={handleChange}
                    formData={formData}
                    isEdit={isEdit}
                    editId={editId}
                    handleEditUser={handleEditUser}
                    roles={roles}
                />
            )}

            {/* DELETE USER MODAL */}

            {showDeleteModal && (
                <DeleteModal
                    setShowDeleteModal={setShowDeleteModal}
                    handleDeleteUser={handleDeleteUser}
                />
            )}

        </div>
    );
};

export default Users;