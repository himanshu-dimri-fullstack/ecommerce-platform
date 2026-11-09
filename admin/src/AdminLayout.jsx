
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
    FiLoader
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
            name: "Delivery Partners",
            path: "/admin/delivery-partners",
            icon: FiTruck,
            permission: "deliveryPartner"
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

                    // BOTH COORDINATES ARE MANDATORY
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

                    // VALIDATE COORDINATES
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
        // NO GPS REQUIRED
        if (isOnline) {
            try {
                setStatusUpdating(true);

                await API.patch(
                    "/delivery-partner/me/online-status",
                    {
                        isOnline: false
                    }
                );

                // UPDATE UI ONLY AFTER API SUCCESS
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
        // BLOCK INACTIVE / BLOCKED PARTNERS
        if (partnerStatus !== "active") {
            toast.error(
                "Your account is not active. You cannot go Online."
            );
            return;
        }

        try {
            setStatusUpdating(true);

            // STEP 1: GET GPS LOCATION
            const { latitude, longitude } =
                await getCurrentLocation();

            // STEP 2: FINAL VALIDATION BEFORE API CALL
            // API WILL NOT BE CALLED WITHOUT BOTH VALID COORDINATES
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

            // STEP 3: CALL BACKEND ONLY AFTER GPS SUCCESS
            await API.patch(
                "/delivery-partner/me/online-status",
                {
                    isOnline: true,
                    latitude,
                    longitude
                }
            );

            // STEP 4: UPDATE UI ONLY AFTER API SUCCESS
            setIsOnline(true);

            toast.success("You are now Online.");

        } catch (error) {
            console.error("Online update failed:", error);

            // REMAIN OFFLINE IF GPS OR API FAILS
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
        <div className="min-h-screen bg-slate-100">

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
                    bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22]
                    text-white shadow-2xl
                    transition-transform duration-300
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0
                `}
            >

                {/* LOGO */}
                <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-5">

                    <div>
                        <h1 className="text-xl font-extrabold tracking-wide">
                            AdminPanel
                        </h1>

                        <p className="mt-1 text-xs text-emerald-100/80">
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

                    <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100/60">
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
                                        className={({ isActive }) =>
                                            `
                                            group relative flex min-h-11 w-full
                                            items-center gap-3 rounded-xl
                                            px-3.5 py-3 text-sm font-semibold
                                            transition-all duration-200
                                            ${isActive
                                                ? "bg-white text-emerald-800 shadow-md"
                                                : "text-white/80 hover:bg-white/10 hover:text-white"
                                            }
                                            `
                                        }
                                    >

                                        {({ isActive }) => (
                                            <>
                                                <Icon
                                                    size={19}
                                                    className={`shrink-0 ${isActive
                                                            ? "text-emerald-700"
                                                            : "text-emerald-100/80 group-hover:text-white"
                                                        }`}
                                                />

                                                <span className="min-w-0 flex-1 truncate">
                                                    {item.name}
                                                </span>

                                                {isActive && (
                                                    <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
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
                    className="
                        sticky top-0 z-30 flex h-20
                        items-center justify-between gap-3
                        border-b border-slate-200 bg-white
                        px-4 shadow-sm sm:px-6
                    "
                >

                    {/* LEFT */}
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">

                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open sidebar"
                            className="
                                shrink-0 rounded-xl p-2
                                text-slate-600 transition
                                hover:bg-slate-100 lg:hidden
                            "
                        >
                            <FiMenu size={24} />
                        </button>

                        <div className="min-w-0">

                            <h2 className="truncate text-lg font-bold text-slate-800 sm:text-xl">
                                {currentPage}
                            </h2>

                            <p className="hidden text-xs text-slate-500 sm:block">
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
                                    ${isOnline
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
                                    className={`
                                        h-2 w-2 rounded-full
                                        ${isOnline
                                            ? "bg-emerald-500"
                                            : "bg-slate-400"
                                        }
                                    `}
                                />
                            </button>
                        )}

                        {/* NOTIFICATIONS */}
                        <button
                            type="button"
                            aria-label="Notifications"
                            className="
                                relative rounded-xl p-2.5
                                text-slate-600 transition
                                hover:bg-slate-100
                            "
                        >
                            <FiBell size={20} />

                            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                        </button>

                        {/* USER PROFILE */}
                        <div className="flex items-center gap-2 border-l border-slate-200 pl-3 sm:gap-3 sm:pl-4">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                                <FiUser
                                    size={23}
                                    className="text-emerald-800"
                                />
                            </div>

                            <div className="hidden min-w-0 sm:block">

                                <p className="max-w-36 truncate text-sm font-bold text-slate-800">
                                    {user
                                        ? `${user?.firstName} ${user?.lastName}`
                                        : "Admin"}
                                </p>

                                <p className="text-xs text-slate-500">
                                    {user?.role
                                        ? user.role?.name
                                        : "admin"}
                                </p>

                            </div>

                        </div>

                    </div>

                </header>

                {/* PAGE CONTENT */}
                <main className="min-h-[calc(100vh-144px)] p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>

                {/* FOOTER */}
                <footer className="border-t border-slate-200 bg-white px-5 py-5 sm:px-6">

                    <div className="flex flex-col items-center justify-between gap-2 text-center text-xs text-slate-500 sm:flex-row sm:text-sm">

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
