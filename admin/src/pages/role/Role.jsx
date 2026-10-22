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
} from "react-icons/fi";
import { toast } from "react-toastify";
import { API } from "../../api/axios";
import FormModal from "../../components/role/FormModal";
import DeleteModal from "../../components/role/DeleteModal";
import { useNavigate } from "react-router-dom";
import DataLoader from "../../components/DataLoader";
import { Navigate } from "react-router-dom"
import { useSelector } from "react-redux";

const Role = () => {
    const user = useSelector((store) => store.auth.user)
    const navigate = useNavigate()
    const [dataLoading, setDataLoading] = useState(true)

    const [roles, setRoles] = useState([]);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        permissions: [],
    });

    // =========================
    // FETCH ROLES
    // =========================

    const fetchRoles = async () => {
        try {
            const res = await API.get("/role/get");
            setRoles(res.data.roles);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to fetch roles"
            );
        }
        finally {
            setDataLoading(false)
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    // =========================
    // FORM CHANGE
    // =========================

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Permission checkbox
        if (name.startsWith("permissions.")) {
            const [, module, action] = name.split(".");

            const permission = `${module}:${action}`;

            setFormData((prev) => {
                const currentPermissions = prev.permissions || [];

                // Add permission
                if (checked) {
                    return {
                        ...prev,
                        permissions: currentPermissions.includes(
                            permission
                        )
                            ? currentPermissions
                            : [
                                ...currentPermissions,
                                permission,
                            ],
                    };
                }

                // Remove permission
                return {
                    ...prev,
                    permissions: currentPermissions.filter(
                        (item) => item !== permission
                    ),
                };
            });

            return;
        }

        // Normal input
        setFormData((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    // =========================
    // ADD ROLE
    // =========================

    const handleAddRole = async (e) => {
        e.preventDefault();
        try {
            if (!formData.name.trim()) {
                toast.error("Role name is required");
                return;
            }
            setDataLoading(true)
            const { data } = await API.post(
                "/role/add",
                formData
            );
            toast.success(data.message)
            setShowModal(false);
            setFormData({
                name: "",
                permissions: [],
            });
            await fetchRoles();
        } catch (error) {
            console.log(error);
            toast.error(
                error.response?.data?.message
            );
        }
        finally {
            setDataLoading(false)
        }
    };

    // =========================
    // EDIT ROLE
    // =========================

    const handleEditRole = async (e) => {
        e.preventDefault();

        if (!editId) {
            toast.error("Role ID not found");
            return;
        }

        try {
            if (!formData.name.trim()) {
                toast.error("Role name is required");
                return;
            }

            const payload = {
                name: formData.name.trim(),
                permissions: formData.permissions || [],
            };

            setDataLoading(true)

            const { data } = await API.put(
                `/role/update/${editId}`,
                payload
            );

            if (data.success) {
                toast.success(
                    data.message ||
                    "Role updated successfully"
                );

                setShowModal(false);

                setIsEdit(false);
                setEditId(null);

                setFormData({
                    name: "",
                    permissions: [],
                });

                await fetchRoles();
            }
        } catch (error) {
            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to update role"
            );
        }
        finally {
            setDataLoading(false)
        }
    };

    // =========================
    // DELETE ROLE
    // =========================

    const handleDeleteRole = async () => {

        try {
            setDataLoading(true)
            const res = await API.delete(
                `/role/delete/${deleteId}`
            );

            toast.success(res.data.message)

            await fetchRoles();

        } catch (error) {
            console.log(error);

            toast.error(error.response?.data?.message);
        }
        finally {
            setShowDeleteModal(false)
            setDataLoading(false)
        }
    };

    const handleDeleteModal = (id) => {
        setShowDeleteModal(true)
        setDeleteId(id)
    }



    // =========================
    // STATUS
    // =========================

    const handleStatus = async (id) => {
        try {
            setDataLoading(true)
            const res = await API.patch(
                `/role/update/${id}`
            );
            toast.success(res.data.message)
            await fetchRoles();
        }
        catch (error) {
            toast.error(error.response?.data?.message)
        }
        finally {
            setDataLoading(false)
        }
    };

    // =========================
    // ADD ROLE MODAL
    // =========================

    const handleAddRoleModal = () => {
        setIsEdit(false);
        setEditId(null);

        setFormData({
            name: "",
            permissions: [],
        });

        setShowModal(true);
    };

    // =========================
    // EDIT ROLE MODAL
    // =========================

    const handleEditRoleModal = (role) => {
        setFormData({
            name: role.name || "",
            permissions: Array.isArray(
                role.permissions
            )
                ? role.permissions
                : [],
        });

        setEditId(role._id);
        setIsEdit(true);
        setShowModal(true);
    };

    // =========================
    // SEARCH
    // =========================

    const filteredRoles = roles.filter((role) =>
        role.name
            ?.toLowerCase()
            .includes(search.toLowerCase())
    );

    const handleRoleView = (id) => {
        navigate(`/admin/roles/${id}`)
    }

    if (!user?.role.permissions.some((permission) => permission.includes("role"))) {
        return <Navigate to="/admin/dashboard" replace />
    }

    if (dataLoading) {
        return <DataLoader />
    }

    return (
        <div className="space-y-6">
            {/* HEADER */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Roles
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage roles and their permissions
                    </p>
                </div>
            </div>

            {/* STATS */}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* TOTAL */}

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">
                                Total Roles
                            </p>

                            <h3 className="mt-1 text-2xl font-bold text-slate-800">
                                {roles.length}
                            </h3>
                        </div>

                        <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                            <FiShield size={22} />
                        </div>
                    </div>
                </div>

                {/* ACTIVE */}

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">
                                Active Roles
                            </p>

                            <h3 className="mt-1 text-2xl font-bold text-green-600">
                                {
                                    roles.filter(
                                        (role) =>
                                            role.status
                                    ).length
                                }
                            </h3>
                        </div>

                        <div className="rounded-lg bg-green-50 p-3 text-green-600">
                            <FiCheckCircle size={22} />
                        </div>
                    </div>
                </div>

                {/* INACTIVE */}

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">
                                Inactive Roles
                            </p>

                            <h3 className="mt-1 text-2xl font-bold text-red-600">
                                {
                                    roles.filter(
                                        (role) =>
                                            !role.status
                                    ).length
                                }
                            </h3>
                        </div>

                        <div className="rounded-lg bg-red-50 p-3 text-red-600">
                            <FiXCircle size={22} />
                        </div>
                    </div>
                </div>
            </div>

            {/* SEARCH + TABLE */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">


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
                            className="
                                w-full
                                rounded-xl
                                border border-slate-200
                                bg-slate-50
                                py-2.5
                                pl-10
                                pr-4
                                text-sm
                                outline-none
                                transition
                                focus:border-[#003963]
                                focus:bg-white
                                focus:ring-2
                                focus:ring-[#003963]/10
                            "
                        />

                    </div>


                    {/* ADD Role */}

                    {
                        user?.role.permissions.includes("role:add") &&
                        <button
                            onClick={handleAddRoleModal}
                            className="
                        flex items-center justify-center gap-2
                        rounded-lg
                        bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22]
                        px-5 py-3
                        text-sm font-semibold text-white
                        transition
                    "
                        >
                            <FiPlus size={18} />
                            Add Role
                        </button>
                    }



                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                {/* TABLE */}

                <div className="overflow-x-auto">
                    <table className="w-full min-w-225">
                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Role
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Permissions
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Status
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Created At
                                </th>

                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredRoles.length > 0 ? (
                                filteredRoles.map(
                                    (role) => (
                                        <tr
                                            key={
                                                role._id
                                            }
                                            className="
                                                transition
                                                hover:bg-slate-50
                                            "
                                        >
                                            {/* ROLE */}

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="
                                                        flex h-10 w-10
                                                        items-center justify-center
                                                        rounded-lg
                                                        bg-blue-50
                                                        text-[#003963]
                                                    ">
                                                        <FiShield
                                                            size={
                                                                18
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-slate-800">
                                                            {
                                                                role.name
                                                            }
                                                        </p>

                                                        <p className="text-xs text-slate-400">
                                                            Role
                                                            ID:{" "}
                                                            {
                                                                role._id
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* PERMISSIONS */}

                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {role.permissions?.length >
                                                        0 ? (
                                                        role.permissions.map(
                                                            (
                                                                permission,
                                                                index
                                                            ) => (
                                                                <span
                                                                    key={
                                                                        index
                                                                    }
                                                                    className="
                                                                        rounded-full
                                                                        bg-slate-100
                                                                        px-3 py-1
                                                                        text-xs
                                                                        font-medium
                                                                        text-slate-600
                                                                    "
                                                                >
                                                                    {
                                                                        permission
                                                                    }
                                                                </span>
                                                            )
                                                        )
                                                    ) : (
                                                        <span className="text-sm text-slate-400">
                                                            No
                                                            permissions
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* STATUS */}

                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() =>
                                                        handleStatus(
                                                            role._id
                                                        )
                                                    }
                                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold
                                                         ${role.status == "active"
                                                            ? "bg-green-50 text-green-600"
                                                            : "bg-red-50 text-red-600"
                                                        }`}
                                                >
                                                    {role.status == "active" ? (
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
                                                    ? new Date(
                                                        role.createdAt
                                                    ).toLocaleDateString()
                                                    : "-"}
                                            </td>

                                            {/* ACTIONS */}

                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    {
                                                        user?.role.permissions.includes("role:read") &&
                                                        <button
                                                            onClick={() => handleRoleView(role._id)}
                                                            title="View"
                                                            className="
                                                            rounded-lg p-2
                                                            text-slate-500
                                                            transition
                                                            hover:bg-slate-100
                                                            hover:text-[#003963]
                                                        "
                                                        >
                                                            <FiEye
                                                                size={
                                                                    17
                                                                }
                                                            />
                                                        </button>
                                                    }

                                                    {
                                                        user?.role.permissions.includes("role:update") &&
                                                        <button
                                                            title="Edit"
                                                            onClick={() =>
                                                                handleEditRoleModal(
                                                                    role
                                                                )
                                                            }
                                                            className="
                                                            rounded-lg p-2
                                                            text-blue-500
                                                            transition
                                                            hover:bg-blue-50
                                                        "
                                                        >
                                                            <FiEdit2
                                                                size={
                                                                    17
                                                                }
                                                            />
                                                        </button>
                                                    }

                                                    {
                                                        user?.role.permissions.includes("role:delete") &&
                                                        <button
                                                            title="Delete"
                                                            onClick={() =>
                                                                handleDeleteModal(
                                                                    role._id
                                                                )
                                                            }
                                                            className="
                                                            rounded-lg p-2
                                                            text-red-500
                                                            transition
                                                            hover:bg-red-50
                                                        "
                                                        >
                                                            <FiTrash2
                                                                size={
                                                                    17
                                                                }
                                                            />
                                                        </button>
                                                    }

                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="
                                            px-6 py-12
                                            text-center
                                        "
                                    >
                                        <div className="flex flex-col items-center">
                                            <FiShield
                                                size={35}
                                                className="mb-3 text-slate-300"
                                            />

                                            <p className="font-medium text-slate-600">
                                                No roles found
                                            </p>

                                            <p className="mt-1 text-sm text-slate-400">
                                                Try adding a new
                                                role
                                            </p>
                                        </div>
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
                    setShowModal={
                        setShowModal
                    }
                    handleAddRole={
                        handleAddRole
                    }
                    handleEditRole={
                        handleEditRole
                    }
                    formData={
                        formData
                    }
                    handleChange={
                        handleChange
                    }
                    isEdit={isEdit}
                />
            )}

            {showDeleteModal && (
                <DeleteModal setShowDeleteModal={setShowDeleteModal} handleDeleteRole={handleDeleteRole} />
            )}

        </div>
    );
};

export default Role;
