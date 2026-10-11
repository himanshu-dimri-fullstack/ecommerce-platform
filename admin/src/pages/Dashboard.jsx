import React, { useEffect } from "react";
import { useState } from "react";
import {
    FiGrid,
    FiLayers,
    FiUsers,
    FiTag,
    FiShield,
    FiArrowUpRight,
} from "react-icons/fi";
import { API } from "../api/axios";
import DataLoader from "../components/DataLoader";

const Dashboard = () => {
    const [dataLoading, setDataLoading] = useState(true)
    const [value, setValue] = useState({
        category: null,
        subcategory: null,
        users: null,
        brands: null,
        roles: null,
    })
    const stats = [
        {
            title: "Total Categories",
            value: value.category,
            description: "Product categories",
            icon: FiGrid,
            color: "blue",
            bg: "bg-blue-50",
            iconColor: "text-blue-600",
            borderColor: "border-blue-100",
        },
        {
            title: "Total Subcategories",
            value: value.subcategory,
            description: "Organized subcategories",
            icon: FiLayers,
            color: "purple",
            bg: "bg-purple-50",
            iconColor: "text-purple-600",
            borderColor: "border-purple-100",
        },
        {
            title: "Total Users",
            value: value.users,
            description: "Registered users",
            icon: FiUsers,
            color: "emerald",
            bg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            borderColor: "border-emerald-100",
        },
        {
            title: "Total Brands",
            value: value.brands,
            description: "Available brands",
            icon: FiTag,
            color: "amber",
            bg: "bg-amber-50",
            iconColor: "text-amber-600",
            borderColor: "border-amber-100",
        },
        {
            title: "Total Roles",
            value: value.roles,
            description: "Access control roles",
            icon: FiShield,
            color: "rose",
            bg: "bg-rose-50",
            iconColor: "text-rose-600",
            borderColor: "border-rose-100",
        },
    ];

    useEffect(() => {
        const fetchAllValues = async () => {
            try {
                const res = await API.get("/admin/allModuleCounts")
                setValue({
                    ...value,
                    category: res.data.category,
                    subcategory: res.data.subcategory,
                    users: res.data.user,
                    roles: res.data.role,
                    brands: res.data.brand
                })
                setDataLoading(false)
            }
            catch (error) {
                console.log(error)
            }
        }
        fetchAllValues()
    }, [])

    if (dataLoading) {
        return <DataLoader />
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">


            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                {stats.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.title}
                            className={`group relative overflow-hidden rounded-2xl border ${item.borderColor} bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6`}
                        >
                            {/* Decorative Background */}
                            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-slate-50 transition-transform duration-300 group-hover:scale-125" />

                            <div className="relative">
                                <div className="mb-6 flex items-center justify-between">
                                    <div
                                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.bg} ${item.iconColor} transition-transform duration-300 group-hover:scale-110`}
                                    >
                                        <Icon size={23} strokeWidth={1.8} />
                                    </div>

                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-100 text-slate-400 transition-colors group-hover:border-slate-200 group-hover:text-slate-700">
                                        <FiArrowUpRight size={17} />
                                    </div>
                                </div>

                                <p className="text-sm font-medium text-slate-500">
                                    {item.title}
                                </p>

                                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                    {item.value}
                                </h2>

                                <p className="mt-3 text-xs font-medium text-slate-400 sm:text-sm">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Welcome Section */}
            <div className="mt-8 overflow-hidden rounded-2xl bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] p-6 text-white shadow-md sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-blue-200">
                            ADMIN CONTROL PANEL
                        </p>

                        <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                            Manage your platform with confidence
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                            Keep your categories, subcategories, users, brands,
                            and roles organized from one central dashboard.
                        </p>
                    </div>

                    <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 sm:flex">
                        <FiGrid size={38} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;