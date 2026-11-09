import React, { useEffect, useState } from "react";
import {
    FiSearch,
    FiPlus,
    FiEye,
    FiEdit2,
    FiTrash2,
    FiCheckCircle,
    FiXCircle,
    FiTruck,
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
    FiX,
    FiActivity,
    FiWifi,
} from "react-icons/fi";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../api/axios";
import DataLoader from "../../components/DataLoader";
import { useSelector } from "react-redux";
import FormModal from "../../components/delivery_partner/FormModal";
import DeleteModal from "../../components/delivery_partner/DeleteModal";

const DeliveryPartners = () => {
    const user = useSelector((store) => store.auth.user);
    const navigate = useNavigate();

    const permissions = user?.role?.permissions || [];

    // =========================
    // STATES
    // =========================

    const [dataLoading, setDataLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    const [totalPartners, setTotalPartners] = useState(0);
    const [activePartners, setActivePartners] = useState(0);
    const [inactivePartners, setInactivePartners] = useState(0);
    const [onlinePartners, setOnlinePartners] = useState(0);
    const [availablePartners, setAvailablePartners] = useState(0);
    const [filteredTotal, setFilteredTotal] = useState(0);

    const [partners, setPartners] = useState([]);
    const [statusFilter, setStatusFilter] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const [submitting, setSubmitting] = useState(false);
    const [updatingStatusId, setUpdatingStatusId] = useState(null);

    const initialFormData = {
        user: "",
        vehicleType: "bike",
        vehicleNumber: "",
        drivingLicenseNumber: "",
    };

    const [formData, setFormData] = useState(initialFormData);

    const [availableUsers, setAvailableUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // =========================
    // FETCH AVAILABLE USERS
    // =========================

    const fetchAvailableUsers = async () => {
        try {
            setLoadingUsers(true);

            const res = await API.get("/delivery-partner/available-users");

            setAvailableUsers(res.data.users || []);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to fetch available users"
            );
        } finally {
            setLoadingUsers(false);
        }
    };

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
    // GET ALL DELIVERY PARTNERS
    // =========================

    const getAllDeliveryPartners = async (
        page = currentPage,
        searchValue = debouncedSearch,
        pageLimit = limit,
        selectedStatus = statusFilter
    ) => {
        try {
            setDataLoading(true);

            const res = await API.get("/delivery-partner/get", {
                params: {
                    page,
                    limit: pageLimit,
                    search: searchValue,
                    status: selectedStatus,
                },
            });

            const response = res.data;

            setPartners(
                response.deliveryPartners ||
                response.partners ||
                []
            );

            setTotalPartners(response.totalPartners || 0);
            setActivePartners(response.activePartners || 0);
            setInactivePartners(response.inactivePartners || 0);
            setOnlinePartners(response.onlinePartners || 0);
            setAvailablePartners(response.availablePartners || 0);

            setFilteredTotal(
                response.filteredTotal ??
                response.totalPartners ??
                0
            );

            setTotalPages(response.totalPages || 0);
        } catch (error) {
            console.log(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to fetch delivery partners"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // =========================
    // ADD PARTNER MODAL
    // =========================

    const handleAddPartnerModal = () => {
        setIsEdit(false);
        setEditId(null);
        setFormData(initialFormData);
        setShowModal(true);
        fetchAvailableUsers();
    };

    // =========================
    // ADD DELIVERY PARTNER
    // =========================

    const handleAddPartner = async (e) => {
        e.preventDefault();

        try {
            setSubmitting(true);

            const payload = {
                user: formData.user.trim(),
                vehicleType: formData.vehicleType,
                vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
                drivingLicenseNumber: formData.drivingLicenseNumber.trim().toUpperCase(),
            };

            const res = await API.post(
                "/delivery-partner/add",
                payload
            );

            toast.success(
                res.data.message || "Delivery partner added successfully"
            );

            setShowModal(false);
            setFormData(initialFormData);
            setCurrentPage(1);

            await getAllDeliveryPartners(
                1,
                debouncedSearch,
                limit,
                statusFilter
            );
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to add delivery partner"
            );
        } finally {
            setSubmitting(false);
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
    // DELETE DELIVERY PARTNER
    // =========================

    const handleDeletePartner = async () => {
        if (!deleteId) return;

        try {
            setDataLoading(true);

            const res = await API.delete(
                `/delivery-partner/delete/${deleteId}`
            );

            toast.success(
                res.data.message || "Delivery partner deleted successfully"
            );

            setShowDeleteModal(false);
            setDeleteId(null);

            const nextPage =
                partners.length === 1 && currentPage > 1
                    ? currentPage - 1
                    : currentPage;

            setCurrentPage(nextPage);

            await getAllDeliveryPartners(
                nextPage,
                debouncedSearch,
                limit,
                statusFilter
            );
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to delete delivery partner"
            );

            setDataLoading(false);
        }
    };

    // =========================
    // GET NEXT STATUS
    // =========================

    const getNextStatus = (status) => {
        return status === "active" ? "inactive" : "active";
    };

    // =========================
    // CHANGE PARTNER STATUS
    // BACKEND API WILL UPDATE STATUS
    // =========================

    const changeStatus = async (id, currentStatus) => {
        if (updatingStatusId) return;

        const nextStatus = getNextStatus(currentStatus);

        try {
            setUpdatingStatusId(id);

            const res = await API.patch(
                "/delivery-partner/update/status",
                {
                    id,
                    status: nextStatus,
                }
            );

            toast.success(
                res.data.message || "Partner status updated successfully"
            );

            // Fetch updated data from backend
            await getAllDeliveryPartners(
                currentPage,
                debouncedSearch,
                limit,
                statusFilter
            );
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to update partner status"
            );
        } finally {
            setUpdatingStatusId(null);
        }
    };

    // =========================
    // VIEW DELIVERY PARTNER
    // =========================

    const handlePartnerView = (id) => {
        navigate(`/admin/delivery-partners/${id}`);
    };

    // =========================
    // EDIT PARTNER MODAL
    // =========================

    const handleEditPartnerModal = (partner) => {
        setEditId(partner._id);
        setIsEdit(true);

        setFormData({
            user: partner.user?._id || partner.user || "",
            vehicleType: partner.vehicleType || "bike",
            vehicleNumber: partner.vehicleNumber || "",
            drivingLicenseNumber: partner.drivingLicenseNumber || "",
        });

        setShowModal(true);
    };

    // =========================
    // EDIT DELIVERY PARTNER
    // =========================

    const handleEditPartner = async (e) => {
        e.preventDefault();

        if (!formData.vehicleNumber.trim()) {
            toast.error("Please enter vehicle number");
            return;
        }

        if (!formData.drivingLicenseNumber.trim()) {
            toast.error("Please enter driving license number");
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                vehicleType: formData.vehicleType,
                vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
                drivingLicenseNumber: formData.drivingLicenseNumber.trim().toUpperCase(),
            };

            const res = await API.put(
                `/delivery-partner/update/${editId}`,
                payload
            );

            toast.success(
                res.data.message || "Delivery partner updated successfully"
            );

            setShowModal(false);
            setEditId(null);
            setFormData(initialFormData);

            await getAllDeliveryPartners();
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to update delivery partner"
            );
        } finally {
            setSubmitting(false);
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
    // FETCH DELIVERY PARTNERS
    // =========================

    useEffect(() => {
        getAllDeliveryPartners(
            currentPage,
            debouncedSearch,
            limit,
            statusFilter
        );
    }, [currentPage, limit, debouncedSearch, statusFilter]);

    // =========================
    // PAGINATION NUMBERS
    // =========================

    const getPaginationNumbers = () => {
        if (totalPages <= 5) {
            return Array.from(
                { length: totalPages },
                (_, i) => i + 1
            );
        }

        if (currentPage <= 3) {
            return [1, 2, 3, 4, "...", totalPages];
        }

        if (currentPage >= totalPages - 2) {
            return [
                1,
                "...",
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages,
            ];
        }

        return [
            1,
            "...",
            currentPage - 1,
            currentPage,
            currentPage + 1,
            "...",
            totalPages,
        ];
    };

    // =========================
    // PERMISSIONS
    // =========================

    if (
        !permissions.some((permission) =>
            permission.includes("deliveryPartner")
        )
    ) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (dataLoading) {
        return <DataLoader />;
    }

    // =========================
    // PAGINATION INFO
    // =========================

    const startIndex =
        filteredTotal === 0
            ? 0
            : (currentPage - 1) * limit + 1;

    const endIndex = Math.min(
        currentPage * limit,
        filteredTotal
    );

    // =========================
    // HELPER FUNCTIONS
    // =========================

    const getPartnerName = (partner) => {
        const partnerUser = partner.user;

        if (!partnerUser || typeof partnerUser === "string") {
            return "User not populated";
        }

        return (
            `${partnerUser.firstName || ""} ${partnerUser.lastName || ""}`.trim() ||
            partnerUser.name ||
            "Unknown Partner"
        );
    };

    const getPartnerInitials = (partner) => {
        const name = getPartnerName(partner);

        if (name === "User not populated" || name === "Unknown Partner") {
            return "DP";
        }

        return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join("");
    };

    const getPartnerEmail = (partner) => {
        return partner.user?.email || "-";
    };

    const getPartnerPhone = (partner) => {
        return (
            partner.user?.phone ||
            partner.user?.phoneNumber ||
            "-"
        );
    };

    // =========================
    // UI
    // =========================

    return (
        <div className="space-y-6">

            {/* PAGE HEADER */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />

                        <span className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
                            Delivery Management
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold text-slate-800">
                        Delivery Partners
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage delivery partners, vehicles and their working status.
                    </p>
                </div>

                {permissions.includes("deliveryPartner:add") && (
                    <button
                        onClick={handleAddPartnerModal}
                        className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-lg active:scale-95"
                    >
                        <FiPlus size={19} />
                        Add Delivery Partner
                    </button>
                )}

            </div>

            {/* STAT CARDS */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

                {/* TOTAL PARTNERS */}

                <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-50 transition group-hover:scale-125" />

                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Total Partners
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {totalPartners}
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                All registered delivery partners
                            </p>
                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                            <FiTruck size={25} />
                        </div>
                    </div>
                </div>

                {/* ACTIVE */}

                <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-green-50 transition group-hover:scale-125" />

                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Active Partners
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-green-600">
                                {activePartners}
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Approved delivery partners
                            </p>
                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600">
                            <FiCheckCircle size={25} />
                        </div>
                    </div>
                </div>

                {/* INACTIVE */}

                <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-orange-50 transition group-hover:scale-125" />

                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Inactive Partners
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-orange-500">
                                {inactivePartners}
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Currently inactive
                            </p>
                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                            <FiXCircle size={25} />
                        </div>
                    </div>
                </div>

                {/* ONLINE */}

                <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-50 transition group-hover:scale-125" />

                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Online Partners
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-blue-600">
                                {onlinePartners}
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Currently online
                            </p>
                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                            <FiWifi size={25} />
                        </div>
                    </div>
                </div>

                {/* AVAILABLE */}

                <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyan-50 transition group-hover:scale-125" />

                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Available Partners
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-cyan-600">
                                {availablePartners}
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Ready for new orders
                            </p>
                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600">
                            <FiActivity size={25} />
                        </div>
                    </div>
                </div>

            </div>

            {/* SEARCH + FILTER */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

                    {/* SEARCH */}

                    <div className="w-full lg:max-w-md">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Search Delivery Partners
                        </label>

                        <div className="relative">
                            <FiSearch
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                size={19}
                            />

                            <input
                                type="text"
                                placeholder="Search by name, email, vehicle or license..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-11 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                                    title="Clear search"
                                >
                                    <FiX size={17} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* STATUS FILTER */}

                    <div className="flex flex-wrap items-center gap-3">

                        <label className="whitespace-nowrap text-sm font-medium text-slate-500">
                            Status
                        </label>

                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <label className="whitespace-nowrap text-sm font-medium text-slate-500">
                            Show
                        </label>

                        <select
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>

                        <span className="whitespace-nowrap text-sm font-medium text-slate-500">
                            entries
                        </span>

                    </div>
                </div>

                {/* SEARCH INFO */}

                <div className="mt-4 flex flex-col gap-1 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-xs text-slate-400">
                        Showing{" "}
                        <span className="font-semibold text-slate-600">
                            {startIndex}-{endIndex}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-slate-600">
                            {filteredTotal}
                        </span>{" "}
                        delivery partners
                    </p>

                    {debouncedSearch && (
                        <p className="text-xs text-emerald-700">
                            Search results for:{" "}
                            <span className="font-semibold">
                                "{debouncedSearch}"
                            </span>
                        </p>
                    )}

                </div>

            </div>

            {/* DELIVERY PARTNERS TABLE */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* TABLE HEADER */}

                <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            Delivery Partner List
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-400">
                            Manage all registered delivery partners
                        </p>
                    </div>

                    <span className="w-fit rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        {filteredTotal} Total
                    </span>

                </div>

                {/* TABLE */}

                <div className="overflow-x-auto">

                    <table className="w-full">

                        <thead className="border-b border-slate-200 bg-slate-50">

                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Delivery Partner
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Availability
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

                            {partners.length > 0 ? (
                                partners.map((partner) => (

                                    <tr
                                        key={partner._id}
                                        className="transition hover:bg-emerald-50/30"
                                    >

                                        {/* PARTNER DETAILS */}

                                        <td className="px-6 py-4">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700">
                                                    {getPartnerInitials(partner)}
                                                </div>

                                                <div className="min-w-0">

                                                    <p className="font-semibold text-slate-800">
                                                        {getPartnerName(partner)}
                                                    </p>

                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        {getPartnerEmail(partner)}
                                                    </p>

                                                    <p className="mt-0.5 text-xs text-slate-400">
                                                        {getPartnerPhone(partner)}
                                                    </p>

                                                </div>

                                            </div>

                                        </td>

                                        {/* AVAILABILITY */}

                                        <td className="px-6 py-4">

                                            <div className="flex flex-col items-start gap-2">

                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${partner.isOnline
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-slate-100 text-slate-500"
                                                        }`}
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${partner.isOnline
                                                            ? "bg-green-500"
                                                            : "bg-slate-400"
                                                            }`}
                                                    />

                                                    {partner.isOnline ? "Online" : "Offline"}
                                                </span>

                                                <span
                                                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${partner.isAvailable
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-orange-100 text-orange-700"
                                                        }`}
                                                >
                                                    {partner.isAvailable
                                                        ? "Available"
                                                        : "Not Available"}
                                                </span>

                                            </div>

                                        </td>

                                        {/* STATUS - BACKEND API TOGGLE */}

                                        <td className="px-6 py-4">

                                            <button
                                                type="button"
                                                disabled={
                                                    !permissions.includes("deliveryPartner:status") ||
                                                    updatingStatusId === partner._id
                                                }
                                                onClick={() =>
                                                    changeStatus(
                                                        partner._id,
                                                        partner.status
                                                    )
                                                }
                                                className={`inline-flex min-w-25 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${partner.status === "active"
                                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                    : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                                    }`}
                                            >
                                                <span
                                                    className={`h-2 w-2 rounded-full ${partner.status === "active"
                                                        ? "bg-green-500"
                                                        : "bg-orange-500"
                                                        }`}
                                                />

                                                {updatingStatusId === partner._id
                                                    ? "Updating..."
                                                    : partner.status === "active"
                                                        ? "Active"
                                                        : "Inactive"}
                                            </button>

                                        </td>

                                        {/* ACTIONS */}

                                        <td className="px-6 py-4">

                                            <div className="flex items-center justify-center gap-2">

                                                {permissions.includes("deliveryPartner:read") && (
                                                    <button
                                                        onClick={() =>
                                                            handlePartnerView(partner._id)
                                                        }
                                                        title="View"
                                                        className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                    >
                                                        <FiEye size={18} />
                                                    </button>
                                                )}

                                                {permissions.includes("deliveryPartner:update") && (
                                                    <button
                                                        onClick={() =>
                                                            handleEditPartnerModal(partner)
                                                        }
                                                        title="Edit"
                                                        className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                                                    >
                                                        <FiEdit2 size={18} />
                                                    </button>
                                                )}

                                                {permissions.includes("deliveryPartner:delete") && (
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteModal(partner._id)
                                                        }
                                                        title="Delete"
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
                                    <td colSpan="4" className="px-6 py-16 text-center">

                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                            <FiTruck size={30} />
                                        </div>

                                        <p className="mt-4 font-semibold text-slate-700">
                                            No delivery partners found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            {debouncedSearch || statusFilter
                                                ? "Try changing your search or status filter."
                                                : "Add a delivery partner to get started."}
                                        </p>

                                    </td>
                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

                {/* TABLE FOOTER + PAGINATION */}

                <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-xs text-slate-400">
                        Showing{" "}
                        <span className="font-semibold text-slate-600">
                            {startIndex}-{endIndex}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-slate-600">
                            {filteredTotal}
                        </span>{" "}
                        delivery partners
                    </p>

                    {filteredTotal > 0 && (
                        <div className="flex flex-wrap items-center gap-1">

                            {/* FIRST PAGE */}

                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(1)}
                                title="First page"
                                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <FiChevronsLeft size={17} />
                            </button>

                            {/* PREVIOUS PAGE */}

                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((prev) => prev - 1)}
                                title="Previous page"
                                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <FiChevronLeft size={17} />
                            </button>

                            {/* PAGE NUMBERS */}

                            {getPaginationNumbers().map((page, index) => (
                                page === "..." ? (
                                    <span
                                        key={`dots-${index}`}
                                        className="px-2 text-sm text-slate-400"
                                    >
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`min-w-9 rounded-lg px-3 py-2 text-sm font-semibold transition ${currentPage === page
                                            ? "bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] text-white shadow-sm"
                                            : "border border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                )
                            ))}

                            {/* NEXT PAGE */}

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((prev) => prev + 1)}
                                title="Next page"
                                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <FiChevronRight size={17} />
                            </button>

                            {/* LAST PAGE */}

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(totalPages)}
                                title="Last page"
                                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <FiChevronsRight size={17} />
                            </button>

                        </div>
                    )}

                </div>

            </div>

            {/* ADD / EDIT MODAL */}

            {showModal && (
                <FormModal
                    isEdit={isEdit}
                    setShowModal={setShowModal}
                    formData={formData}
                    handleChange={handleChange}
                    handleEditPartner={handleEditPartner}
                    handleAddPartner={handleAddPartner}
                    submitting={submitting}
                    availableUsers={availableUsers}
                    loadingUsers={loadingUsers}
                />
            )}

            {/* DELETE MODAL */}

            {showDeleteModal && (
                <DeleteModal
                    setShowDeleteModal={setShowDeleteModal}
                    setDeleteId={setDeleteId}
                    handleDeletePartner={handleDeletePartner}
                />
            )}

        </div>
    );
};

export default DeliveryPartners;