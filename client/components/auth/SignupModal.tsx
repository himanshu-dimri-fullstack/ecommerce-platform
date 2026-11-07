
"use client";

import { useState, useEffect } from "react";
import {
    FiX,
    FiEye,
    FiEyeOff,
    FiUserPlus,
    FiMail,
    FiCheckCircle,
    FiLoader,
    FiRefreshCw,
    FiClock,
    FiPhone,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { API } from "@/axios/axios";

interface SignupModalProps {
    setIsSignupOpen: (value: boolean) => void;
}

export default function SignupModal({
    setIsSignupOpen,
}: SignupModalProps) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [otp, setOtp] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isSendingOTP, setIsSendingOTP] = useState(false);
    const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isOTPSent, setIsOTPSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    // OTP Timer
    const [timeLeft, setTimeLeft] = useState(0);
    const [isOTPExpired, setIsOTPExpired] = useState(false);

    // Email validation
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
    );

    // Phone validation (10 digit Indian mobile number)
    const isValidPhone = /^[6-9]\d{9}$/.test(formData.phone);

    // Format timer
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    // Handle form changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "phone") {
            setFormData((prev) => ({
                ...prev,
                phone: value.replace(/\D/g, "").slice(0, 10),
            }));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Reset verification if email changes
    useEffect(() => {
        setIsOTPSent(false);
        setIsEmailVerified(false);
        setOtp("");
        setTimeLeft(0);
        setIsOTPExpired(false);
    }, [formData.email]);

    // OTP countdown
    useEffect(() => {
        if (!isOTPSent || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsOTPExpired(true);
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOTPSent, timeLeft > 0]);

    // Send / Resend OTP
    const handleVerifyEmail = async () => {
        if (!isValidEmail) {
            toast.error("Please enter a valid email address.");
            return;
        }

        try {
            setIsSendingOTP(true);

            const res = await API.post("/user/verify-email", {
                email: formData.email.trim().toLowerCase(),
                type: "signup",
            });

            toast.success(res.data.message || "OTP sent successfully.");

            setIsOTPSent(true);
            setTimeLeft(60);
            setIsOTPExpired(false);
            setOtp("");

        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                "Unable to send verification OTP."
            );
        } finally {
            setIsSendingOTP(false);
        }
    };

    // Verify OTP
    const handleVerifyOTP = async () => {
        if (!otp.trim()) {
            toast.error("Please enter OTP.");
            return;
        }

        if (isOTPExpired || timeLeft <= 0) {
            toast.error("OTP has expired. Please request a new OTP.");
            return;
        }

        try {
            setIsVerifyingOTP(true);

            const res = await API.post("/user/verify-otp", {
                email: formData.email.trim().toLowerCase(),
                otp: otp.trim(),
                type: "signup",
            });

            toast.success(res.data.message || "Email verified successfully.");

            setIsEmailVerified(true);
            setIsOTPSent(false);
            setTimeLeft(0);
            setIsOTPExpired(false);
            setOtp("");

        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                "Invalid or expired OTP."
            );
        } finally {
            setIsVerifyingOTP(false);
        }
    };

    // Signup
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isEmailVerified) {
            toast.error("Please verify your email first.");
            return;
        }

        if (!isValidPhone) {
            toast.error("Please enter a valid 10-digit mobile number.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        if (formData.password.length < 8) {
            toast.error("Password must be at least 8 characters long.");
            return;
        }

        try {
            setIsSubmitting(true);

            const res = await API.post("/user/signup", {
                ...formData,
                email: formData.email.trim().toLowerCase(),
            });

            toast.success(res.data.message || "Account created successfully.");

            setIsSignupOpen(false);

        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                "Unable to create your account."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-4 backdrop-blur-sm">

            <div className="relative my-auto max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-2xl bg-white shadow-2xl">

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
                            <label htmlFor="firstName" className="mb-2 block text-sm font-semibold text-gray-700">
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
                            <label htmlFor="lastName" className="mb-2 block text-sm font-semibold text-gray-700">
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

                            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">
                                Email Address
                            </label>

                            <div className="relative">

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    disabled={isEmailVerified || isOTPSent || isSendingOTP || isVerifyingOTP}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0c831f] focus:bg-white focus:ring-4 focus:ring-[#0c831f]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                                />

                                <FiMail
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={19}
                                />

                            </div>

                            {/* Verify Email Button */}
                            {isValidEmail && !isOTPSent && !isEmailVerified && (

                                <button
                                    type="button"
                                    onClick={handleVerifyEmail}
                                    disabled={isSendingOTP}
                                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#0c831f] bg-white px-4 py-3 text-sm font-bold text-[#0c831f] transition hover:bg-[#0c831f]/5 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSendingOTP ? (
                                        <>
                                            <FiLoader className="animate-spin" />
                                            Sending OTP...
                                        </>
                                    ) : (
                                        <>
                                            <FiMail size={18} />
                                            Verify Email
                                        </>
                                    )}
                                </button>
                            )}

                            {/* OTP Section */}
                            {isOTPSent && !isEmailVerified && (

                                <div className="mt-4 rounded-xl border border-[#0c831f]/20 bg-[#0c831f]/5 p-4">

                                    <div className="mb-3">

                                        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                            <FiCheckCircle className="text-[#0c831f]" size={18} />
                                            Email Verification
                                        </h3>

                                        <p className="mt-1 text-xs leading-5 text-gray-500">
                                            We've sent a verification OTP to your email address.
                                        </p>

                                    </div>

                                    {/* OTP Input */}
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="Enter verification OTP"
                                        value={otp}
                                        onChange={(e) =>
                                            setOtp(e.target.value.replace(/\D/g, ""))
                                        }
                                        maxLength={4}
                                        autoComplete="one-time-code"
                                        disabled={isOTPExpired}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-lg font-bold tracking-[0.4em] text-gray-900 outline-none transition placeholder:text-sm placeholder:font-normal placeholder:tracking-normal focus:border-[#0c831f] focus:ring-4 focus:ring-[#0c831f]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                                    />

                                    {/* Timer */}
                                    <div className="mt-3 flex items-center justify-between">

                                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <FiClock size={14} />

                                            {isOTPExpired
                                                ? "OTP has expired"
                                                : "OTP expires in"}
                                        </span>

                                        <span className={`text-sm font-bold tabular-nums ${isOTPExpired
                                            ? "text-red-600"
                                            : "text-[#0c831f]"
                                            }`}>
                                            {formattedTime}
                                        </span>

                                    </div>

                                    {/* Verify OTP */}
                                    {!isOTPExpired && (

                                        <button
                                            type="button"
                                            onClick={handleVerifyOTP}
                                            disabled={isVerifyingOTP || otp.length !== 4 || timeLeft <= 0}
                                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0c831f] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#096b19] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isVerifyingOTP ? (
                                                <>
                                                    <FiLoader className="animate-spin" />
                                                    Verifying OTP...
                                                </>
                                            ) : (
                                                <>
                                                    <FiCheckCircle size={18} />
                                                    Verify OTP
                                                </>
                                            )}
                                        </button>

                                    )}

                                    {/* Resend OTP */}
                                    {isOTPExpired && (

                                        <button
                                            type="button"
                                            onClick={handleVerifyEmail}
                                            disabled={isSendingOTP}
                                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#0c831f] bg-white px-4 py-3 text-sm font-bold text-[#0c831f] transition hover:bg-[#0c831f]/5 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isSendingOTP ? (
                                                <>
                                                    <FiLoader className="animate-spin" />
                                                    Resending OTP...
                                                </>
                                            ) : (
                                                <>
                                                    <FiRefreshCw size={17} />
                                                    Resend OTP
                                                </>
                                            )}
                                        </button>

                                    )}

                                </div>
                            )}

                            {/* Verified Status */}
                            {isEmailVerified && (

                                <div className="mt-3 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3">

                                    <FiCheckCircle className="shrink-0 text-green-600" size={19} />

                                    <span className="text-sm font-semibold text-green-700">
                                        Email verified successfully!
                                    </span>

                                </div>
                            )}

                        </div>

                        {/* Phone Number */}
                        <div className="sm:col-span-2">

                            <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-gray-700">
                                Phone Number
                            </label>

                            <div className="relative">

                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="Enter 10-digit mobile number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    autoComplete="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0c831f] focus:bg-white focus:ring-4 focus:ring-[#0c831f]/10"
                                />

                                <FiPhone
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={19}
                                />

                            </div>

                            {formData.phone.length > 0 && !isValidPhone && (
                                <p className="mt-1.5 text-xs text-red-500">
                                    Enter a valid 10-digit Indian mobile number.
                                </p>
                            )}

                        </div>

                        {/* Password */}
                        <div className="sm:col-span-2">

                            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-700">
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
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                                >
                                    {showPassword ? <FiEyeOff size={19} /> : <FiEye size={19} />}
                                </button>

                            </div>

                            <p className="mt-1.5 text-xs text-gray-400">
                                Use at least 8 characters.
                            </p>

                        </div>

                        {/* Confirm Password */}
                        <div className="sm:col-span-2">

                            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-gray-700">
                                Confirm Password
                            </label>

                            <div className="relative">

                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Re-enter your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0c831f] focus:bg-white focus:ring-4 focus:ring-[#0c831f]/10"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                                >
                                    {showConfirmPassword ? <FiEyeOff size={19} /> : <FiEye size={19} />}
                                </button>

                            </div>

                        </div>

                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={!isEmailVerified || !isValidPhone || isSubmitting}
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0c831f] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0c831f]/15 transition hover:bg-[#096b19] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                    >
                        {isSubmitting ? (
                            <>
                                <FiLoader className="animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            <>
                                <FiUserPlus size={18} />
                                Create Account
                            </>
                        )}
                    </button>

                    {!isEmailVerified && (
                        <p className="mt-2 text-center text-xs text-gray-400">
                            Verify your email to create your account.
                        </p>
                    )}

                    {/* Footer */}
                    <p className="mt-5 text-center text-xs leading-5 text-gray-500">
                        By creating an account, you agree to our{" "}
                        <span className="font-semibold text-[#0c831f]">
                            Terms of Service
                        </span>{" "}
                        and{" "}
                        <span className="font-semibold text-[#0c831f]">
                            Privacy Policy
                        </span>.
                    </p>

                </form>
            </div>
        </div>
    );
}
