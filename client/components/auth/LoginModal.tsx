
"use client";

import { API } from "@/axios/axios";
import { useEffect, useState } from "react";
import {
    FiX,
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff,
    FiZap,
    FiArrowRight,
    FiArrowLeft,
    FiCheckCircle,
    FiShield,
    FiRefreshCw,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";
import { setUser } from "@/redux/authSlice";
import { clearCart, fetchCart } from "@/redux/cartSlice";
import toast from "react-hot-toast";

interface LoginModalProps {
    setLoginOpen: (value: boolean) => void;
    setIsSignupOpen: (value: boolean) => void;
}

type ForgotStep = "email" | "otp" | "password" | "success";

export default function LoginModal({
    setLoginOpen,
    setIsSignupOpen,
}: LoginModalProps) {
    const cart = useSelector((state: RootState) => state.cart.items);

    const { store: nearestStore } = useSelector(
        (state: RootState) => state.store
    );

    const storeId = nearestStore?._id;

    const dispatch = useDispatch<AppDispatch>();

    // Login states
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Forgot password states
    const [forgotMode, setForgotMode] = useState(false);
    const [forgotStep, setForgotStep] = useState<ForgotStep>("email");

    const [forgotEmail, setForgotEmail] = useState("");
    const [otp, setOtp] = useState("");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [otpTimer, setOtpTimer] = useState(120);

    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [resendingOtp, setResendingOtp] = useState(false);
    const [resettingPassword, setResettingPassword] = useState(false);

    // Countdown timer
    useEffect(() => {
        if (!forgotMode || forgotStep !== "otp" || otpTimer <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setOtpTimer((previous) => Math.max(0, previous - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [forgotMode, forgotStep, otpTimer]);

    const formattedTime = `${String(Math.floor(otpTimer / 60)).padStart(2, "0")}:${String(
        otpTimer % 60
    ).padStart(2, "0")}`;

    // Login submit
    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!email.trim()) {
            toast.error("Email is required");
            return;
        }

        if (!password) {
            toast.error("Password is required");
            return;
        }

        if (!storeId) {
            toast.error("Please select your delivery location first");
            return;
        }

        try {
            setLoading(true);

            const res = await API.post("/user/login", {
                email,
                password,
            });

            dispatch(setUser(res.data.user));

            if (cart.length > 0) {
                try {
                    const cartRes = await API.post(
                        "/cart/addCartItems",
                        {
                            cart,
                            storeId,
                        }
                    );

                    console.log("Cart merge:", cartRes.data.message);

                    dispatch(clearCart());

                } catch (cartError: any) {
                    console.log(
                        "Cart merge error:",
                        cartError?.response?.data?.message
                    );

                    toast.error(
                        cartError?.response?.data?.message ||
                        "Unable to merge your cart"
                    );
                }
            }

            await dispatch(fetchCart(storeId)).unwrap();

            setLoginOpen(false);

            toast.success(res.data.message);

        } catch (error: any) {
            console.log(error?.response?.data?.message);

            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // Step 1: Send OTP
    const handleSendOtp = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!forgotEmail.trim()) {
            toast.error("Email address is required");
            return;
        }

        try {
            setSendingOtp(true);

            const res = await API.post("/user/verify-email", {
                email: forgotEmail.trim(),
                type: "forgot-password",
            });

            setOtp("");
            setOtpTimer(120);
            setForgotStep("otp");

            toast.success(
                res.data.message || "OTP sent successfully"
            );

        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                "Unable to send OTP. Please try again."
            );
        } finally {
            setSendingOtp(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!otp.trim()) {
            toast.error("Please enter OTP");
            return;
        }

        if (otp.trim().length !== 4) {
            toast.error("Please enter a valid 4-digit OTP");
            return;
        }

        try {
            setVerifyingOtp(true);

            const res = await API.post("/user/verify-otp", {
                email: forgotEmail.trim(),
                otp: otp.trim(),
                type: "forgot-password",
            });

            setForgotStep("password");

            toast.success(
                res.data.message || "Email verified successfully"
            );

        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                "Invalid or expired OTP"
            );
        } finally {
            setVerifyingOtp(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        try {
            setResendingOtp(true);

            const res = await API.post("/user/verify-email", {
                email: forgotEmail.trim(),
                type: "forgot-password",
            });

            setOtp("");
            setOtpTimer(120);

            toast.success(
                res.data.message || "New OTP sent successfully"
            );

        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                "Unable to resend OTP"
            );
        } finally {
            setResendingOtp(false);
        }
    };

    // Step 3: Reset password
    const handleResetPassword = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!newPassword) {
            toast.error("New password is required");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        if (!confirmPassword) {
            toast.error("Please confirm your password");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setResettingPassword(true);

            const res = await API.post("/user/reset-password", {
                email: forgotEmail.trim(),
                newPassword,
                confirmPassword,
            });

            setForgotStep("success");

            toast.success(
                res.data.message || "Password reset successfully"
            );

        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                "Unable to reset password"
            );
        } finally {
            setResettingPassword(false);
        }
    };

    // Open forgot password flow
    const openForgotPassword = () => {
        setForgotEmail(email);
        setOtp("");
        setOtpTimer(120);
        setForgotStep("email");
        setForgotMode(true);
    };

    // Back to login
    const backToLogin = () => {
        setForgotMode(false);
        setForgotStep("email");
        setForgotEmail("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setOtpTimer(120);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    // Common input styling
    const inputWrapper =
        "flex h-13 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 transition focus-within:border-[#0c831f] focus-within:bg-white focus-within:ring-4 focus-within:ring-green-50";

    const inputStyle =
        "h-full w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400";

    const primaryButton =
        "group flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#0c831f] px-5 text-sm font-extrabold text-white shadow-lg shadow-green-900/10 transition hover:bg-green-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="login-modal-title"
                className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
                <div className="h-1.5 bg-[#0c831f]" />

                {/* Close */}
                <button
                    type="button"
                    onClick={() => setLoginOpen(false)}
                    aria-label="Close modal"
                    className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                >
                    <FiX size={22} />
                </button>

                <div className="px-6 py-8 sm:px-9 sm:py-10">

                    {/* Brand Icon */}
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0c831f] text-white shadow-lg shadow-green-900/15">
                        {forgotMode ? (
                            <FiShield size={29} />
                        ) : (
                            <FiZap size={30} fill="currentColor" />
                        )}
                    </div>

                    {/* LOGIN SCREEN */}
                    {!forgotMode && (
                        <>
                            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#0c831f]">
                                Welcome to QuickKart
                            </p>

                            <h2
                                id="login-modal-title"
                                className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl"
                            >
                                Welcome back!
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-gray-500">
                                Login to your account and get your everyday essentials
                                delivered quickly.
                            </p>

                            <form
                                onSubmit={handleSubmit}
                                className="mt-8 space-y-5"
                            >
                                {/* Email */}
                                <div>
                                    <label
                                        htmlFor="login-email"
                                        className="mb-2 block text-sm font-bold text-gray-800"
                                    >
                                        Email address
                                    </label>

                                    <div className={inputWrapper}>
                                        <FiMail size={19} className="shrink-0 text-gray-400" />

                                        <input
                                            id="login-email"
                                            type="email"
                                            value={email}
                                            onChange={(event) =>
                                                setEmail(event.target.value)
                                            }
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                            autoFocus
                                            required
                                            className={inputStyle}
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <div className="mb-2 flex items-center justify-between gap-3">
                                        <label
                                            htmlFor="login-password"
                                            className="text-sm font-bold text-gray-800"
                                        >
                                            Password
                                        </label>

                                        <button
                                            type="button"
                                            onClick={openForgotPassword}
                                            className="text-xs font-bold text-[#0c831f] transition hover:text-green-800"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>

                                    <div className={inputWrapper}>
                                        <FiLock size={19} className="shrink-0 text-gray-400" />

                                        <input
                                            id="login-password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(event) =>
                                                setPassword(event.target.value)
                                            }
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            required
                                            className={inputStyle}
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((previous) => !previous)
                                            }
                                            aria-label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                            className="shrink-0 text-gray-400 transition hover:text-[#0c831f]"
                                        >
                                            {showPassword ? (
                                                <FiEyeOff size={19} />
                                            ) : (
                                                <FiEye size={19} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={primaryButton}
                                >
                                    {loading ? "Please wait..." : "Login to your account"}

                                    {!loading && (
                                        <FiArrowRight
                                            size={18}
                                            className="transition-transform group-hover:translate-x-1"
                                        />
                                    )}
                                </button>
                            </form>

                            {/* Footer */}
                            <div className="mt-7 border-t border-gray-100 pt-5">
                                <p className="text-center text-xs leading-5 text-gray-500">
                                    Don't have an account?{" "}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLoginOpen(false);
                                            setIsSignupOpen(true);
                                        }}
                                        className="font-bold text-[#0c831f] transition-colors hover:text-[#096b19] hover:underline"
                                    >
                                        Sign Up
                                    </button>
                                </p>

                                <p className="mt-3 text-center text-xs leading-5 text-gray-500">
                                    Shop smarter. Live better.
                                    <span className="mx-1.5 text-gray-300">•</span>
                                    <span className="font-bold text-[#0c831f]">
                                        QuickKart
                                    </span>
                                </p>
                            </div>
                        </>
                    )}

                    {/* FORGOT PASSWORD SCREEN */}
                    {forgotMode && (
                        <>
                            {/* Back Button */}
                            {forgotStep !== "success" && (
                                <button
                                    type="button"
                                    onClick={backToLogin}
                                    className="mb-5 flex items-center gap-2 text-sm font-bold text-gray-500 transition hover:text-[#0c831f]"
                                >
                                    <FiArrowLeft size={17} />
                                    Back to Login
                                </button>
                            )}

                            {/* STEP 1: EMAIL */}
                            {forgotStep === "email" && (
                                <>
                                    <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#0c831f]">
                                        Account Recovery
                                    </p>

                                    <h2 className="text-3xl font-black tracking-tight text-gray-900">
                                        Forgot Password?
                                    </h2>

                                    <p className="mt-3 text-sm leading-6 text-gray-500">
                                        No worries! Enter your registered email address
                                        and we'll send you a verification OTP.
                                    </p>

                                    <form
                                        onSubmit={handleSendOtp}
                                        className="mt-8 space-y-5"
                                    >
                                        <div>
                                            <label
                                                htmlFor="forgot-email"
                                                className="mb-2 block text-sm font-bold text-gray-800"
                                            >
                                                Registered email address
                                            </label>

                                            <div className={inputWrapper}>
                                                <FiMail size={19} className="shrink-0 text-gray-400" />

                                                <input
                                                    id="forgot-email"
                                                    type="email"
                                                    value={forgotEmail}
                                                    onChange={(event) =>
                                                        setForgotEmail(event.target.value)
                                                    }
                                                    placeholder="you@example.com"
                                                    autoComplete="email"
                                                    autoFocus
                                                    required
                                                    className={inputStyle}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={sendingOtp}
                                            className={primaryButton}
                                        >
                                            {sendingOtp ? (
                                                "Sending OTP..."
                                            ) : (
                                                <>
                                                    Send Verification OTP
                                                    <FiArrowRight size={18} />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}

                            {/* STEP 2: OTP */}
                            {forgotStep === "otp" && (
                                <>
                                    <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#0c831f]">
                                        Email Verification
                                    </p>

                                    <h2 className="text-3xl font-black tracking-tight text-gray-900">
                                        Verify OTP
                                    </h2>

                                    <p className="mt-3 text-sm leading-6 text-gray-500">
                                        We've sent a 4-digit verification code to
                                        <span className="mt-1 block break-all font-bold text-gray-800">
                                            {forgotEmail}
                                        </span>
                                    </p>

                                    <form
                                        onSubmit={handleVerifyOtp}
                                        className="mt-8 space-y-5"
                                    >
                                        <div>
                                            <label
                                                htmlFor="forgot-otp"
                                                className="mb-2 block text-sm font-bold text-gray-800"
                                            >
                                                Enter 4-digit OTP
                                            </label>

                                            <div className={inputWrapper}>
                                                <FiShield size={19} className="shrink-0 text-gray-400" />

                                                <input
                                                    id="forgot-otp"
                                                    type="text"
                                                    inputMode="numeric"
                                                    autoComplete="one-time-code"
                                                    maxLength={4}
                                                    value={otp}
                                                    onChange={(event) =>
                                                        setOtp(
                                                            event.target.value.replace(/\D/g, "")
                                                        )
                                                    }
                                                    placeholder="Enter OTP"
                                                    autoFocus
                                                    required
                                                    className={`${inputStyle} text-center font-bold tracking-[0.5em]`}
                                                />
                                            </div>
                                        </div>

                                        {/* Timer / Resend */}
                                        <div className="flex items-center justify-between gap-3">
                                            {otpTimer > 0 ? (
                                                <p className="text-xs font-semibold text-gray-500">
                                                    Resend OTP in{" "}
                                                    <span className="font-extrabold text-[#0c831f] tabular-nums">
                                                        {formattedTime}
                                                    </span>
                                                </p>
                                            ) : (
                                                <p className="text-xs font-semibold text-gray-500">
                                                    Didn't receive OTP?
                                                </p>
                                            )}

                                            <button
                                                type="button"
                                                disabled={
                                                    otpTimer > 0 ||
                                                    resendingOtp ||
                                                    verifyingOtp
                                                }
                                                onClick={handleResendOtp}
                                                className="flex items-center gap-1.5 text-xs font-extrabold text-[#0c831f] transition hover:text-green-800 disabled:cursor-not-allowed disabled:text-gray-400"
                                            >
                                                <FiRefreshCw
                                                    size={13}
                                                    className={resendingOtp ? "animate-spin" : ""}
                                                />

                                                {resendingOtp ? "Sending..." : "Resend OTP"}
                                            </button>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={verifyingOtp || otp.length !== 4}
                                            className={primaryButton}
                                        >
                                            {verifyingOtp ? (
                                                "Verifying..."
                                            ) : (
                                                <>
                                                    Verify OTP
                                                    <FiArrowRight size={18} />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}

                            {/* STEP 3: NEW PASSWORD */}
                            {forgotStep === "password" && (
                                <>
                                    <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#0c831f]">
                                        Almost Done
                                    </p>

                                    <h2 className="text-3xl font-black tracking-tight text-gray-900">
                                        Set New Password
                                    </h2>

                                    <p className="mt-3 text-sm leading-6 text-gray-500">
                                        Your email has been verified. Create a strong
                                        new password for your QuickKart account.
                                    </p>

                                    <form
                                        onSubmit={handleResetPassword}
                                        className="mt-8 space-y-5"
                                    >
                                        {/* New Password */}
                                        <div>
                                            <label
                                                htmlFor="new-password"
                                                className="mb-2 block text-sm font-bold text-gray-800"
                                            >
                                                New Password
                                            </label>

                                            <div className={inputWrapper}>
                                                <FiLock size={19} className="shrink-0 text-gray-400" />

                                                <input
                                                    id="new-password"
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(event) =>
                                                        setNewPassword(event.target.value)
                                                    }
                                                    placeholder="Enter new password"
                                                    autoComplete="new-password"
                                                    autoFocus
                                                    required
                                                    minLength={8}
                                                    className={inputStyle}
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowNewPassword((previous) => !previous)
                                                    }
                                                    aria-label="Toggle new password visibility"
                                                    className="shrink-0 text-gray-400 hover:text-[#0c831f]"
                                                >
                                                    {showNewPassword ? (
                                                        <FiEyeOff size={19} />
                                                    ) : (
                                                        <FiEye size={19} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Confirm Password */}
                                        <div>
                                            <label
                                                htmlFor="confirm-password"
                                                className="mb-2 block text-sm font-bold text-gray-800"
                                            >
                                                Confirm New Password
                                            </label>

                                            <div className={inputWrapper}>
                                                <FiLock size={19} className="shrink-0 text-gray-400" />

                                                <input
                                                    id="confirm-password"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={confirmPassword}
                                                    onChange={(event) =>
                                                        setConfirmPassword(event.target.value)
                                                    }
                                                    placeholder="Confirm new password"
                                                    autoComplete="new-password"
                                                    required
                                                    minLength={8}
                                                    className={inputStyle}
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowConfirmPassword((previous) => !previous)
                                                    }
                                                    aria-label="Toggle confirm password visibility"
                                                    className="shrink-0 text-gray-400 hover:text-[#0c831f]"
                                                >
                                                    {showConfirmPassword ? (
                                                        <FiEyeOff size={19} />
                                                    ) : (
                                                        <FiEye size={19} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-xs leading-5 text-gray-500">
                                            Password must contain at least 8 characters.
                                        </p>

                                        <button
                                            type="submit"
                                            disabled={resettingPassword}
                                            className={primaryButton}
                                        >
                                            {resettingPassword ? (
                                                "Updating Password..."
                                            ) : (
                                                <>
                                                    Reset Password
                                                    <FiArrowRight size={18} />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}

                            {/* STEP 4: SUCCESS */}
                            {forgotStep === "success" && (
                                <div className="py-5 text-center">
                                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-[#0c831f]">
                                        <FiCheckCircle size={46} />
                                    </div>

                                    <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#0c831f]">
                                        Password Updated
                                    </p>

                                    <h2 className="text-3xl font-black tracking-tight text-gray-900">
                                        All Done!
                                    </h2>

                                    <p className="mt-3 text-sm leading-6 text-gray-500">
                                        Your password has been successfully reset.
                                        You can now login using your new password.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={backToLogin}
                                        className={`${primaryButton} mt-8`}
                                    >
                                        Back to Login
                                        <FiArrowRight size={18} />
                                    </button>
                                </div>
                            )}

                            {/* Forgot Password Footer */}
                            {forgotStep !== "success" && (
                                <div className="mt-7 border-t border-gray-100 pt-5">
                                    <p className="text-center text-xs leading-5 text-gray-500">
                                        Remember your password?{" "}
                                        <button
                                            type="button"
                                            onClick={backToLogin}
                                            className="font-bold text-[#0c831f] hover:underline"
                                        >
                                            Login
                                        </button>
                                    </p>

                                    <p className="mt-3 text-center text-xs leading-5 text-gray-500">
                                        Secure account recovery.
                                        <span className="mx-1.5 text-gray-300">•</span>
                                        <span className="font-bold text-[#0c831f]">
                                            QuickKart
                                        </span>
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
