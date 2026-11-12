
"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { API } from "@/axios/axios";
import toast from "react-hot-toast";
import { fetchUser } from "@/redux/authSlice";
import Link from "next/link";

import {
    FiEye,
    FiEyeOff,
    FiUpload,
    FiUser,
    FiEdit2,
    FiMail,
    FiPhone,
    FiMapPin,
    FiPlus,
    FiTrash2,
    FiHome,
    FiBriefcase,
    FiShield,
    FiPackage,
    FiClock,
    FiX,
    FiSave,
} from "react-icons/fi";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";
import { useRouter } from "next/navigation";

export interface User {
    _id: string;
    firstName: string;
    lastName?: string;
    email: string;
    profileImage?: {
        url: string;
        public_id: string;
    };
    phone?: string;
}

interface Address {
    _id: string;
    type: "home" | "work" | "other";
    name: string;
    phone: string;
    houseNumber: string;
    street: string;
    landmark: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    location: {
        type: "Point";
        coordinates: number[];
    };
    isDefault: boolean;
}

interface AddressForm {
    type: "home" | "work" | "other";
    houseNumber: string;
    street: string;
    landmark: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    isDefault: boolean;
}

const initialAddressForm: AddressForm = {
    type: "home",
    houseNumber: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    isDefault: false,
};

export default function ProfilePage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const { user, loading: authLoading } = useSelector(
        (store: RootState) => store.auth
    );

    const [formData, setFormData] = useState<User | null>(null);

    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [profileFile, setProfileFile] = useState<File | null>(null);

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [addressForm, setAddressForm] =
        useState<AddressForm>(initialAddressForm);

    const [isEditing, setIsEditing] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

    const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [addressLoading, setAddressLoading] = useState(false);
    const [savingAddress, setSavingAddress] = useState(false);
    const [deletingAddress, setDeletingAddress] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [changingPassword, setChangingPassword] = useState(false);

    // CHANGE PASSWORD
    const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!currentPassword.trim() || !newPassword.trim()) {
            toast.error("Please fill all fields");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters");
            return;
        }

        if (currentPassword === newPassword) {
            toast.error("New password must be different from current password");
            return;
        }

        try {
            setChangingPassword(true);

            const { data } = await API.post("/user/change-password", {
                currentPassword,
                newPassword,
            });

            toast.success(data.message || "Password changed successfully");

            closePasswordModal();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Failed to change password"
            );
        } finally {
            setChangingPassword(false);
        }
    };

    // FETCH PROFILE AND ADDRESSES
    useEffect(() => {
        fetchAddresses().finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!authLoading && user === null) {
            router.replace("/");
        }
    }, [authLoading, user, router]);

    // GET ADDRESSES
    const fetchAddresses = async () => {
        try {
            setAddressLoading(true);

            const { data } = await API.get("/address/get");

            setAddresses(data.addresses || data.data?.addresses || []);
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Failed to fetch addresses"
            );
        } finally {
            setAddressLoading(false);
        }
    };

    // PROFILE FORM
    const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!formData) return;

        const { name, value } = e.target;

        setFormData((prev) => {
            if (!prev) return prev;

            return {
                ...prev,
                [name]: value,
            };
        });
    };

    // PROFILE IMAGE CHANGE
    const handleProfileImageChange = (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image");
            e.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image size should be less than 2MB");
            e.target.value = "";
            return;
        }

        setProfileFile(file);
        setProfilePreview(URL.createObjectURL(file));
    };

    // REMOVE PROFILE IMAGE
    const handleRemoveProfileImage = () => {
        setProfileFile(null);
        setProfilePreview(null);
    };

    // SAVE PROFILE
    const handleSaveProfile = async () => {
        if (!formData) return;

        const payload = new FormData();

        payload.append("firstName", formData.firstName ?? "");
        payload.append("lastName", formData.lastName ?? "");
        payload.append("phone", formData.phone ?? "");

        if (profileFile) {
            payload.append("profileImage", profileFile);
        }

        try {
            setSavingProfile(true);

            const res = await API.post(
                "/user/update-profile",
                payload
            );

            toast.success(res.data.message || "Profile updated successfully");

            setIsEditing(false);
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Failed to update profile"
            );
        } finally {
            dispatch(fetchUser());
            setSavingProfile(false);
        }
    };

    // ADDRESS FORM
    const handleAddressChange = (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value, type, checked } = e.target;

        setAddressForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // OPEN ADD ADDRESS MODAL
    const openAddAddressModal = () => {
        setEditingAddressId(null);
        setAddressForm({ ...initialAddressForm });
        setIsAddressModalOpen(true);
    };

    // OPEN EDIT ADDRESS MODAL
    const handleEditAddress = (address: Address) => {
        setEditingAddressId(address._id);

        setAddressForm({
            type: address.type || "home",
            houseNumber: address.houseNumber ?? "",
            street: address.street ?? "",
            landmark: address.landmark ?? "",
            city: address.city ?? "",
            state: address.state ?? "",
            country: address.country ?? "India",
            pincode: address.pincode ?? "",
            isDefault: Boolean(address.isDefault),
        });

        setIsAddressModalOpen(true);
    };

    // ADD / UPDATE ADDRESS
    const handleSaveAddress = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const houseNumber = addressForm.houseNumber.trim();
        const street = addressForm.street.trim();
        const landmark = addressForm.landmark.trim();
        const city = addressForm.city.trim();
        const state = addressForm.state.trim();
        const country = addressForm.country.trim();
        const pincode = addressForm.pincode.trim();

        if (
            !houseNumber ||
            !street ||
            !city ||
            !state ||
            !country ||
            !pincode
        ) {
            toast.error("Please fill all required address fields");
            return;
        }

        if (!/^\d{6}$/.test(pincode)) {
            toast.error("Please enter a valid 6-digit pincode");
            return;
        }

        // Coordinates are generated automatically by the backend using Photon.
        // Frontend only sends the actual address details.
        const payload = {
            type: addressForm.type,
            houseNumber,
            street,
            landmark,
            city,
            state,
            country,
            pincode,
            isDefault: addressForm.isDefault,
        };

        try {
            setSavingAddress(true);

            if (editingAddressId) {
                await API.patch(
                    `/address/update/${editingAddressId}`,
                    payload
                );

                toast.success("Address updated successfully");
            } else {
                await API.post("/address/add", payload);

                toast.success("Address added successfully");
            }

            setIsAddressModalOpen(false);
            setAddressForm({ ...initialAddressForm });
            setEditingAddressId(null);

            await fetchAddresses();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Something went wrong"
            );
        } finally {
            setSavingAddress(false);
        }
    };

    // DELETE ADDRESS
    const handleDeleteAddress = async () => {
        if (!deleteAddressId) return;

        try {
            setDeletingAddress(true);

            await API.delete(`/address/delete/${deleteAddressId}`);

            toast.success("Address deleted successfully");

            setDeleteAddressId(null);

            await fetchAddresses();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Failed to delete address"
            );
        } finally {
            setDeletingAddress(false);
        }
    };

    // CLOSE ADDRESS MODAL
    const closeAddressModal = () => {
        setIsAddressModalOpen(false);
        setAddressForm({ ...initialAddressForm });
        setEditingAddressId(null);
    };

    // CLOSE PASSWORD MODAL
    const closePasswordModal = () => {
        if (changingPassword) return;

        setIsPasswordModalOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setShowCurrentPassword(false);
        setShowNewPassword(false);
    };

    // ADDRESS ICON
    const getAddressIcon = (type: string) => {
        if (type === "home") return <FiHome size={18} />;
        if (type === "work") return <FiBriefcase size={18} />;
        return <FiMapPin size={18} />;
    };

    // LOADING SKELETON
    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-[#e9f7ef] via-white to-[#f7fcf8] py-10 animate-pulse">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="mb-8 space-y-3">
                        <div className="h-9 w-56 bg-gray-200 rounded-lg" />
                        <div className="h-4 w-80 max-w-full bg-gray-200 rounded-md" />
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
                        <div className="h-2 bg-gray-200" />

                        <div className="p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-20 h-20 rounded-2xl bg-gray-200 shrink-0" />

                                    <div className="space-y-3">
                                        <div className="h-6 w-48 bg-gray-200 rounded-md" />
                                        <div className="h-4 w-56 max-w-full bg-gray-200 rounded-md" />
                                    </div>
                                </div>

                                <div className="h-12 w-36 bg-gray-200 rounded-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                                <div className="flex items-center justify-between mb-7">
                                    <div className="space-y-3">
                                        <div className="h-6 w-52 bg-gray-200 rounded-md" />
                                        <div className="h-4 w-64 max-w-full bg-gray-200 rounded-md" />
                                    </div>

                                    <div className="w-11 h-11 bg-gray-200 rounded-xl" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    {[1, 2, 3, 4].map((item) => (
                                        <div key={item} className="space-y-3">
                                            <div className="h-4 w-24 bg-gray-200 rounded-md" />
                                            <div className="h-5 w-40 bg-gray-200 rounded-md" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
                                    <div className="space-y-3">
                                        <div className="h-6 w-44 bg-gray-200 rounded-md" />
                                        <div className="h-4 w-60 max-w-full bg-gray-200 rounded-md" />
                                    </div>

                                    <div className="h-12 w-48 bg-gray-200 rounded-xl" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {[1, 2].map((item) => (
                                        <div
                                            key={item}
                                            className="border border-gray-200 rounded-xl p-5 space-y-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-gray-200 rounded-lg" />
                                                    <div className="h-4 w-20 bg-gray-200 rounded-md" />
                                                </div>

                                                <div className="flex gap-2">
                                                    <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                                                    <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                                                </div>
                                            </div>

                                            <div className="h-5 w-36 bg-gray-200 rounded-md" />

                                            <div className="space-y-2">
                                                <div className="h-3 w-full bg-gray-200 rounded-md" />
                                                <div className="h-3 w-4/5 bg-gray-200 rounded-md" />
                                                <div className="h-3 w-3/5 bg-gray-200 rounded-md" />
                                            </div>

                                            <div className="pt-4 border-t border-gray-100">
                                                <div className="h-4 w-28 bg-gray-200 rounded-md" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <div className="h-6 w-36 bg-gray-200 rounded-md mb-6" />

                                <div className="space-y-6">
                                    <div className="flex justify-between">
                                        <div className="h-4 w-20 bg-gray-200 rounded-md" />
                                        <div className="h-4 w-20 bg-gray-200 rounded-md" />
                                    </div>

                                    <div className="flex justify-between">
                                        <div className="h-4 w-24 bg-gray-200 rounded-md" />
                                        <div className="h-4 w-20 bg-gray-200 rounded-md" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <div className="h-6 w-32 bg-gray-200 rounded-md mb-6" />

                                <div className="space-y-4">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="flex items-center gap-3 p-3">
                                            <div className="w-5 h-5 bg-gray-200 rounded-md" />
                                            <div className="h-4 w-32 bg-gray-200 rounded-md" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gray-200 rounded-2xl p-6 space-y-4">
                                <div className="w-11 h-11 bg-gray-300 rounded-xl" />
                                <div className="h-6 w-44 bg-gray-300 rounded-md" />
                                <div className="h-4 w-full bg-gray-300 rounded-md" />
                                <div className="h-4 w-4/5 bg-gray-300 rounded-md" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-[#e9f7ef] via-white to-[#f7fcf8] py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* PAGE HEADING */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        My Account
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Manage your personal information and saved addresses.
                    </p>
                </div>

                {/* PROFILE HEADER */}
                <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm mb-8">
                    <div className="h-2 bg-linear-to-r from-[#1c9d36] via-[#39b54a] to-[#a5e6ad]" />

                    <div className="p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">

                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 rounded-2xl bg-[#e9f7ef] flex items-center justify-center text-[#1c9d36] shrink-0">
                                    {user.profileImage?.url ? (
                                        <img
                                            src={user.profileImage.url}
                                            alt="Profile"
                                            className="w-full h-full object-cover rounded-2xl"
                                        />
                                    ) : (
                                        <FiUser size={36} />
                                    )}
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {user.firstName} {user.lastName}
                                    </h2>

                                    <p className="text-gray-500 mt-1">
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setFormData({
                                        _id: user._id ?? "",
                                        firstName: user.firstName ?? "",
                                        lastName: user.lastName ?? "",
                                        email: user.email ?? "",
                                        phone: user.phone ?? "",
                                        profileImage: user.profileImage,
                                    });

                                    setProfilePreview(user.profileImage?.url ?? null);
                                    setProfileFile(null);
                                    setIsEditing(true);
                                }}
                                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1c9d36] hover:bg-[#16832c] text-white font-semibold transition-colors"
                            >
                                <FiEdit2 size={16} />
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                {/* MAIN GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT SECTION */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* PERSONAL INFORMATION */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                            <div className="flex items-center justify-between mb-7">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Personal Information
                                    </h3>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Your personal account details.
                                    </p>
                                </div>

                                <div className="w-11 h-11 rounded-xl bg-green-50 text-[#1c9d36] flex items-center justify-center">
                                    <FiUser size={20} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-400 mb-2">
                                        First Name
                                    </p>

                                    <div className="flex items-center gap-3 text-gray-800 font-medium">
                                        <FiUser className="text-[#1c9d36]" />
                                        {user.firstName ?? ""}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-400 mb-2">
                                        Last Name
                                    </p>

                                    <div className="flex items-center gap-3 text-gray-800 font-medium">
                                        <FiUser className="text-[#1c9d36]" />
                                        {user.lastName ?? ""}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-400 mb-2">
                                        Email Address
                                    </p>

                                    <div className="flex items-center gap-3 text-gray-800 font-medium break-all">
                                        <FiMail className="text-[#1c9d36] shrink-0" />
                                        {user.email ?? ""}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-400 mb-2">
                                        Phone Number
                                    </p>

                                    <div className="flex items-center gap-3 text-gray-800 font-medium">
                                        <FiPhone className="text-[#1c9d36]" />
                                        {user.phone ?? ""}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SAVED ADDRESSES */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Saved Addresses
                                    </h3>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Manage your delivery addresses.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={openAddAddressModal}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1c9d36] hover:bg-[#16832c] text-white font-semibold transition-colors"
                                >
                                    <FiPlus size={17} />
                                    Add New Address
                                </button>
                            </div>

                            {addressLoading ? (
                                <div className="py-12 flex justify-center">
                                    <div className="w-8 h-8 border-4 border-green-200 border-t-[#1c9d36] rounded-full animate-spin" />
                                </div>
                            ) : addresses.length === 0 ? (
                                <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-xl">
                                    <div className="w-14 h-14 mx-auto rounded-full bg-green-50 text-[#1c9d36] flex items-center justify-center mb-4">
                                        <FiMapPin size={25} />
                                    </div>

                                    <h4 className="text-gray-800 font-semibold">
                                        No saved addresses
                                    </h4>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Add an address for faster checkout.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {addresses.map((address) => (
                                        <div
                                            key={address._id}
                                            className="border border-gray-200 rounded-xl p-5 hover:border-green-300 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-4">

                                                <div className="flex items-center gap-2">
                                                    <div className="w-9 h-9 rounded-lg bg-green-50 text-[#1c9d36] flex items-center justify-center">
                                                        {getAddressIcon(address.type)}
                                                    </div>

                                                    <span className="font-semibold text-gray-800 capitalize">
                                                        {address.type}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {address.isDefault && (
                                                        <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                                                            Default
                                                        </span>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditAddress(address)}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1c9d36] hover:bg-green-50 transition-colors"
                                                        aria-label="Edit address"
                                                    >
                                                        <FiEdit2 size={16} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteAddressId(address._id)}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                        aria-label="Delete address"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <h4 className="font-semibold text-gray-900">
                                                {address.name ?? ""}
                                            </h4>

                                            <p className="text-sm text-gray-500 mt-2 leading-6">
                                                {address.houseNumber ?? ""}, {address.street ?? ""}
                                                {address.landmark && `, ${address.landmark}`}
                                                , {address.city ?? ""}, {address.state ?? ""}
                                                , {address.country ?? ""} - {address.pincode ?? ""}
                                            </p>

                                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">
                                                <FiPhone className="text-[#1c9d36]" size={14} />
                                                {address.phone ?? ""}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className="space-y-8">

                        {/* ACCOUNT STATUS */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-5">
                                Account Status
                            </h3>

                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                <span className="text-sm text-gray-500">
                                    Account
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm text-gray-500">
                                    Membership
                                </span>

                                <span className="text-sm font-semibold text-gray-800">
                                    Customer
                                </span>
                            </div>
                        </div>

                        {/* QUICK LINKS */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-5">
                                Quick Links
                            </h3>

                            <div className="space-y-2">
                                <Link
                                    href="/orders"
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 text-gray-700 hover:text-[#1c9d36] transition-colors"
                                >
                                    <FiPackage size={19} />
                                    <span className="font-medium text-sm">
                                        My Orders
                                    </span>
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 text-gray-700 hover:text-[#1c9d36] transition-colors text-left"
                                >
                                    <FiShield size={19} />
                                    <span className="font-medium text-sm">
                                        Change Password
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* MEMBER SINCE */}
                        <div className="bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] rounded-2xl p-6 text-white">
                            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center mb-4">
                                <FiClock size={21} />
                            </div>

                            <h3 className="text-lg font-bold">
                                Your Journey With Us
                            </h3>

                            <p className="text-sm text-green-100 mt-2">
                                Thank you for being a part of our shopping community.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* EDIT PROFILE MODAL */}
            {isEditing && formData && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-2xl shadow-xl overflow-hidden flex flex-col">

                        <div className="shrink-0 flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    Edit Profile
                                </h3>

                                <p className="text-sm text-gray-500 mt-1">
                                    Update your personal information.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                            >
                                <FiX size={19} />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSaveProfile();
                            }}
                            className="p-6 space-y-5 overflow-y-auto flex-1 min-h-0"
                        >
                            {/* PROFILE PICTURE */}
                            <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-gray-100">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full overflow-hidden bg-green-50 border-2 border-green-100 flex items-center justify-center">
                                        {profilePreview ? (
                                            <img
                                                src={profilePreview}
                                                alt="Profile Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <FiUser size={38} className="text-[#1c9d36]" />
                                        )}
                                    </div>

                                    {profilePreview && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveProfileImage}
                                            className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md"
                                        >
                                            <FiX size={14} />
                                        </button>
                                    )}
                                </div>

                                <div className="text-center sm:text-left">
                                    <h3 className="text-sm font-semibold text-gray-800">
                                        Profile Picture
                                    </h3>

                                    <p className="text-xs text-gray-500 mt-1 mb-3">
                                        Upload your profile photo (JPG, PNG). Max 2MB.
                                    </p>

                                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition">
                                        <FiUpload size={15} />
                                        Choose Photo

                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleProfileImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* FIRST NAME & LAST NAME */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name*
                                    </label>

                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName ?? ""}
                                        onChange={handleProfileChange}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#1c9d36] focus:ring-2 focus:ring-green-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name
                                    </label>

                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName ?? ""}
                                        onChange={handleProfileChange}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#1c9d36] focus:ring-2 focus:ring-green-100"
                                    />
                                </div>
                            </div>

                            {/* EMAIL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    value={formData.email ?? ""}
                                    disabled
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-400 cursor-not-allowed"
                                />
                            </div>

                            {/* PHONE */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number*
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone ?? ""}
                                    onChange={handleProfileChange}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#1c9d36] focus:ring-2 focus:ring-green-100"
                                />
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex justify-end gap-3 pt-3 pb-1">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    disabled={savingProfile}
                                    className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-60"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1c9d36] hover:bg-[#16832c] text-white font-semibold disabled:opacity-60"
                                >
                                    <FiSave size={16} />
                                    {savingProfile ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD / EDIT ADDRESS MODAL */}
            {isAddressModalOpen && (
                <div className="fixed inset-0 z-200 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">

                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {editingAddressId ? "Edit Address" : "Add New Address"}
                                </h3>

                                <p className="text-sm text-gray-500 mt-1">
                                    Enter your delivery address details.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeAddressModal}
                                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                            >
                                <FiX size={19} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveAddress} className="p-6 space-y-5">

                            {/* ADDRESS TYPE */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Address Type
                                </label>

                                <div className="grid grid-cols-3 gap-3">
                                    {(["home", "work", "other"] as const).map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() =>
                                                setAddressForm((prev) => ({
                                                    ...prev,
                                                    type,
                                                }))
                                            }
                                            className={`flex items-center justify-center gap-2 border rounded-xl py-3 capitalize font-medium transition-colors ${addressForm.type === type
                                                ? "border-[#1c9d36] bg-green-50 text-[#1c9d36]"
                                                : "border-gray-200 text-gray-600 hover:border-green-300"
                                                }`}
                                        >
                                            {getAddressIcon(type)}
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* HOUSE AND STREET */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        House Number *
                                    </label>

                                    <input
                                        type="text"
                                        name="houseNumber"
                                        value={addressForm.houseNumber}
                                        onChange={handleAddressChange}
                                        placeholder="House / Flat number"
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#1c9d36]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Street *
                                    </label>

                                    <input
                                        type="text"
                                        name="street"
                                        value={addressForm.street}
                                        onChange={handleAddressChange}
                                        placeholder="Street / Area"
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#1c9d36]"
                                    />
                                </div>
                            </div>

                            {/* LANDMARK */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Landmark
                                </label>

                                <input
                                    type="text"
                                    name="landmark"
                                    value={addressForm.landmark}
                                    onChange={handleAddressChange}
                                    placeholder="Nearby landmark (optional)"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#1c9d36]"
                                />
                            </div>

                            {/* CITY AND STATE */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City *
                                    </label>

                                    <input
                                        type="text"
                                        name="city"
                                        value={addressForm.city}
                                        onChange={handleAddressChange}
                                        placeholder="City"
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#1c9d36]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        State *
                                    </label>

                                    <input
                                        type="text"
                                        name="state"
                                        value={addressForm.state}
                                        onChange={handleAddressChange}
                                        placeholder="State"
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#1c9d36]"
                                    />
                                </div>
                            </div>

                            {/* COUNTRY AND PINCODE */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Country *
                                    </label>

                                    <input
                                        type="text"
                                        name="country"
                                        value={addressForm.country}
                                        onChange={handleAddressChange}
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#1c9d36]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pincode *
                                    </label>

                                    <input
                                        type="text"
                                        name="pincode"
                                        value={addressForm.pincode}
                                        onChange={handleAddressChange}
                                        placeholder="6-digit pincode"
                                        maxLength={6}
                                        inputMode="numeric"
                                        pattern="[0-9]{6}"
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#1c9d36]"
                                    />
                                </div>
                            </div>

                            {/* AUTOMATIC LOCATION DETECTION */}
                            <div className="flex items-start gap-3 p-4 rounded-xl border border-green-100 bg-green-50">
                                <div className="w-10 h-10 shrink-0 rounded-lg bg-white text-[#1c9d36] flex items-center justify-center">
                                    <FiMapPin size={20} />
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-gray-800">
                                        Automatic Location Detection
                                    </h4>

                                    <p className="text-xs text-gray-600 mt-1 leading-5">
                                        Your location coordinates will be detected automatically
                                        from the address you provide. You do not need to enter
                                        longitude or latitude.
                                    </p>
                                </div>
                            </div>

                            {/* DEFAULT ADDRESS */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isDefault"
                                    checked={Boolean(addressForm.isDefault)}
                                    onChange={handleAddressChange}
                                    className="w-4 h-4 accent-[#1c9d36]"
                                />

                                <span className="text-sm font-medium text-gray-700">
                                    Set as default address
                                </span>
                            </label>

                            {/* ACTIONS */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={closeAddressModal}
                                    disabled={savingAddress}
                                    className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-60"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={savingAddress}
                                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1c9d36] hover:bg-[#16832c] text-white font-semibold disabled:opacity-60"
                                >
                                    {savingAddress ? (
                                        "Saving..."
                                    ) : (
                                        <>
                                            <FiSave size={16} />
                                            {editingAddressId ? "Update Address" : "Save Address"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CHANGE PASSWORD MODAL */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-70 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">

                        {/* HEADER */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    Change Password
                                </h3>

                                <p className="text-sm text-gray-500 mt-1">
                                    Update your account password.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closePasswordModal}
                                disabled={changingPassword}
                                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-60"
                            >
                                <FiX size={19} />
                            </button>
                        </div>

                        {/* FORM */}
                        <form
                            onSubmit={handleChangePassword}
                            className="p-6 space-y-5"
                        >
                            {/* CURRENT PASSWORD */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Password
                                </label>

                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        disabled={changingPassword}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 outline-none focus:border-[#1c9d36] focus:ring-2 focus:ring-green-100"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(prev => !prev)}
                                        disabled={changingPassword}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                    >
                                        {showCurrentPassword ? (
                                            <FiEyeOff size={19} />
                                        ) : (
                                            <FiEye size={19} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* NEW PASSWORD */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>

                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        minLength={8}
                                        disabled={changingPassword}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 outline-none focus:border-[#1c9d36] focus:ring-2 focus:ring-green-100"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(prev => !prev)}
                                        disabled={changingPassword}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                    >
                                        {showNewPassword ? (
                                            <FiEyeOff size={19} />
                                        ) : (
                                            <FiEye size={19} />
                                        )}
                                    </button>
                                </div>

                                <p className="text-xs text-gray-400 mt-2">
                                    Password must be at least 8 characters.
                                </p>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={closePasswordModal}
                                    disabled={changingPassword}
                                    className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-60"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={changingPassword}
                                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1c9d36] hover:bg-[#16832c] text-white font-semibold transition-colors disabled:opacity-60"
                                >
                                    <FiSave size={16} />
                                    {changingPassword ? "Updating..." : "Update Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {deleteAddressId && (
                <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">

                        <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-5">
                            <FiTrash2 size={25} />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900">
                            Delete Address?
                        </h3>

                        <p className="text-sm text-gray-500 mt-2 leading-6">
                            Are you sure you want to delete this address? This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-3 mt-7">
                            <button
                                type="button"
                                onClick={() => setDeleteAddressId(null)}
                                disabled={deletingAddress}
                                className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDeleteAddress}
                                disabled={deletingAddress}
                                className="px-5 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-60"
                            >
                                {deletingAddress ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
