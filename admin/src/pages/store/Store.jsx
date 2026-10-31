
import React, { useEffect, useState } from "react";
import {
    FiSearch,
    FiPlus,
    FiEye,
    FiEdit2,
    FiTrash2,
    FiCheckCircle,
    FiXCircle,
    FiMapPin,
    FiPhone,
    FiUsers,
    FiMap,
    FiNavigation,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../api/axios";
import DataLoader from "../../components/DataLoader";
import FormModal from "../../components/store/FormModal";
import DeleteModal from "../../components/store/DeleteModal";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const initialFormData = {
    name: "",
    code: "",
    manager: "",
    phone: "",
    address: "",
    longitude: "",
    latitude: "",
    serviceRadius: "10",
};

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#003963] focus:bg-white focus:ring-2 focus:ring-[#003963]/10";

const Store = () => {
    const navigate = useNavigate();

    const user = useSelector((store) => store.auth.user)

    const [dataLoading, setDataLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [stores, setStores] = useState([]);
    const [managers, setManagers] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [formData, setFormData] = useState({ ...initialFormData });

    // STATISTICS
    const totalStores = stores.length;

    const activeStores = stores.filter(
        (store) => store.status === "active"
    ).length;

    const inactiveStores = stores.filter(
        (store) => store.status === "inactive"
    ).length;

    // FETCH ALL STORES
    const getAllStores = async () => {
        try {
            const res = await API.get("/store/get");
            setStores(res.data.stores || []);
        } catch (error) {
            console.error(error);
            toast.error(
                error?.response?.data?.message ||
                "Failed to fetch stores"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // FETCH MANAGERS
    const getAllManagers = async () => {
        try {
            const res = await API.get("/store/user/get/managers");
            setManagers(
                res.data.managers)
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to fetch managers"
            );
        }
    };

    // RESET FORM
    const resetForm = () => {
        setFormData({ ...initialFormData });
        setEditId(null);
        setIsEdit(false);
    };

    // FORM CHANGE
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // OPEN ADD MODAL
    const handleAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    // OPEN EDIT MODAL
    const handleEditModal = (store) => {
        const coordinates = store.location?.coordinates || [];

        setEditId(store._id);
        setIsEdit(true);

        setFormData({
            name: store.name || "",
            code: store.code || "",
            manager: store.manager?._id || store.manager || "",
            phone: store.phone || "",
            address: store.address || "",
            longitude:
                coordinates.length === 2 ? String(coordinates[0]) : "",
            latitude:
                coordinates.length === 2 ? String(coordinates[1]) : "",
            serviceRadius: String(store.serviceRadius ?? 10),
        });

        setShowModal(true);
    };

    // VALIDATE FORM
    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error("Store name is required");
            return false;
        }

        if (!formData.code.trim()) {
            toast.error("Store code is required");
            return false;
        }

        if (!formData.manager) {
            toast.error("Please select a store manager");
            return false;
        }

        if (!formData.phone.trim()) {
            toast.error("Phone number is required");
            return false;
        }

        if (!formData.address.trim()) {
            toast.error("Store address is required");
            return false;
        }

        if (
            formData.serviceRadius === "" ||
            !Number.isFinite(Number(formData.serviceRadius)) ||
            Number(formData.serviceRadius) < 0
        ) {
            toast.error("Enter a valid service radius");
            return false;
        }

        const hasLongitude = formData.longitude !== "";
        const hasLatitude = formData.latitude !== "";

        if (hasLongitude !== hasLatitude) {
            toast.error("Enter both longitude and latitude");
            return false;
        }

        if (hasLongitude && hasLatitude) {
            const longitude = Number(formData.longitude);
            const latitude = Number(formData.latitude);

            if (
                !Number.isFinite(longitude) ||
                !Number.isFinite(latitude) ||
                longitude < -180 ||
                longitude > 180 ||
                latitude < -90 ||
                latitude > 90
            ) {
                toast.error("Enter valid longitude and latitude");
                return false;
            }
        }

        return true;
    };

    // BUILD STORE PAYLOAD
    const buildStorePayload = () => {
        const payload = {
            name: formData.name.trim(),
            code: formData.code.trim().toUpperCase(),
            manager: formData.manager,
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            serviceRadius: Number(formData.serviceRadius),
        };

        if (
            formData.longitude !== "" &&
            formData.latitude !== ""
        ) {
            payload.location = {
                type: "Point",
                coordinates: [
                    Number(formData.longitude),
                    Number(formData.latitude),
                ],
            };
        }

        return payload;
    };

    // ADD STORE
    const handleAddStore = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setDataLoading(true);
            const res = await API.post(
                "/store/add",
                buildStorePayload()
            );

            toast.success(
                res.data.message
            );

            setShowModal(false);
            resetForm();

            await getAllStores();
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message
            );
        } finally {
            setDataLoading(false);
        }
    };

    // UPDATE STORE
    const handleEditStore = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setDataLoading(true);

            const res = await API.put(
                `/store/update/${editId}`,
                buildStorePayload()
            );

            toast.success(
                res.data.message
            );

            setShowModal(false);
            resetForm();

            await getAllStores();
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message
            );
        } finally {
            setDataLoading(false);
        }
    };

    // OPEN DELETE MODAL
    const handleDeleteModal = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    // DELETE STORE
    const handleDeleteStore = async () => {
        try {
            setDataLoading(true);

            const res = await API.delete(
                `/store/delete/${deleteId}`
            );

            toast.success(
                res.data.message
            );

            setShowDeleteModal(false);
            setDeleteId(null);

            await getAllStores();
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message
            );
        } finally {
            setDataLoading(false);
        }
    };

    // CHANGE STATUS
    const changeStatus = async (id) => {
        try {
            setDataLoading(true);

            const res = await API.patch(
                "/store/update/status",
                { id }
            );

            toast.success(
                res.data.message || "Store status updated"
            );

            await getAllStores();
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to change store status"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // SEARCH
    const filteredStores = stores.filter((store) => {
        const searchValue = search.toLowerCase();

        return (
            store.name?.toLowerCase().includes(searchValue) ||
            store.code?.toLowerCase().includes(searchValue) ||
            store.phone?.toLowerCase().includes(searchValue) ||
            store.address?.toLowerCase().includes(searchValue)
        );
    });

    // INITIAL FETCH
    useEffect(() => {
        getAllStores();
        getAllManagers();
    }, []);

    if (!user?.role.permissions.some((permission) => permission.includes("store"))) {
        return <Navigate to="/admin/dashboard" replace />
    }

    if (dataLoading) {
        return <DataLoader />;
    }

    return (
        <div className="space-y-6">
            {/* PAGE HEADER */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">
                    Store Management
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Manage stores, managers, locations, service radius and status.
                </p>
            </div>

            {/* STATISTICS */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* TOTAL */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Total Stores
                            </p>
                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {totalStores}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FiMapPin size={24} />
                        </div>
                    </div>
                </div>

                {/* ACTIVE */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Active Stores
                            </p>
                            <h2 className="mt-2 text-3xl font-bold text-green-600">
                                {activeStores}
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
                                Inactive Stores
                            </p>
                            <h2 className="mt-2 text-3xl font-bold text-red-500">
                                {inactiveStores}
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
                            placeholder="Search stores, code, manager, phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`${inputClass} pl-10`}
                        />
                    </div>

                    {
                        user?.role?.permissions.includes("store:add") &&

                        <button
                            type="button"
                            onClick={handleAddModal}
                            className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] px-5 py-2.5 text-sm font-semibold text-white transition active:scale-95"
                        >
                            <FiPlus size={19} />
                            Add Store
                        </button>
                    }


                </div>
            </div>

            {/* STORES TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-250">
                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                {[
                                    "Store",
                                    "Store Code",
                                    "Manager",
                                    "Status",
                                    "Actions",
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {stores.length > 0 ? (
                                stores.map((store) => (
                                    <tr
                                        key={store._id}
                                        className="transition hover:bg-slate-50"
                                    >
                                        {/* STORE */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#003963]">
                                                    <FiMapPin size={21} />
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-slate-800">
                                                        {store.name}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        ID: #{store._id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* CODE */}
                                        <td className="px-6 py-4">
                                            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                                                {store.code}
                                            </span>
                                        </td>

                                        {/* MANAGER */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FiUsers
                                                    className="shrink-0 text-slate-400"
                                                    size={16}
                                                />
                                                {/* <span className="text-sm font-medium text-slate-700">
                                                    {`${store.manager.firstName}` + " " + `${store.manager.lastName}`}
                                                </span> */}
                                            </div>
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-6 py-4">
                                            <button
                                                disabled={!(user?.role.permissions.includes("store:status"))}
                                                type="button"
                                                onClick={() => changeStatus(store._id)}
                                                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${store.status === "active"
                                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                                    }`}
                                            >
                                                {store.status || "inactive"}
                                            </button>
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="px-6 py-4">


                                            <div className="flex items-center gap-2">
                                                {
                                                    user?.role?.permissions.includes("store:read") &&
                                                    <button
                                                        type="button"
                                                        title="View Store"
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/stores/${store._id}`
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                    >
                                                        <FiEye size={18} />
                                                    </button>

                                                }
                                                {

                                                    user?.role?.permissions.includes("store:update") &&
                                                    <button
                                                        type="button"
                                                        title="Edit Store"
                                                        onClick={() =>
                                                            handleEditModal(store)
                                                        }
                                                        className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                                                    >
                                                        <FiEdit2 size={18} />
                                                    </button>

                                                }

                                                {

                                                    user?.role?.permissions.includes("store:delete") &&
                                                    <button
                                                        type="button"
                                                        title="Delete Store"
                                                        onClick={() =>
                                                            handleDeleteModal(store._id)
                                                        }
                                                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>

                                                }


                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-6 py-12 text-center"
                                    >
                                        <FiMap
                                            size={40}
                                            className="mx-auto text-slate-300"
                                        />

                                        <p className="mt-3 font-medium text-slate-600">
                                            No stores found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            Try changing your search or add a new store.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADD / EDIT STORE MODAL */}
            {showModal && (
                <FormModal
                    isEdit={isEdit}
                    setShowModal={setShowModal}
                    resetForm={resetForm}
                    handleEditStore={handleEditStore}
                    handleAddStore={handleAddStore}
                    formData={formData}
                    handleChange={handleChange}
                    managers={managers}
                    inputClass={inputClass}
                />
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {showDeleteModal && (
                <DeleteModal setShowDeleteModal={setShowDeleteModal}
                    handleDeleteStore={handleDeleteStore} />
            )}
        </div>
    );
};

export default Store;
