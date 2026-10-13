import { useEffect, useState } from "react";
import { Outlet, NavLink, Navigate, useLocation, replace, useNavigate } from "react-router-dom";

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
} from "react-icons/fi";

import { API } from "./api/axios";
import Loader from "./components/Loader";
import LogoutModal from "./components/LogoutModal";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser } from "./redux/AuthSlice.js";
import { setUser, setLoading } from "./redux/AuthSlice.js"

const AdminLayout = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    const user = useSelector((store) => store.auth.user)
    const loading = useSelector((store) => store.auth.loading)

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const menuItems = [
        { name: "Dashboard", path: "/admin/dashboard", icon: FiHome },
        { name: "Roles & Permissions", path: "/admin/roles", icon: FiShield },
        { name: "Users", path: "/admin/users", icon: FiUsers },
        { name: "Store", path: "/admin/store", icon: FiShoppingBag },
        { name: "Inventory", path: "/admin/inventory", icon: FiArchive },
        { name: "Brand", path: "/admin/brands", icon: FiAward },
        { name: "Categories", path: "/admin/categories", icon: FiGrid },
        { name: "Subcategories", path: "/admin/subcategories", icon: FiLayers },
        { name: "Products", path: "/admin/products", icon: FiPackage },
        { name: "Edit Profile", path: "/admin/settings", icon: FiSettings },
    ];

    const currentPage =
        menuItems.find(
            (item) =>
                location.pathname === item.path ||
                (item.path !== "/admin/dashboard" &&
                    location.pathname.startsWith(`${item.path}/`))
        )?.name || "Admin Dashboard";

    const handleLogout = async () => {
        try {
            setLoading(true)
            await API.post("/admin/logout");
            setShowLogoutModal(false);
            setUser(null);
            navigate("/", { replace: true })
        } catch (error) {
            console.error("Logout failed:", error);
        }
        finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        dispatch(fetchUser())
    }, [])

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
                <nav className="admin-sidebar-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-5">
                    <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100/60">
                        Main Navigation
                    </p>

                    <div className="space-y-1.5">
                        {menuItems.map((item) => {
                            const Icon = item.icon;

                            return (
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

                        <div className="flex items-center gap-2 border-l border-slate-200 pl-3 sm:gap-3 sm:pl-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                                <FiUser size={23} className="text-emerald-800" />
                            </div>

                            <div className="hidden min-w-0 sm:block">
                                <p className="max-w-36 truncate text-sm font-bold text-slate-800">
                                    {user?.name || "Admin"}
                                </p>
                                <p className="text-xs text-slate-500">
                                    Administrator
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
                        <p>Admin Management System</p>
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
