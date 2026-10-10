import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { API } from '../../api/axios'

const ForgetPassword = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [showVerify, setShowVerify] = useState(false)
    const [isEmail, setIsEmail] = useState(false)
    const [enterOTP, setEnterOTP] = useState(false)
    const [OTP, setOTP] = useState("")
    const [loading, setLoading] = useState(false)
    const [timeLeft, setTimeLeft] = useState(120)

    const handleVerifyEmail = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const res = await API.post("/admin/verify-email", { email })
            toast.success(res?.data?.message)
            setLoading(false)
            setEnterOTP(true)
            console.log(res.data)
        }
        catch (error) {
            setLoading(false)
            setEmail("")
            toast.error(error?.response?.data?.message)
        }
    }

    const handleOTPSubmit = async () => {
        try {
            setLoading(true)
            const res = await API.post("/admin/verify-otp", {
                otp: OTP,
                email
            })
            setLoading(false)
            setOTP("")
            toast.success(res?.data?.message)
            navigate("/reset-password", { state: { email } })
        }
        catch (error) {
            setLoading(false)
            setOTP("")
            toast.error(error?.response?.data?.message)
        }
    }

    useEffect(() => {
        if (email == "") {
            setShowVerify(false)
            return
        }

        setShowVerify(true)

        if (email.includes("@") && email.includes(".")) {
            setIsEmail(true)
        }
    }, [email])

    useEffect(() => {
        if (OTP.length < 4) return

        setLoading(true)
        handleOTPSubmit()
    }, [OTP])

    useEffect(() => {

        if (!enterOTP) return

        const timer = setInterval(() => {

            setTimeLeft((prev) => {

                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }

                return prev - 1
            })

        }, 1000)

        return () => clearInterval(timer)

    }, [enterOTP])

    if (loading) {
        return (
            <div className="min-h-screen w-full flex bg-slate-950">

                {/* LEFT */}
                <div className="hidden md:flex md:w-1/2 relative overflow-hidden
                bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22]
                items-center justify-center p-12 text-white">

                    <div className="absolute -top-32 -left-32 w-96 h-96
                    bg-emerald-400/20 rounded-full blur-3xl" />

                    <div className="absolute -bottom-32 -right-32 w-96 h-96
                    bg-green-300/10 rounded-full blur-3xl" />

                    <div className="relative z-10 max-w-lg">

                        <div className="w-14 h-14 rounded-2xl
                        bg-white/10 backdrop-blur-md
                        border border-white/20
                        flex items-center justify-center mb-6">

                            <span className="text-2xl font-bold text-emerald-300">
                                S
                            </span>

                        </div>

                        <p className="text-emerald-300 font-semibold
                        tracking-widest uppercase text-sm mb-4">
                            Secure Verification
                        </p>

                        <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                            Verify your
                            <span className="block text-emerald-300">
                                identity securely.
                            </span>
                        </h1>

                        <p className="text-slate-200/80 text-lg leading-8 mt-6">
                            We're securely verifying your information.
                            Please wait a moment.
                        </p>

                    </div>
                </div>


                {/* RIGHT */}
                <div className="w-full md:w-1/2 bg-slate-50
                flex items-center justify-center">

                    <div className="flex flex-col items-center">

                        {/* Animated Loader */}
                        <div className="relative flex items-center justify-center">

                            {/* Outer pulse */}
                            <div className="absolute h-24 w-24 rounded-full
                            bg-emerald-500/10 animate-ping" />

                            {/* Spinner */}
                            <div className="h-16 w-16 rounded-full
                            border-4 border-slate-200
                            border-t-emerald-600
                            animate-spin" />

                            {/* Center */}
                            <div className="absolute h-8 w-8 rounded-full
                            bg-emerald-600
                            flex items-center justify-center">

                                <span className="text-white text-sm font-bold">
                                    S
                                </span>

                            </div>

                        </div>

                        <p className="mt-7 text-base font-semibold text-slate-700">
                            Verifying your information
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                            Please wait while we securely verify your details
                        </p>

                        {/* Animated dots */}
                        <div className="flex gap-1.5 mt-4">

                            <span className="h-1.5 w-1.5 rounded-full
                            bg-emerald-600 animate-bounce" />

                            <span className="h-1.5 w-1.5 rounded-full
                            bg-emerald-600 animate-bounce [animation-delay:150ms]" />

                            <span className="h-1.5 w-1.5 rounded-full
                            bg-emerald-600 animate-bounce [animation-delay:300ms]" />

                        </div>

                    </div>

                </div>

            </div>
        )
    }

    return (
        <div className="min-h-screen w-full flex bg-slate-950">

            {/* LEFT - BRAND SECTION */}
            <div className="hidden md:flex md:w-1/2 relative overflow-hidden
                bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22]
                text-white items-center justify-center p-12">

                {/* Background Glow */}
                <div className="absolute -top-32 -left-32 w-96 h-96
                    bg-emerald-400/20 rounded-full blur-3xl" />

                <div className="absolute -bottom-32 -right-32 w-96 h-96
                    bg-green-300/10 rounded-full blur-3xl" />

                {/* Content */}
                <div className="relative z-10 max-w-lg">

                    <div className="w-14 h-14 rounded-2xl
                        bg-white/10 backdrop-blur-md
                        border border-white/20
                        flex items-center justify-center mb-8">

                        <span className="text-2xl font-bold text-emerald-300">
                            S
                        </span>

                    </div>

                    <p className="text-emerald-300 font-semibold
                        tracking-widest uppercase text-sm mb-4">
                        Account Recovery
                    </p>

                    <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                        Securely recover
                        <span className="block text-emerald-300">
                            your account.
                        </span>
                    </h1>

                    <p className="text-slate-200/80 text-lg leading-8 mt-6">
                        Verify your email address and we'll help you
                        get back into your account securely.
                    </p>

                    <div className="mt-10 flex items-center gap-3">

                        <div className="h-1 w-12 rounded-full bg-emerald-300" />
                        <div className="h-1 w-4 rounded-full bg-white/30" />
                        <div className="h-1 w-4 rounded-full bg-white/30" />

                    </div>

                </div>
            </div>


            {/* RIGHT - FORM SECTION */}
            <div className="w-full md:w-1/2 bg-slate-50
                flex items-center justify-center px-6 py-10 sm:px-10">

                <div className="w-full max-w-md">

                    {/* Mobile Brand */}
                    <div className="md:hidden mb-8">

                        <div className="w-12 h-12 rounded-xl
                            bg-emerald-600
                            flex items-center justify-center mb-5">

                            <span className="text-xl font-bold text-white">
                                S
                            </span>

                        </div>

                        <p className="text-emerald-600 font-semibold
                            text-sm uppercase tracking-wider">
                            Account Recovery
                        </p>

                    </div>


                    {!enterOTP ? (

                        <>
                            {/* Email Heading */}
                            <div className="mb-8">

                                <h2 className="text-3xl font-bold text-slate-900">
                                    Forgot Password?
                                </h2>

                                <p className="mt-2 text-slate-500 leading-6">
                                    Enter your registered email address
                                    and we'll send you a verification code.
                                </p>

                            </div>


                            <form onSubmit={handleVerifyEmail}>

                                <div>

                                    <label className="block text-sm font-semibold
                                        text-slate-700 mb-2">
                                        Email Address
                                    </label>

                                    <input
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        type="email"
                                        name="email"
                                        className="w-full h-12 px-4
                                        bg-white
                                        border border-slate-200
                                        rounded-xl
                                        text-slate-900
                                        placeholder:text-slate-400
                                        outline-none
                                        transition-all
                                        focus:border-emerald-500
                                        focus:ring-4 focus:ring-emerald-500/10"
                                    />

                                </div>


                                {showVerify && (
                                    <button
                                        type="submit"
                                        disabled={!isEmail}
                                        className={`w-full h-12 mt-5
                                            rounded-xl
                                            text-white
                                            font-semibold
                                            transition-all duration-200
                                            ${isEmail
                                                ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                                                : "bg-slate-400 cursor-not-allowed"
                                            }`}
                                    >
                                        Verify Email
                                    </button>
                                )}

                            </form>

                        </>

                    ) : (

                        <>
                            {/* OTP Heading */}
                            <div className="mb-8">

                                <h2 className="text-3xl font-bold text-slate-900">
                                    Verify OTP
                                </h2>

                                <p className="mt-2 text-slate-500 leading-6">
                                    Enter the 4-digit verification code
                                    sent to your email address.
                                </p>

                            </div>


                            {/* OTP */}
                            <div>

                                <label className="block text-sm font-semibold
                                    text-slate-700 mb-2">
                                    Verification Code
                                </label>

                                <input
                                    onChange={(e) => setOTP(e.target.value)}
                                    value={OTP}
                                    placeholder="Enter 4-digit OTP"
                                    type="text"
                                    name="otp"
                                    maxLength="4"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    autoFocus
                                    className="w-full h-14 px-4
                                    bg-white
                                    border border-slate-200
                                    rounded-xl
                                    text-slate-900
                                    text-center
                                    text-2xl
                                    tracking-[0.6em]
                                    font-semibold
                                    placeholder:text-slate-400
                                    placeholder:text-base
                                    placeholder:tracking-normal
                                    outline-none
                                    transition-all
                                    focus:border-emerald-500
                                    focus:ring-4 focus:ring-emerald-500/10"
                                />

                            </div>


                            <p className="text-sm text-slate-400 text-center mt-5">
                                {timeLeft > 0
                                    ? `OTP expires in ${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`
                                    : "OTP has expired"
                                }
                            </p>

                        </>

                    )}


                    {/* Back to Login */}
                    <div className="text-center mt-8">

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="text-sm font-semibold
                            text-emerald-600
                            hover:text-emerald-700
                            transition-colors"
                        >
                            ← Back to Login
                        </button>

                    </div>

                </div>
            </div>

        </div>
    )
}

export default ForgetPassword
