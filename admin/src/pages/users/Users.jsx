import React, { useMemo, useState } from "react";

import {
    FiSearch,
    FiPlus,
    FiX,
    FiEye,
    FiEdit2,
    FiTrash2,
    FiUserCheck,
    FiUserX,
    FiUsers,
} from "react-icons/fi";
import FormModal from "../../components/users/FormModal";
import { API } from "../../api/axios";
import { toast } from "react-toastify"
import { useEffect } from "react";
import DeleteModal from "../../components/users/DeleteModal";
import { Navigate, useNavigate } from "react-router-dom";
import DataLoader from "../../components/DataLoader";
import { useDispatch, useSelector } from "react-redux";

const Users = () => {

    const navigate = useNavigate()

    const [permissions, setPermissions] = useState([])

    const user = useSelector((store) => store.auth.user)


    // =========================
    // STATES
    // =========================
    const [dataLoading, setDataLoading] = useState(true)

    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null)
    const [isEdit, setIsEdit] = useState(false)
    const [editId, setEditId] = useState(null)
    const [roles, setRoles] = useState([])

    const [users, setUsers] = useState([])

    const [formData, setFormData] = useState(
        { firstName: "", lastName: "", email: "", phone: "", role: "", }
    );

    // =========================
    // STATISTICS
    // =========================

    const totalUsers = users.length;

    const activeUsers = users.filter(
        (user) => user.status === "active"
    ).length;

    const inactiveUsers = users.filter(
        (user) => user.status === "inactive"
    ).length;


    // =========================
    // FORM CHANGE
    // =========================

    const handleChange = (e) => {

        const { name, value } = e.target;

        // console.log(value)

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

    };


    // =========================
    // ADD USER
    // =========================

    const handleAddUserModal = () => {
        setFormData(
            { firstName: "", lastName: "", email: "", phone: "", role: "", }
        )
        setIsEdit(false)
        setEditId(null)
        setShowModal(true)
    }

    const handleAddUser = async (e) => {

        e.preventDefault();

        try {
            setDataLoading(true)
            const res = await API.post("/admin/add", formData)
            await getAllUsers()
            toast.success(res.data.message)
            setShowModal(false)
        }
        catch (error) {
            toast.error(error?.response?.data?.message)
        }
        finally {
            setDataLoading(false)
        }
    };


    // =========================
    // DELETE USER
    // =========================

    const handleDeleteModal = (id) => {
        setDeleteId(id)
        setShowDeleteModal((prev) => !prev)
    };

    const handleDeleteUser = async () => {
        try {
            setDataLoading(true)
            const res = await API.delete(`/admin/delete/${deleteId}`)
            await getAllUsers()
            toast.success(res.data.message)
        }
        catch (error) {
            toast.error(error?.response?.data.message)
        }
        finally {
            setDataLoading(false)
            setShowDeleteModal(false);
        }
    }


    // =========================
    // GET ALL USERS
    // =========================

    const getAllUsers = async () => {
        try {
            const res = await API.get("/admin/get")
            console.log(res.data)
            setUsers(res.data.users)
        }
        catch (error) {
            console.log(error)
        }
        finally {
            setDataLoading(false)
        }
    }

    // =========================
    // CHANGE STATUS
    // =========================

    const changeStatus = async (email, status) => {
        try {
            setDataLoading(true)
            const res = await API.patch("/admin/update/status", { email, status })
            await getAllUsers()
            toast.success(res.data.message)
        }
        catch (error) {
            toast.error(error?.response?.data?.message)
        }
        finally {
            setDataLoading(false)
        }
    }

    const handleUserView = async (id) => {
        navigate(`/admin/users/${id}`)
    }

    // =========================
    // EDIT USER 
    // =========================

    const handleEditUserModal = (user) => {
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
        })
        setIsEdit(true)
        setEditId(user._id)
        setShowModal(true)
    }

    const handleEditUser = async (e) => {
        e.preventDefault();

        try {
            setDataLoading(true)
            const res = await API.put(`/admin/update/${editId}`, formData)
            await getAllUsers()
            toast.success(res.data.message)
        }
        catch (error) {
            toast.error(error?.response?.data?.message)
        }
        finally {
            setDataLoading(false)
            setShowModal(false);
        }
    }

    const getAllRoles = async () => {
        try {
            const res = await API.get("/role/get")
            setRoles(res.data.roles)
        }
        catch (error) {
            toast.error(error?.response?.data?.message)
        }
        finally {
            setDataLoading(false)
        }
    }

    useEffect(() => {
        getAllUsers()
        getAllRoles()
    }, [])

    useEffect(() => {
        setPermissions(user?.role?.permissions || [])
    }, [user])

    if (!user?.role.permissions.some((permission) => permission.includes("user"))) {
        return <Navigate to="/admin/dashboard" replace />
    }

    if (dataLoading) {
        return <DataLoader />
    }

    return (
        <div className="space-y-6">


            {/* ========================================= */}
            {/* PAGE HEADER */}
            {/* ========================================= */}

            <div>

                <h1 className="text-2xl font-bold text-slate-800">
                    Users
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Manage all users and their account status.
                </p>

            </div>


            {/* ========================================= */}
            {/* STAT CARDS */}
            {/* ========================================= */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">


                {/* TOTAL USERS */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

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

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

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

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

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


            {/* ========================================= */}
            {/* SEARCH + ADD USER */}
            {/* ========================================= */}

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
                            placeholder="Search users..."
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


                    {/* ADD USER */}


                    {

                        permissions.includes("user:add") &&
                        <button
                            onClick={handleAddUserModal}
                            className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                           bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22]
                            px-5
                            py-2.5
                            text-sm
                            font-semibold
                            text-white
                            transition
                            active:scale-95
                        "
                        >
                            <FiPlus size={19} />
                            Add User
                        </button>
                    }



                </div>
            </div>


            {/* ========================================= */}
            {/* USERS TABLE */}
            {/* ========================================= */}

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

                            {users?.length > 0 ? (

                                users.map((user) => {

                                    const fullName =
                                        `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                                        "N/A";

                                    return (
                                        <tr
                                            key={user?._id}
                                            className="transition hover:bg-slate-50"
                                        >

                                            {/* USER */}

                                            <td className="px-6 py-4">

                                                <div className="flex items-center gap-3">

                                                    {/* AVATAR */}

                                                    <div className="
                                    flex h-10 w-10
                                    shrink-0
                                    items-center justify-center
                                    rounded-full
                                    bg-[#003963]/10
                                    font-semibold
                                    text-[#003963]
                                ">
                                                        {user?.firstName
                                                            ?.charAt(0)
                                                            ?.toUpperCase() || "U"}
                                                    </div>


                                                    <div className="min-w-0">

                                                        <p className="font-semibold text-slate-800">
                                                            {fullName}
                                                        </p>

                                                        <p className="max-w-45 truncate text-xs text-slate-400">
                                                            ID: #{user?._id || "N/A"}
                                                        </p>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* EMAIL */}

                                            <td className="px-6 py-4 text-sm text-slate-600">

                                                <span className="block max-w-55 truncate">
                                                    {user?.email || "N/A"}
                                                </span>

                                            </td>


                                            {/* PHONE */}

                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {user?.role?.name || "N/A"}
                                            </td>


                                            {/* STATUS */}

                                            <td className="px-6 py-4">

                                                <div className="group relative">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            changeStatus(
                                                                user?.email,
                                                                user?.status
                                                            )
                                                        }
                                                        className={`
                                            rounded-lg
                                            p-2
                                            transition
                                            ${user?.status === "active"
                                                                ? "text-green-500 text-sm bg-green-100"
                                                                : "text-red-600 text-sm bg-red-100"
                                                            }
                                        `}
                                                    >
                                                        {user?.status === "active" ? (
                                                            "active"
                                                        ) : (
                                                            "inactive"
                                                        )}

                                                    </button>

                                                </div>

                                            </td>


                                            {/* ACTIONS */}

                                            <td className="px-6 py-4">

                                                <div className="flex items-center justify-center gap-2">


                                                    {/* VIEW */}

                                                    {
                                                        permissions.includes("user:read") &&

                                                        <div className="group relative">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleUserView(user?._id)
                                                                }
                                                                className="
                                             rounded-lg
                                            p-2
                                            text-blue-600
                                            transition
                                            hover:bg-blue-50
                                        "
                                                            >
                                                                <FiEye size={18} />
                                                            </button>

                                                            <span className="
                                        pointer-events-none
                                        absolute bottom-full left-1/2
                                        mb-2
                                        -translate-x-1/2
                                        whitespace-nowrap
                                        rounded-md
                                        bg-slate-800
                                        px-2 py-1
                                        text-xs
                                        text-white
                                        opacity-0
                                        transition
                                        group-hover:opacity-100
                                    ">
                                                                View
                                                            </span>

                                                        </div>
                                                    }




                                                    {/* EDIT */}
                                                    {
                                                        permissions.includes("user:update") &&

                                                        <div className="group relative">

                                                            <button
                                                                type="button"
                                                                onClick={() => handleEditUserModal(user)}
                                                                className="
                                            rounded-lg
                                            p-2
                                            text-amber-600
                                            transition
                                            hover:bg-amber-50
                                        "
                                                            >
                                                                <FiEdit2 size={18} />
                                                            </button>

                                                            <span className="
                                        pointer-events-none
                                        absolute bottom-full left-1/2
                                        mb-2
                                        -translate-x-1/2
                                        whitespace-nowrap
                                        rounded-md
                                        bg-slate-800
                                        px-2 py-1
                                        text-xs
                                        text-white
                                        opacity-0
                                        transition
                                        group-hover:opacity-100
                                    ">
                                                                Edit
                                                            </span>

                                                        </div>
                                                    }



                                                    {/* DELETE */}

                                                    {

                                                        permissions.includes("user:delete") &&

                                                        <div className="group relative">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDeleteModal(user?._id)
                                                                }
                                                                className="
                                            rounded-lg
                                            p-2
                                            text-red-500
                                            transition
                                            hover:bg-red-50
                                        "
                                                            >
                                                                <FiTrash2 size={18} />
                                                            </button>

                                                            <span className="
                                        pointer-events-none
                                        absolute bottom-full left-1/2
                                        mb-2
                                        -translate-x-1/2
                                        whitespace-nowrap
                                        rounded-md
                                        bg-slate-800
                                        px-2 py-1
                                        text-xs
                                        text-white
                                        opacity-0
                                        transition
                                        group-hover:opacity-100
                                    ">
                                                                Delete
                                                            </span>

                                                        </div>

                                                    }



                                                </div>

                                            </td>

                                        </tr>
                                    );

                                })

                            ) : (

                                <tr>

                                    <td
                                        colSpan="4"
                                        className="px-6 py-12 text-center"
                                    >

                                        <FiUsers
                                            size={40}
                                            className="mx-auto text-slate-300"
                                        />

                                        <p className="mt-3 font-medium text-slate-600">
                                            No users found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            Try changing your search.
                                        </p>

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* ========================================= */}
            {/* ADD USER MODAL */}
            {/* ========================================= */}

            {showModal && (

                <FormModal setShowModal={setShowModal} handleAddUser={handleAddUser}
                    handleChange={handleChange} formData={formData} isEdit={isEdit}
                    editId={editId} handleEditUser={handleEditUser} roles={roles} />

            )}

            {showDeleteModal && (
                <DeleteModal setShowDeleteModal={setShowDeleteModal} handleDeleteUser={handleDeleteUser} />
            )}

        </div>
    );
};

export default Users;