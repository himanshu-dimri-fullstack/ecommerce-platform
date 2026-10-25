"use client";

import { useState } from "react";
import { FiX, FiEye, FiEyeOff, FiUserPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import { API } from "@/axios/axios";

interface SignupModalProps {
    setIsSignupOpen: (value: boolean) => void
}

export default function SignupModal({
    setIsSignupOpen
}: SignupModalProps) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        // if (formData.password.length < 8) {
        //     toast.error("Password must be at least 8 characters long.");
        //     return;
        // }

        try {
            const res = await API.post("/user/signup", formData)
            toast.success(res.data.message)
            setIsSignupOpen(false)
        }
        catch (error: any) {
            toast.error(error.response.data.message)
        }
    };


    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-4 backdrop-blur-sm"
        >
            <div
                className="relative my-auto max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-2xl bg-white shadow-2xl"
            >
                {/* Header */}
                <div className="relative border-b border-gray-100 px-6 pb-5 pt-7 sm:px-8">
                    <button
                        type="button"
                        onClick={() => setIsSignupOpen(false)}
                        aria-label="Close signup modal"
                        className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                    >
                        <FiX size={21} />
                    </button>

                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0c831f]/10 text-[#0c831f]">
                        <FiUserPlus size={24} />
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                        Create your account
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Join QuickKart for a smarter shopping experience.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-6 sm:px-8">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* First Name */}
                        <div>
                            <label
                                htmlFor="firstName"
                                className="mb-2 block text-sm font-semibold text-gray-700"
                            >
                                First Name
                            </label>

                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                placeholder="Enter first name"
                                value={formData.firstName}
                                onChange={handleChange}
                                autoComplete="given-name"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0c831f] focus:bg-white focus:ring-4 focus:ring-[#0c831f]/10"
                            />
                        </div>

                        {/* Last Name */}
                        <div>
                            <label
                                htmlFor="lastName"
                                className="mb-2 block text-sm font-semibold text-gray-700"
                            >
                                Last Name
                            </label>

                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                placeholder="Enter last name"
                                value={formData.lastName}
                                onChange={handleChange}
                                autoComplete="family-name"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0c831f] focus:bg-white focus:ring-4 focus:ring-[#0c831f]/10"
                            />
                        </div>

                        {/* Email */}
                        <div className="sm:col-span-2">
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-semibold text-gray-700"
                            >
                                Email Address
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0c831f] focus:bg-white focus:ring-4 focus:ring-[#0c831f]/10"
                            />
                        </div>

                        {/* Password */}
                        <div className="sm:col-span-2">
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-semibold text-gray-700"
                            >
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    minLength={8}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0c831f] focus:bg-white focus:ring-4 focus:ring-[#0c831f]/10"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword((prev) => !prev)
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                                >
                                    {showPassword ? (
                                        <FiEyeOff size={19} />
                                    ) : (
                                        <FiEye size={19} />
                                    )}
                                </button>
                            </div>

                            <p className="mt-1.5 text-xs text-gray-400">
                                Use at least 8 characters.
                            </p>
                        </div>

                        {/* Confirm Password */}
                        <div className="sm:col-span-2">
                            <label
                                htmlFor="confirmPassword"
                                className="mb-2 block text-sm font-semibold text-gray-700"
                            >
                                Confirm Password
                            </label>

                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Re-enter your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0c831f] focus:bg-white focus:ring-4 focus:ring-[#0c831f]/10"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword((prev) => !prev)
                                    }
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide confirm password"
                                            : "Show confirm password"
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                                >
                                    {showConfirmPassword ? (
                                        <FiEyeOff size={19} />
                                    ) : (
                                        <FiEye size={19} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#0c831f] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0c831f]/15 transition hover:bg-[#096b19] active:scale-[0.99]"
                    >
                        Create Account
                    </button>

                    {/* Footer */}
                    <p className="mt-5 text-center text-xs leading-5 text-gray-500">
                        By creating an account, you agree to our{" "}
                        <span className="font-semibold text-[#0c831f]">
                            Terms of Service
                        </span>{" "}
                        and{" "}
                        <span className="font-semibold text-[#0c831f]">
                            Privacy Policy
                        </span>
                        .
                    </p>
                </form>
            </div>
        </div>
    );
}