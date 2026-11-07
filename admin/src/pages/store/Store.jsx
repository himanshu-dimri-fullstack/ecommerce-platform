
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
    FiUsers,
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
} from "react-icons/fi";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../api/axios";
import DataLoader from "../../components/DataLoader";
import FormModal from "../../components/store/FormModal";
import DeleteModal from "../../components/store/DeleteModal";
import { useSelector } from "react-redux";

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
    const user = useSelector((state) => state.auth.user);

    const permissions = user?.role?.permissions || [];

    const [dataLoading, setDataLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [stores, setStores] = useState([]);
    const [managers, setManagers] = useState([]);

    const [totalStores, setTotalStores] = useState(0);
    const [activeStores, setActiveStores] = useState(0);
    const [inactiveStores, setInactiveStores] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [filteredCount, setFilteredCount] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const [formData, setFormData] = useState({
        ...initialFormData,
    });

    // FETCH STORES
    const getAllStores = async (
        page = currentPage,
        limit = entriesPerPage,
        searchValue = debouncedSearch
    ) => {
        try {
            const res = await API.get("/store/get", {
                params: {
                    page,
                    limit,
                    search: searchValue,
                },
            });

            const data = res.data;

            setStores(data.stores || []);
            setTotalStores(data.totalStores ?? data.stores?.length ?? 0);
            setActiveStores(data.activeStores ?? 0);
            setInactiveStores(data.inactiveStores ?? 0);
            setFilteredCount(data.filteredCount ?? data.stores?.length ?? 0);
            setTotalPages(data.totalPages ?? 1);
            setCurrentPage(data.currentPage ?? page);
        } catch (error) {
            console.error("Get stores error:", error);

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
            setManagers(res.data.managers || []);
        } catch (error) {
            console.error("Get managers error:", error);

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

    // HANDLE INPUT CHANGE
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
            manager:
                store.manager?._id ||
                store.manager ||
                "",
            phone: store.phone || "",
            address: store.address || "",
            longitude:
                coordinates.length === 2
                    ? String(coordinates[0])
                    : "",
            latitude:
                coordinates.length === 2
                    ? String(coordinates[1])
                    : "",
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

        const radius = Number(formData.serviceRadius);

        if (
            formData.serviceRadius === "" ||
            !Number.isFinite(radius) ||
            radius <= 0
        ) {
            toast.error("Enter a valid service radius");
            return false;
        }

        if (
            formData.longitude === "" ||
            formData.latitude === ""
        ) {
            toast.error(
                "Please select the store location using GPS or map"
            );
            return false;
        }

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
            toast.error("Invalid store coordinates");
            return false;
        }

        return true;
    };

    // BUILD PAYLOAD
    const buildStorePayload = () => ({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        manager: formData.manager,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        serviceRadius: Number(formData.serviceRadius),

        location: {
            type: "Point",
            coordinates: [
                Number(formData.longitude),
                Number(formData.latitude),
            ],
        },
    });

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
                res.data.message || "Store added successfully"
            );

            setShowModal(false);
            resetForm();
            setCurrentPage(1);

            await getAllStores(1, entriesPerPage, debouncedSearch);
        } catch (error) {
            console.error("Add store error:", error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to add store"
            );

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
                res.data.message || "Store updated successfully"
            );

            setShowModal(false);
            resetForm();

            await getAllStores();
        } catch (error) {
            console.error("Update store error:", error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to update store"
            );

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
                res.data.message || "Store deleted successfully"
            );

            setShowDeleteModal(false);
            setDeleteId(null);

            await getAllStores();
        } catch (error) {
            console.error("Delete store error:", error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to delete store"
            );

            setDataLoading(false);
        }
    };

    // UPDATE STATUS
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
            console.error("Update status error:", error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to update store status"
            );

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

    // FETCH STORES WHEN PAGE, LIMIT OR SEARCH CHANGES
    useEffect(() => {
        getAllStores(currentPage, entriesPerPage, debouncedSearch);
    }, [currentPage, entriesPerPage, debouncedSearch]);

    // FETCH MANAGERS
    useEffect(() => {
        getAllManagers();
    }, []);

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
            permission.includes("store")
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Store Management
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage your stores, managers and store locations.
                    </p>
                </div>

                {permissions.includes("store:add") && (
                    <button
                        type="button"
                        onClick={handleAddModal}
                        className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md active:scale-95"
                    >
                        <FiPlus size={19} />
                        Add Store
                    </button>
                )}
            </div>

            {/* STATISTICS */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

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

            {/* SEARCH AND ENTRIES */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div className="relative w-full lg:max-w-md">
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

                    <div className="flex items-center gap-2">
                        <label
                            htmlFor="storeEntries"
                            className="whitespace-nowrap text-sm font-medium text-slate-500"
                        >
                            Show entries:
                        </label>

                        <select
                            id="storeEntries"
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

            {/* STORE TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-225">

                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                {[
                                    "Store",
                                    // "Store Code",
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

                                                    <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                                                        {store.address}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* CODE */}
                                        {/* <td className="px-6 py-4">
                                            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                                                {store.code}
                                            </span>
                                        </td> */}

                                        {/* MANAGER */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FiUsers
                                                    className="shrink-0 text-slate-400"
                                                    size={16}
                                                />

                                                <span className="text-sm font-medium text-slate-700">
                                                    {typeof store.manager === "object"
                                                        ? `${store.manager?.firstName || ""} ${store.manager?.lastName || ""}`.trim() ||
                                                        store.manager?.email ||
                                                        "Manager"
                                                        : "Manager"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-6 py-4">
                                            <button
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

                                                {permissions.includes("store:read") && (
                                                    <button
                                                        type="button"
                                                        title="View Store"
                                                        onClick={() =>
                                                            navigate(`/admin/stores/${store._id}`)
                                                        }
                                                        className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                    >
                                                        <FiEye size={18} />
                                                    </button>
                                                )}

                                                {permissions.includes("store:update") && (
                                                    <button
                                                        type="button"
                                                        title="Edit Store"
                                                        onClick={() => handleEditModal(store)}
                                                        className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                                                    >
                                                        <FiEdit2 size={18} />
                                                    </button>
                                                )}

                                                {permissions.includes("store:delete") && (
                                                    <button
                                                        type="button"
                                                        title="Delete Store"
                                                        onClick={() => handleDeleteModal(store._id)}
                                                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                )}

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-12 text-center"
                                    >
                                        <FiMapPin
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
                        {" "}stores
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5">

                        {/* FIRST PAGE */}
                        <button
                            type="button"
                            title="First Page"
                            disabled={currentPage === 1 || totalPages === 0}
                            onClick={() => setCurrentPage(1)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600"
                        >
                            <FiChevronsLeft size={17} />
                        </button>

                        {/* PREVIOUS */}
                        <button
                            type="button"
                            title="Previous Page"
                            disabled={currentPage === 1 || totalPages === 0}
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
                            disabled={currentPage >= totalPages || totalPages === 0}
                            onClick={() =>
                                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600"
                        >
                            <FiChevronRight size={17} />
                        </button>

                        {/* LAST PAGE */}
                        <button
                            type="button"
                            title="Last Page"
                            disabled={currentPage >= totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(totalPages)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600"
                        >
                            <FiChevronsRight size={17} />
                        </button>

                    </div>
                </div>
            </div>

            {/* STORE FORM MODAL */}
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

            {/* DELETE MODAL */}
            {showDeleteModal && (
                <DeleteModal
                    setShowDeleteModal={setShowDeleteModal}
                    handleDeleteStore={handleDeleteStore}
                />
            )}

        </div>
    );
};

export default Store;
