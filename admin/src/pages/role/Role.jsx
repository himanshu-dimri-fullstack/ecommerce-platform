
import React, { useEffect, useState } from "react";
import {
    FiSearch,
    FiPlus,
    FiEye,
    FiEdit2,
    FiTrash2,
    FiCheckCircle,
    FiXCircle,
    FiShield,
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { API } from "../../api/axios";
import FormModal from "../../components/role/FormModal";
import DeleteModal from "../../components/role/DeleteModal";
import { useNavigate, Navigate } from "react-router-dom";
import DataLoader from "../../components/DataLoader";
import { useSelector } from "react-redux";

const Role = () => {
    const user = useSelector((store) => store.auth.user);
    const navigate = useNavigate();

    const permissions = user?.role?.permissions || [];

    const [dataLoading, setDataLoading] = useState(true);

    const [roles, setRoles] = useState([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [totalRoles, setTotalRoles] = useState(0);
    const [activeRoles, setActiveRoles] = useState(0);
    const [inactiveRoles, setInactiveRoles] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [filteredCount, setFilteredCount] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        permissions: [],
    });

    // FETCH ROLES
    const fetchRoles = async (
        page = currentPage,
        limit = entriesPerPage,
        searchValue = debouncedSearch
    ) => {
        try {
            const res = await API.get("/role/get", {
                params: {
                    page,
                    limit,
                    search: searchValue,
                },
            });

            const data = res.data;

            setRoles(data.roles || []);
            setTotalRoles(data.totalRoles ?? data.roles?.length ?? 0);
            setActiveRoles(data.activeRoles ?? 0);
            setInactiveRoles(data.inactiveRoles ?? 0);
            setFilteredCount(data.filteredCount ?? data.roles?.length ?? 0);
            setTotalPages(data.totalPages ?? 1);
            setCurrentPage(data.currentPage ?? page);
        } catch (error) {
            console.error("Fetch roles error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to fetch roles"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // DEBOUNCED SEARCH
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    // FETCH WHEN PAGE, LIMIT OR SEARCH CHANGES
    useEffect(() => {
        fetchRoles(currentPage, entriesPerPage, debouncedSearch);
    }, [currentPage, entriesPerPage, debouncedSearch]);

    // FORM CHANGE
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.startsWith("permissions.")) {
            const [, module, action] = name.split(".");
            const permission = `${module}:${action}`;

            setFormData((prev) => {
                const currentPermissions = prev.permissions || [];

                if (checked) {
                    return {
                        ...prev,
                        permissions: currentPermissions.includes(permission)
                            ? currentPermissions
                            : [...currentPermissions, permission],
                    };
                }

                return {
                    ...prev,
                    permissions: currentPermissions.filter(
                        (item) => item !== permission
                    ),
                };
            });

            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // RESET FORM
    const resetForm = () => {
        setFormData({
            name: "",
            permissions: [],
        });

        setEditId(null);
        setIsEdit(false);
    };

    // ADD ROLE
    const handleAddRole = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Role name is required");
            return;
        }

        try {
            setDataLoading(true);

            const { data } = await API.post(
                "/role/add",
                formData
            );

            toast.success(data.message || "Role added successfully");

            setShowModal(false);
            resetForm();

            setCurrentPage(1);

            await fetchRoles(1, entriesPerPage, debouncedSearch);
        } catch (error) {
            console.error("Add role error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to add role"
            );

            setDataLoading(false);
        }
    };

    // EDIT ROLE
    const handleEditRole = async (e) => {
        e.preventDefault();

        if (!editId) {
            toast.error("Role ID not found");
            return;
        }

        if (!formData.name.trim()) {
            toast.error("Role name is required");
            return;
        }

        try {
            const payload = {
                name: formData.name.trim(),
                permissions: formData.permissions || [],
            };

            setDataLoading(true);

            const { data } = await API.put(
                `/role/update/${editId}`,
                payload
            );

            toast.success(
                data.message || "Role updated successfully"
            );

            setShowModal(false);
            resetForm();

            await fetchRoles();
        } catch (error) {
            console.error("Update role error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to update role"
            );

            setDataLoading(false);
        }
    };

    // DELETE ROLE
    const handleDeleteRole = async () => {
        try {
            setDataLoading(true);

            const res = await API.delete(
                `/role/delete/${deleteId}`
            );

            toast.success(
                res.data.message || "Role deleted successfully"
            );

            setShowDeleteModal(false);
            setDeleteId(null);

            await fetchRoles();
        } catch (error) {
            console.error("Delete role error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to delete role"
            );

            setDataLoading(false);
        }
    };

    // DELETE MODAL
    const handleDeleteModal = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    // STATUS
    const handleStatus = async (id) => {
        try {
            setDataLoading(true);

            const res = await API.patch(
                `/role/update/${id}`
            );

            toast.success(
                res.data.message || "Role status updated"
            );

            await fetchRoles();
        } catch (error) {
            console.error("Update role status error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to update role status"
            );

            setDataLoading(false);
        }
    };

    // ADD ROLE MODAL
    const handleAddRoleModal = () => {
        resetForm();
        setShowModal(true);
    };

    // EDIT ROLE MODAL
    const handleEditRoleModal = (role) => {
        setFormData({
            name: role.name || "",
            permissions: Array.isArray(role.permissions)
                ? role.permissions
                : [],
        });

        setEditId(role._id);
        setIsEdit(true);
        setShowModal(true);
    };

    // ROLE VIEW
    const handleRoleView = (id) => {
        navigate(`/admin/roles/${id}`);
    };

    // CHANGE ENTRIES PER PAGE
    const handleEntriesChange = (e) => {
        setEntriesPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

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
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    // PERMISSION CHECK
    if (
        !permissions.some((permission) =>
            permission.includes("role")
        )
    ) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (dataLoading) {
        return <DataLoader />;
    }

    const startEntry =
        filteredCount === 0
            ? 0
            : (currentPage - 1) * entriesPerPage + 1;

    const endEntry = Math.min(
        currentPage * entriesPerPage,
        filteredCount
    );

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Roles
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage roles and their permissions.
                    </p>
                </div>

                {/* ADD ROLE - HEADER RIGHT SIDE */}
                {permissions.includes("role:add") && (
                    <button
                        type="button"
                        onClick={handleAddRoleModal}
                        className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
                    >
                        <FiPlus size={19} />
                        Add Role
                    </button>
                )}
            </div>

            {/* STATISTICS */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {/* TOTAL */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Total Roles
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {totalRoles}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FiShield size={24} />
                        </div>
                    </div>
                </div>

                {/* ACTIVE */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Active Roles
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-green-600">
                                {activeRoles}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                            <FiCheckCircle size={24} />
                        </div>
                    </div>
                </div>

                {/* INACTIVE */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Inactive Roles
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-red-500">
                                {inactiveRoles}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                            <FiXCircle size={24} />
                        </div>
                    </div>
                </div>

            </div>

            {/* SEARCH AND ENTRIES */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    {/* SEARCH */}
                    <div className="relative w-full sm:max-w-md">
                        <FiSearch
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={19}
                        />

                        <input
                            type="text"
                            placeholder="Search role..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#003963] focus:bg-white focus:ring-2 focus:ring-[#003963]/10"
                        />
                    </div>

                    {/* ENTRIES */}
                    <div className="flex items-center gap-2">
                        <label
                            htmlFor="roleEntries"
                            className="whitespace-nowrap text-sm font-medium text-slate-500"
                        >
                            Show entries:
                        </label>

                        <select
                            id="roleEntries"
                            value={entriesPerPage}
                            onChange={handleEntriesChange}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                        >
                            {[10, 20, 50, 100].map((value) => (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                    </div>

                </div>
            </div>

            {/* ROLE TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-225">

                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                {[
                                    "Role",
                                    "Status",
                                    "Created At",
                                    "Actions",
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className={`whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 ${heading === "Actions"
                                                ? "text-right"
                                                : "text-left"
                                            }`}
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {roles.length > 0 ? (
                                roles.map((role) => (
                                    <tr
                                        key={role._id}
                                        className="transition hover:bg-slate-50"
                                    >
                                        {/* ROLE */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#003963]">
                                                    <FiShield size={19} />
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-slate-800">
                                                        {role.name}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        Role ID: {role._id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-6 py-4">
                                            <button
                                                type="button"
                                                disabled={!permissions.includes("role:status")}
                                                onClick={() => handleStatus(role._id)}
                                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${role.status === "active"
                                                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                                                        : "bg-red-50 text-red-600 hover:bg-red-100"
                                                    }`}
                                            >
                                                {role.status === "active" ? (
                                                    <>
                                                        <FiCheckCircle />
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiXCircle />
                                                        Inactive
                                                    </>
                                                )}
                                            </button>
                                        </td>

                                        {/* CREATED */}
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {role.createdAt
                                                ? new Date(role.createdAt).toLocaleDateString()
                                                : "-"}
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">

                                                {permissions.includes("role:read") && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRoleView(role._id)}
                                                        title="View"
                                                        className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        <FiEye size={17} />
                                                    </button>
                                                )}

                                                {permissions.includes("role:update") && (
                                                    <button
                                                        type="button"
                                                        title="Edit"
                                                        onClick={() => handleEditRoleModal(role)}
                                                        className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                                                    >
                                                        <FiEdit2 size={17} />
                                                    </button>
                                                )}

                                                {permissions.includes("role:delete") && (
                                                    <button
                                                        type="button"
                                                        title="Delete"
                                                        onClick={() => handleDeleteModal(role._id)}
                                                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                                    >
                                                        <FiTrash2 size={17} />
                                                    </button>
                                                )}

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
                                        <FiShield
                                            size={40}
                                            className="mx-auto text-slate-300"
                                        />

                                        <p className="mt-3 font-medium text-slate-600">
                                            No roles found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            Try changing your search or add a new role.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>

                {/* PAGINATION FOOTER */}
                <div className="flex flex-col gap-4 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-sm text-slate-500">
                        Showing{" "}
                        <span className="font-semibold text-slate-800">
                            {startEntry}
                        </span>
                        {" "}to{" "}
                        <span className="font-semibold text-slate-800">
                            {endEntry}
                        </span>
                        {" "}of{" "}
                        <span className="font-semibold text-slate-800">
                            {filteredCount}
                        </span>
                        {" "}roles
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5">

                        {/* FIRST */}
                        <button
                            type="button"
                            title="First Page"
                            disabled={currentPage === 1 || totalPages <= 1}
                            onClick={() => setCurrentPage(1)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600"
                        >
                            <FiChevronsLeft size={17} />
                        </button>

                        {/* PREVIOUS */}
                        <button
                            type="button"
                            title="Previous Page"
                            disabled={currentPage === 1 || totalPages <= 1}
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600"
                        >
                            <FiChevronLeft size={17} />
                        </button>

                        {/* PAGE NUMBERS */}
                        {getPaginationNumbers().map((page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-semibold transition ${currentPage === page
                                        ? "bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] text-white shadow-sm"
                                        : "border border-slate-200 text-slate-600 hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        {/* NEXT */}
                        <button
                            type="button"
                            title="Next Page"
                            disabled={currentPage >= totalPages || totalPages <= 1}
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600"
                        >
                            <FiChevronRight size={17} />
                        </button>

                        {/* LAST */}
                        <button
                            type="button"
                            title="Last Page"
                            disabled={currentPage >= totalPages || totalPages <= 1}
                            onClick={() => setCurrentPage(totalPages)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600"
                        >
                            <FiChevronsRight size={17} />
                        </button>

                    </div>
                </div>
            </div>

            {/* FORM MODAL */}
            {showModal && (
                <FormModal
                    setShowModal={setShowModal}
                    handleAddRole={handleAddRole}
                    handleEditRole={handleEditRole}
                    formData={formData}
                    handleChange={handleChange}
                    isEdit={isEdit}
                />
            )}

            {/* DELETE MODAL */}
            {showDeleteModal && (
                <DeleteModal
                    setShowDeleteModal={setShowDeleteModal}
                    handleDeleteRole={handleDeleteRole}
                />
            )}

        </div>
    );
};

export default Role;
