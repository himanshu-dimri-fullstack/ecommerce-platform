
import { useEffect, useState, useRef } from "react";
import {
    Outlet,
    NavLink,
    Navigate,
    useLocation,
    useNavigate
} from "react-router-dom";

import {
    FiMenu,
    FiX,
    FiBell,
    FiUser,
    FiLogOut,
    FiHome,
    FiPackage,
    FiGrid,
    FiUsers,
    FiSettings,
    FiShoppingBag,
    FiArchive,
    FiLayers,
    FiShield,
    FiAward,
    FiImage,
    FiTruck,
    FiPower,
    FiLoader,
    FiDollarSign,
    FiSun,
    FiMoon
} from "react-icons/fi";

import { API } from "./api/axios";
import Loader from "./components/Loader";
import LogoutModal from "./components/LogoutModal";

import { useDispatch, useSelector } from "react-redux";
import { fetchUser, setUser } from "./redux/AuthSlice.js";

import { toast } from "react-toastify";

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const sidebarNavRef = useRef(null);

    const user = useSelector((store) => store.auth.user);
    const loading = useSelector((store) => store.auth.loading);

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [permissions, setPermissions] = useState([]);

    // THEME
    const [theme, setTheme] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("admin-theme") || "light";
        }
        return "light";
    });

    const isDark = theme === "dark";

    useEffect(() => {
        localStorage.setItem("admin-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => prev === "light" ? "dark" : "light");
    };

    // DELIVERY PARTNER ONLINE STATUS
    const [isOnline, setIsOnline] = useState(false);
    const [partnerStatus, setPartnerStatus] = useState("active");
    const [statusLoading, setStatusLoading] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);

    const isDeliveryPartner =
        user?.role?.name === "delivery_partner";

    const menuItems = [
        {
            name: "Dashboard",
            path: "/admin/dashboard",
            icon: FiHome,
            permission: "dashboard"
        },
        {
            name: "Orders",
            path: "/admin/orders",
            icon: FiLayers,
            permission: "order"
        },
        {
            name: "Delivery Partners",
            path: "/admin/delivery-partners",
            icon: FiTruck,
            permission: "deliveryPartner"
        },
        {
            name: "Delivery Payouts",
            path: "/admin/delivery-payouts",
            icon: FiDollarSign,
            permission: "deliveryPayout"
        },
        {
            name: "Banner",
            path: "/admin/banner",
            icon: FiImage,
            permission: "banner"
        },
        {
            name: "Roles & Permissions",
            path: "/admin/roles",
            icon: FiShield,
            permission: "role"
        },
        {
            name: "Users",
            path: "/admin/users",
            icon: FiUsers,
            permission: "user"
        },
        {
            name: "Store",
            path: "/admin/stores",
            icon: FiShoppingBag,
            permission: "store"
        },
        {
            name: "Inventory",
            path: "/admin/inventory",
            icon: FiArchive,
            permission: "inventory"
        },
        {
            name: "Brand",
            path: "/admin/brands",
            icon: FiAward,
            permission: "brand"
        },
        {
            name: "Categories",
            path: "/admin/categories",
            icon: FiGrid,
            permission: "category"
        },
        {
            name: "Subcategories",
            path: "/admin/subcategories",
            icon: FiLayers,
            permission: "subcategory"
        },
        {
            name: "Products",
            path: "/admin/products",
            icon: FiPackage,
            permission: "product"
        },
        {
            name: "Product Variants",
            path: "/admin/product-variants",
            icon: FiLayers,
            permission: "productVariant"
        },
        {
            name: "Edit Profile",
            path: "/admin/settings",
            icon: FiSettings
        },
    ];

    const currentPage =
        menuItems.find(
            (item) =>
                location.pathname === item.path ||
                (item.path !== "/admin/dashboard" &&
                    location.pathname.startsWith(`${item.path}/`))
        )?.name || "Admin Dashboard";

    // LOGOUT
    const handleLogout = async () => {
        try {
            await API.post("/admin/logout");

            setShowLogoutModal(false);
            dispatch(setUser(null));

            navigate("/", { replace: true });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // FETCH ADMIN USER
    useEffect(() => {
        dispatch(fetchUser());
    }, [dispatch]);

    // FETCH DELIVERY PARTNER STATUS FROM BACKEND
    useEffect(() => {
        if (!isDeliveryPartner) {
            setIsOnline(false);
            setPartnerStatus("active");
            return;
        }

        const getPartnerStatus = async () => {
            try {
                setStatusLoading(true);

                const response = await API.get(
                    "/delivery-partner/me/status"
                );

                const partner = response?.data?.data;

                if (!partner) {
                    throw new Error("Invalid delivery partner response");
                }

                setIsOnline(Boolean(partner.isOnline));
                setPartnerStatus(partner.status || "active");

            } catch (error) {
                console.error(
                    "Delivery partner status fetch failed:",
                    error
                );

                setIsOnline(false);

                toast.error(
                    error?.response?.data?.message ||
                    "Unable to fetch your online status."
                );
            } finally {
                setStatusLoading(false);
            }
        };

        getPartnerStatus();
    }, [isDeliveryPartner]);

    // GET CURRENT LOCATION
    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {

            if (!navigator.geolocation) {
                reject(
                    new Error("Geolocation is not supported by this browser.")
                );
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position?.coords?.latitude;
                    const longitude = position?.coords?.longitude;

                    if (
                        latitude === null ||
                        latitude === undefined ||
                        longitude === null ||
                        longitude === undefined
                    ) {
                        reject(
                            new Error("Latitude and longitude are required.")
                        );
                        return;
                    }

                    if (
                        !Number.isFinite(latitude) ||
                        !Number.isFinite(longitude) ||
                        latitude < -90 ||
                        latitude > 90 ||
                        longitude < -180 ||
                        longitude > 180
                    ) {
                        reject(
                            new Error("Received invalid location coordinates.")
                        );
                        return;
                    }

                    resolve({
                        latitude,
                        longitude
                    });
                },
                (error) => {
                    let message = "Unable to get your current location.";

                    if (error.code === 1) {
                        message =
                            "Location permission denied. Please allow location access.";
                    } else if (error.code === 2) {
                        message =
                            "Your current location is unavailable.";
                    } else if (error.code === 3) {
                        message =
                            "Location request timed out. Please try again.";
                    }

                    reject(new Error(message));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                }
            );
        });
    };

    // DELIVERY PARTNER ONLINE / OFFLINE
    const handleOnlineToggle = async () => {
        if (statusUpdating || statusLoading) return;

        // ONLINE -> OFFLINE
        if (isOnline) {
            try {
                setStatusUpdating(true);

                await API.patch(
                    "/delivery-partner/me/online-status",
                    {
                        isOnline: false
                    }
                );

                setIsOnline(false);

                toast.success("You are now Offline.");

            } catch (error) {
                console.error("Offline update failed:", error);

                toast.error(
                    error?.response?.data?.message ||
                    "Unable to go Offline. Please try again."
                );
            } finally {
                setStatusUpdating(false);
            }

            return;
        }

        // OFFLINE -> ONLINE
        if (partnerStatus !== "active") {
            toast.error(
                "Your account is not active. You cannot go Online."
            );
            return;
        }

        try {
            setStatusUpdating(true);

            const { latitude, longitude } =
                await getCurrentLocation();

            if (
                latitude === null ||
                latitude === undefined ||
                longitude === null ||
                longitude === undefined ||
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude) ||
                latitude < -90 ||
                latitude > 90 ||
                longitude < -180 ||
                longitude > 180
            ) {
                throw new Error(
                    "Valid latitude and longitude are required."
                );
            }

            await API.patch(
                "/delivery-partner/me/online-status",
                {
                    isOnline: true,
                    latitude,
                    longitude
                }
            );

            setIsOnline(true);

            toast.success("You are now Online.");

        } catch (error) {
            console.error("Online update failed:", error);

            setIsOnline(false);

            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to go Online. Please try again."
            );

        } finally {
            setStatusUpdating(false);
        }
    };

    // AUTO SCROLL ACTIVE SIDEBAR LINK
    useEffect(() => {
        const nav = sidebarNavRef.current;

        if (!nav) return;

        const activeLink = nav.querySelector('a[aria-current="page"]');

        if (!activeLink) return;

        const navRect = nav.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();

        if (linkRect.bottom > navRect.bottom) {
            nav.scrollTop += linkRect.bottom - navRect.bottom;
        } else if (linkRect.top < navRect.top) {
            nav.scrollTop -= navRect.top - linkRect.top;
        }
    }, [location.pathname, loading, user]);

    // SET USER PERMISSIONS
    useEffect(() => {
        setPermissions(user?.role?.permissions || []);
    }, [user]);

    if (loading) return <Loader />;

    if (!user) return <Navigate to="/" replace />;

    return (
        <div
            data-theme={theme}
            className={`admin-theme min-h-screen transition-colors duration-300 ${isDark
                ? "bg-[#030303] text-neutral-100"
                : "bg-slate-100 text-slate-800"
                }`}
        >

            {/* GLOBAL THEME STYLES */}

            <style>{`

                [data-theme="dark"] {
                    color-scheme: dark;
                    background-color: #030303;
                    color: #f5f5f5;
                }

                /* =====================================
                   MAIN BACKGROUNDS
                ===================================== */

                [data-theme="dark"] .bg-white {
                    background-color: #101010 !important;
                }

                [data-theme="dark"] .bg-slate-50 {
                    background-color: #171717 !important;
                }

                [data-theme="dark"] .bg-slate-100 {
                    background-color: #030303 !important;
                }

                [data-theme="dark"] .bg-slate-200 {
                    background-color: #242424 !important;
                }

                [data-theme="dark"] .bg-slate-800 {
                    background-color: #101010 !important;
                }

                [data-theme="dark"] .bg-slate-900 {
                    background-color: #030303 !important;
                }

                /* =====================================
                   GRAY COLORS - DARK MODE
                ===================================== */

                [data-theme="dark"] .bg-gray-50 {
                    background-color: #171717 !important;
                }

                [data-theme="dark"] .bg-gray-100 {
                    background-color: #202020 !important;
                }

                [data-theme="dark"] .bg-gray-200 {
                    background-color: #292929 !important;
                }

                [data-theme="dark"] .bg-gray-300 {
                    background-color: #353535 !important;
                }

                /* GRAY TEXT COLORS */

                [data-theme="dark"] .text-gray-900,
                [data-theme="dark"] .text-gray-800,
                [data-theme="dark"] .text-gray-700 {
                    color: #f5f5f5 !important;
                }

                [data-theme="dark"] .text-gray-600,
                [data-theme="dark"] .text-gray-500 {
                    color: #a3a3a3 !important;
                }

                [data-theme="dark"] .text-gray-400 {
                    color: #737373 !important;
                }

                /* GRAY BORDERS */

                [data-theme="dark"] .border-gray-100,
                [data-theme="dark"] .border-gray-200,
                [data-theme="dark"] .border-gray-300 {
                    border-color: #303030 !important;
                }

                /* GRAY HOVER EFFECTS */

                [data-theme="dark"] .hover\\:bg-gray-50:hover {
                    background-color: #242424 !important;
                }

                [data-theme="dark"] .hover\\:bg-gray-100:hover {
                    background-color: #303030 !important;
                }

                /* =====================================
                   TEXT COLORS
                ===================================== */

                [data-theme="dark"] .text-slate-900,
                [data-theme="dark"] .text-slate-800,
                [data-theme="dark"] .text-slate-700 {
                    color: #f5f5f5 !important;
                }

                [data-theme="dark"] .text-slate-600,
                [data-theme="dark"] .text-slate-500 {
                    color: #a3a3a3 !important;
                }

                [data-theme="dark"] .text-slate-400 {
                    color: #737373 !important;
                }

                /* =====================================
                   BORDERS
                ===================================== */

                [data-theme="dark"] .border-slate-100,
                [data-theme="dark"] .border-slate-200,
                [data-theme="dark"] .border-slate-300,
                [data-theme="dark"] .border-slate-700 {
                    border-color: #292929 !important;
                }

                [data-theme="dark"] .divide-slate-100 > :not(:last-child),
                [data-theme="dark"] .divide-slate-200 > :not(:last-child) {
                    border-color: #292929 !important;
                }

                /* =====================================
                   INPUTS
                ===================================== */

                [data-theme="dark"] input,
                [data-theme="dark"] textarea,
                [data-theme="dark"] select {
                    background-color: #1c1c1c;
                    color: #f5f5f5;
                    border-color: #353535;
                }

                [data-theme="dark"] input::placeholder,
                [data-theme="dark"] textarea::placeholder {
                    color: #737373;
                }

                [data-theme="dark"] option {
                    background-color: #101010;
                    color: #f5f5f5;
                }

                /* =====================================
                   TABLES
                ===================================== */

                [data-theme="dark"] table thead {
                    background-color: #171717;
                }

                [data-theme="dark"] table tbody tr {
                    border-color: #292929;
                }

                [data-theme="dark"] .hover\\:bg-slate-50:hover {
                    background-color: #1c1c1c !important;
                }

                [data-theme="dark"] .hover\\:bg-slate-100:hover {
                    background-color: #262626 !important;
                }

                /* =====================================
                   SHADOWS
                ===================================== */

                [data-theme="dark"] .shadow-sm,
                [data-theme="dark"] .shadow-md,
                [data-theme="dark"] .shadow-lg,
                [data-theme="dark"] .shadow-xl,
                [data-theme="dark"] .shadow-2xl {
                    --tw-shadow-color: rgb(0 0 0 / 0.8);
                }

                [data-theme="dark"] .ring-white {
                    --tw-ring-color: #181818;
                }

                /* =====================================
                   EMERALD COLORS -> BLACK / GREY
                ===================================== */

                [data-theme="dark"] .bg-emerald-50,
                [data-theme="dark"] .bg-emerald-100,
                [data-theme="dark"] .bg-emerald-200,
                [data-theme="dark"] .bg-emerald-300,
                [data-theme="dark"] .bg-emerald-400,
                [data-theme="dark"] .bg-emerald-500,
                [data-theme="dark"] .bg-emerald-600,
                [data-theme="dark"] .bg-emerald-700,
                [data-theme="dark"] .bg-emerald-800,
                [data-theme="dark"] .bg-emerald-900,
                [data-theme="dark"] .bg-emerald-950 {
                    background-color: #202020 !important;
                }

                [data-theme="dark"] .text-emerald-50,
                [data-theme="dark"] .text-emerald-100,
                [data-theme="dark"] .text-emerald-200,
                [data-theme="dark"] .text-emerald-300,
                [data-theme="dark"] .text-emerald-400,
                [data-theme="dark"] .text-emerald-500,
                [data-theme="dark"] .text-emerald-600,
                [data-theme="dark"] .text-emerald-700,
                [data-theme="dark"] .text-emerald-800,
                [data-theme="dark"] .text-emerald-900,
                [data-theme="dark"] .text-emerald-950 {
                    color: #d4d4d4 !important;
                }

                [data-theme="dark"] .border-emerald-100,
                [data-theme="dark"] .border-emerald-200,
                [data-theme="dark"] .border-emerald-300,
                [data-theme="dark"] .border-emerald-400,
                [data-theme="dark"] .border-emerald-500,
                [data-theme="dark"] .border-emerald-600,
                [data-theme="dark"] .border-emerald-700 {
                    border-color: #404040 !important;
                }

                [data-theme="dark"] .ring-emerald-100,
                [data-theme="dark"] .ring-emerald-200,
                [data-theme="dark"] .ring-emerald-300,
                [data-theme="dark"] .ring-emerald-400,
                [data-theme="dark"] .ring-emerald-500 {
                    --tw-ring-color: #404040 !important;
                }

                [data-theme="dark"] .hover\\:bg-emerald-50:hover,
                [data-theme="dark"] .hover\\:bg-emerald-100:hover,
                [data-theme="dark"] .hover\\:bg-emerald-200:hover,
                [data-theme="dark"] .hover\\:bg-emerald-500:hover,
                [data-theme="dark"] .hover\\:bg-emerald-600:hover,
                [data-theme="dark"] .hover\\:bg-emerald-700:hover {
                    background-color: #303030 !important;
                }

                [data-theme="dark"] .hover\\:text-emerald-500:hover,
                [data-theme="dark"] .hover\\:text-emerald-600:hover,
                [data-theme="dark"] .hover\\:text-emerald-700:hover {
                    color: #ffffff !important;
                }

                /* =====================================
                   GREEN COLORS -> BLACK / GREY
                ===================================== */

                [data-theme="dark"] .bg-green-50,
                [data-theme="dark"] .bg-green-100,
                [data-theme="dark"] .bg-green-200,
                [data-theme="dark"] .bg-green-300,
                [data-theme="dark"] .bg-green-400,
                [data-theme="dark"] .bg-green-500,
                [data-theme="dark"] .bg-green-600,
                [data-theme="dark"] .bg-green-700,
                [data-theme="dark"] .bg-green-800,
                [data-theme="dark"] .bg-green-900,
                [data-theme="dark"] .bg-green-950 {
                    background-color: #202020 !important;
                }

                [data-theme="dark"] .text-green-50,
                [data-theme="dark"] .text-green-100,
                [data-theme="dark"] .text-green-200,
                [data-theme="dark"] .text-green-300,
                [data-theme="dark"] .text-green-400,
                [data-theme="dark"] .text-green-500,
                [data-theme="dark"] .text-green-600,
                [data-theme="dark"] .text-green-700,
                [data-theme="dark"] .text-green-800,
                [data-theme="dark"] .text-green-900,
                [data-theme="dark"] .text-green-950 {
                    color: #d4d4d4 !important;
                }

                [data-theme="dark"] .border-green-100,
                [data-theme="dark"] .border-green-200,
                [data-theme="dark"] .border-green-300,
                [data-theme="dark"] .border-green-400,
                [data-theme="dark"] .border-green-500,
                [data-theme="dark"] .border-green-600 {
                    border-color: #404040 !important;
                }

                [data-theme="dark"] .hover\\:bg-green-50:hover,
                [data-theme="dark"] .hover\\:bg-green-100:hover,
                [data-theme="dark"] .hover\\:bg-green-500:hover,
                [data-theme="dark"] .hover\\:bg-green-600:hover {
                    background-color: #303030 !important;
                }

                /* =====================================
                   RED COLORS
                ===================================== */

                [data-theme="dark"] .bg-red-50 {
                    background-color: #241818 !important;
                }

                [data-theme="dark"] .bg-red-100 {
                    background-color: #302020 !important;
                }

                [data-theme="dark"] .text-red-600,
                [data-theme="dark"] .text-red-700 {
                    color: #fca5a5 !important;
                }

                /* =====================================
                   BLUE COLORS
                ===================================== */

                [data-theme="dark"] .bg-blue-50 {
                    background-color: #191f26 !important;
                }

                [data-theme="dark"] .bg-blue-100 {
                    background-color: #222a33 !important;
                }

                [data-theme="dark"] .text-blue-600,
                [data-theme="dark"] .text-blue-700 {
                    color: #b0b0b0 !important;
                }

                /* =====================================
                   AMBER COLORS
                ===================================== */

                [data-theme="dark"] .bg-amber-50 {
                    background-color: #28231b !important;
                }

                [data-theme="dark"] .bg-amber-100 {
                    background-color: #30291e !important;
                }

                [data-theme="dark"] .text-amber-600 {
                    color: #d4d4d4 !important;
                }

                /* =====================================
                   PURPLE COLORS
                ===================================== */

                [data-theme="dark"] .bg-purple-50 {
                    background-color: #211d25 !important;
                }

                [data-theme="dark"] .bg-purple-100 {
                    background-color: #2a252f !important;
                }

                [data-theme="dark"] .text-purple-600,
                [data-theme="dark"] .text-purple-700 {
                    color: #d4d4d4 !important;
                }

                /* =====================================
                   GRADIENTS -> BLACK
                ===================================== */

                [data-theme="dark"] .bg-linear-to-br,
                [data-theme="dark"] .bg-linear-to-r,
                [data-theme="dark"] .bg-gradient-to-br,
                [data-theme="dark"] .bg-gradient-to-r,
                [data-theme="dark"] .bg-gradient-to-b {
                    background-image: linear-gradient(
                        135deg,
                        #292929 0%,
                        #151515 50%,
                        #050505 100%
                    ) !important;
                }

                /* =====================================
                   SCROLLBAR
                ===================================== */

                [data-theme="dark"] * {
                    scrollbar-color: #404040 #101010;
                }

                [data-theme="dark"] *::-webkit-scrollbar {
                    width: 7px;
                    height: 7px;
                }

                [data-theme="dark"] *::-webkit-scrollbar-track {
                    background: #101010;
                }

                [data-theme="dark"] *::-webkit-scrollbar-thumb {
                    background: #404040;
                    border-radius: 20px;
                }

                [data-theme="dark"] *::-webkit-scrollbar-thumb:hover {
                    background: #606060;
                }

            `}</style>


            {/* MOBILE OVERLAY */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50
                    flex h-dvh w-64 max-w-[85vw] flex-col
                    overflow-hidden

                    ${isDark
                        ? "bg-[#080808]"
                        : "bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22]"
                    }

                    text-white shadow-2xl
                    transition-all duration-300

                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0
                `}
                style={isDark ? {
                    backgroundImage: `
                        linear-gradient(
                            145deg,
                            #242424 0%,
                            #151515 15%,
                            #0b0b0b 45%,
                            #050505 75%,
                            #000000 100%
                        )
                    `,
                    boxShadow: `
                        8px 0 35px rgba(0, 0, 0, 0.65),
                        inset 0 1px 0 rgba(255, 255, 255, 0.09),
                        inset -1px 0 0 rgba(255, 255, 255, 0.07)
                    `
                } : {}}
            >

                {/* LOGO */}
                <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-5">

                    <div>
                        <h1 className="text-xl font-extrabold tracking-wide">
                            AdminPanel
                        </h1>

                        <p className={`mt-1 text-xs ${isDark ? "text-neutral-400" : "text-emerald-100/80"
                            }`}>
                            Management System
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close sidebar"
                        className="rounded-lg p-2 transition hover:bg-white/10 lg:hidden"
                    >
                        <FiX size={22} />
                    </button>

                </div>

                {/* SCROLLABLE NAVIGATION */}
                <nav
                    ref={sidebarNavRef}
                    className="admin-sidebar-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-5"
                >

                    <p className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] ${isDark ? "text-neutral-500" : "text-emerald-100/60"
                        }`}>
                        Main Navigation
                    </p>

                    <div className="space-y-1.5">

                        {menuItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                permissions.some(
                                    (permission) =>
                                        permission.includes(item.permission)
                                ) && (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.path === "/admin/dashboard"}
                                        onClick={() => setSidebarOpen(false)}
                                        className={({ isActive }) => `
                                            group relative flex min-h-11 w-full
                                            items-center gap-3 rounded-xl
                                            px-3.5 py-3 text-sm font-semibold
                                            transition-all duration-200
                                            ${isActive
                                                ? isDark
                                                    ? "bg-[#303030] text-white shadow-lg ring-1 ring-white/10"
                                                    : "bg-white text-emerald-800 shadow-md"
                                                : isDark
                                                    ? "text-neutral-400 hover:bg-white/10 hover:text-white"
                                                    : "text-white/80 hover:bg-white/10 hover:text-white"
                                            }
                                        `}
                                    >

                                        {({ isActive }) => (
                                            <>
                                                <Icon
                                                    size={19}
                                                    className={`shrink-0 ${isDark
                                                        ? isActive
                                                            ? "text-white"
                                                            : "text-neutral-500 group-hover:text-white"
                                                        : isActive
                                                            ? "text-emerald-700"
                                                            : "text-emerald-100/80 group-hover:text-white"
                                                        }`}
                                                />

                                                <span className="min-w-0 flex-1 truncate">
                                                    {item.name}
                                                </span>

                                                {isActive && (
                                                    <span
                                                        className={`h-2 w-2 shrink-0 rounded-full ${isDark
                                                            ? "bg-neutral-300"
                                                            : "bg-emerald-600"
                                                            }`}
                                                    />
                                                )}
                                            </>
                                        )}

                                    </NavLink>
                                )
                            );
                        })}

                    </div>

                </nav>

                {/* SIDEBAR LOGOUT */}
                <div className="shrink-0 border-t border-white/10 p-3">

                    <button
                        type="button"
                        onClick={() => setShowLogoutModal(true)}
                        className="
                            flex w-full items-center gap-3 rounded-xl
                            px-4 py-3 text-sm font-semibold
                            text-white/80 transition
                            hover:bg-red-500/15 hover:text-red-200
                        "
                    >
                        <FiLogOut size={19} />

                        <span>Logout</span>
                    </button>

                </div>

            </aside>

            {/* MAIN AREA */}
            <div className="min-h-screen lg:ml-64">

                {/* NAVBAR */}
                <header
                    className={`
                        sticky top-0 z-30 flex h-20
                        items-center justify-between gap-3
                        border-b px-4 shadow-sm sm:px-6
                        transition-colors duration-300
                        ${isDark
                            ? "border-[#292929] bg-[#101010]"
                            : "border-slate-200 bg-white"
                        }
                    `}
                >

                    {/* LEFT */}
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">

                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open sidebar"
                            className={`
                                shrink-0 rounded-xl p-2 transition lg:hidden
                                ${isDark
                                    ? "text-neutral-300 hover:bg-[#262626]"
                                    : "text-slate-600 hover:bg-slate-100"
                                }
                            `}
                        >
                            <FiMenu size={24} />
                        </button>

                        <div className="min-w-0">

                            <h2
                                className={`truncate text-lg font-bold sm:text-xl ${isDark
                                    ? "text-neutral-100"
                                    : "text-slate-800"
                                    }`}
                            >
                                {currentPage}
                            </h2>

                            <p
                                className={`hidden text-xs ${isDark
                                    ? "text-neutral-400"
                                    : "text-slate-500"
                                    }`}
                            >
                                Manage your application
                            </p>

                        </div>

                    </div>

                    {/* RIGHT */}
                    <div className="flex shrink-0 items-center gap-2 sm:gap-4">

                        {/* DELIVERY PARTNER ONLINE / OFFLINE */}
                        {isDeliveryPartner && (
                            <button
                                type="button"
                                onClick={handleOnlineToggle}
                                disabled={
                                    statusLoading ||
                                    statusUpdating ||
                                    (!isOnline && partnerStatus !== "active")
                                }
                                className={`
                                    flex items-center gap-2 rounded-xl
                                    border px-3 py-2.5 text-xs font-bold
                                    transition-all duration-200 sm:px-4 sm:text-sm
                                    disabled:cursor-not-allowed disabled:opacity-60
                                    ${isDark
                                        ? "border-[#383838] bg-[#202020] text-neutral-200 hover:bg-[#303030]"
                                        : isOnline
                                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                            : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                                    }
                                `}
                            >
                                {statusLoading || statusUpdating ? (
                                    <FiLoader
                                        size={17}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <FiPower size={17} />
                                )}

                                <span>
                                    {statusLoading
                                        ? "Loading..."
                                        : statusUpdating
                                            ? "Updating..."
                                            : isOnline
                                                ? "Online"
                                                : "Offline"}
                                </span>

                                <span
                                    className={`h-2 w-2 rounded-full ${isDark
                                        ? "bg-neutral-300"
                                        : isOnline
                                            ? "bg-emerald-500"
                                            : "bg-neutral-500"
                                        }`}
                                />
                            </button>
                        )}

                        {/* THEME TOGGLE */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
                            title={`Switch to ${isDark ? "light" : "dark"} theme`}
                            className={`
                                flex h-10 w-10 items-center justify-center
                                rounded-xl border transition-all duration-200
                                ${isDark
                                    ? "border-[#333333] bg-[#1c1c1c] text-neutral-300 hover:bg-[#303030]"
                                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                                }
                            `}
                        >
                            {isDark ? (
                                <FiSun size={20} />
                            ) : (
                                <FiMoon size={20} />
                            )}
                        </button>

                        {/* NOTIFICATIONS */}
                        <button
                            type="button"
                            aria-label="Notifications"
                            className={`
                                relative rounded-xl p-2.5 transition
                                ${isDark
                                    ? "text-neutral-300 hover:bg-[#262626]"
                                    : "text-slate-600 hover:bg-slate-100"
                                }
                            `}
                        >
                            <FiBell size={20} />

                            <span
                                className={`absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ${isDark ? "ring-[#101010]" : "ring-white"
                                    }`}
                            />
                        </button>

                        {/* USER PROFILE */}
                        <div
                            className={`flex items-center gap-2 border-l pl-3 sm:gap-3 sm:pl-4 ${isDark
                                ? "border-[#333333]"
                                : "border-slate-200"
                                }`}
                        >

                            <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isDark
                                    ? "bg-[#252525]"
                                    : "bg-emerald-50"
                                    }`}
                            >
                                <FiUser
                                    size={23}
                                    className={
                                        isDark
                                            ? "text-neutral-300"
                                            : "text-emerald-800"
                                    }
                                />
                            </div>

                            <div className="hidden min-w-0 sm:block">

                                <p
                                    className={`max-w-36 truncate text-sm font-bold ${isDark
                                        ? "text-neutral-100"
                                        : "text-slate-800"
                                        }`}
                                >
                                    {user
                                        ? `${user?.firstName} ${user?.lastName}`
                                        : "Admin"}
                                </p>

                                <p
                                    className={`text-xs ${isDark
                                        ? "text-neutral-400"
                                        : "text-slate-500"
                                        }`}
                                >
                                    {user?.role
                                        ? user.role?.name
                                        : "admin"}
                                </p>

                            </div>

                        </div>

                    </div>

                </header>

                {/* PAGE CONTENT */}
                <main className="min-h-[calc(100vh-144px)] p-4 transition-colors duration-300 sm:p-6 lg:p-8">
                    <Outlet />
                </main>

                {/* FOOTER */}
                <footer
                    className={`
                        border-t px-5 py-5 transition-colors duration-300 sm:px-6
                        ${isDark
                            ? "border-[#292929] bg-[#101010]"
                            : "border-slate-200 bg-white"
                        }
                    `}
                >

                    <div
                        className={`flex flex-col items-center justify-between gap-2 text-center text-xs sm:flex-row sm:text-sm ${isDark
                            ? "text-neutral-400"
                            : "text-slate-500"
                            }`}
                    >

                        <p>
                            © {new Date().getFullYear()} AdminPanel. All rights reserved.
                        </p>

                        <p>
                            Admin Management System
                        </p>

                    </div>

                </footer>

            </div>

            {/* LOGOUT MODAL */}
            {showLogoutModal && (
                <LogoutModal
                    handleLogout={handleLogout}
                    setShowLogoutModal={setShowLogoutModal}
                />
            )}

        </div>
    );
};

export default AdminLayout;
