import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { API } from "../../api/axios"

const Signup = () => {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        email: "",
        password: "",
        confirmPassword: ""
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm({
            ...form,
            [name]: value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (form.email == "") {
            toast.error("Enter email")
            return
        }
        if (form.password == "") {
            toast.error("Enter password")
            return
        }
        if (form.confirmPassword == "") {
            toast.error("Enter confirm password")
            return
        }
        if (form.password !== form.confirmPassword) {
            toast.error("Passwords are not same")
            return
        }
        try {
            setLoading(true)
            const res = await API.post("/admin/signup", {
                email: form.email,
                password: form.password
            })
            setLoading(false)
            setForm({
                email: "",
                password: "",
                confirmPassword: ""
            })
            toast.success(res?.data?.message)
            navigate("/")
        }
        catch (error) {
            setLoading(false)
            setForm({
                email: "",
                password: "",
                confirmPassword: ""
            })
            toast.error(error?.response?.data?.message)
        }
    }

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
                            Secure Access
                        </p>

                        <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                            Creating your
                            <span className="block text-emerald-300">
                                secure account.
                            </span>
                        </h1>

                        <p className="text-slate-200/80 text-lg leading-8 mt-6">
                            We're securely creating your account.
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


                        {/* Text */}
                        <p className="mt-7 text-base font-semibold text-slate-700">
                            Creating your account
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                            Please wait while we secure your account
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

                    <div className="mb-8">
                        <div className="w-14 h-14 rounded-2xl
                            bg-white/10 backdrop-blur-md
                            border border-white/20
                            flex items-center justify-center mb-6">

                            <span className="text-2xl font-bold text-emerald-300">
                                S
                            </span>
                        </div>

                        <p className="text-emerald-300 font-semibold tracking-widest
                            uppercase text-sm mb-4">
                            Welcome
                        </p>

                        <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                            Create your
                            <span className="block text-emerald-300">
                                account.
                            </span>
                        </h1>
                    </div>

                    <p className="text-slate-200/80 text-lg leading-8">
                        Join us and get access to a simple, secure and
                        seamless experience designed for you.
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

                        <p className="text-emerald-600 font-semibold text-sm
                            uppercase tracking-wider">
                            Welcome
                        </p>
                    </div>


                    {/* Heading */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-900">
                            Create Account
                        </h2>

                        <p className="mt-2 text-slate-500">
                            Enter your details to get started.
                        </p>
                    </div>


                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold
                                text-slate-700 mb-2">
                                Email Address
                            </label>

                            <input
                                onChange={handleChange}
                                type="email"
                                name="email"
                                placeholder="you@example.com"
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


                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold
                                text-slate-700 mb-2">
                                Password
                            </label>

                            <input
                                onChange={handleChange}
                                type="password"
                                name="password"
                                placeholder="Enter your password"
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


                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-semibold
                                text-slate-700 mb-2">
                                Confirm Password
                            </label>

                            <input
                                onChange={handleChange}
                                type="password"
                                name="confirmPassword"
                                placeholder="Re-enter your password"
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


                        {/* Submit */}
                        <div className="pt-3">
                            <button
                                type="submit"
                                className="w-full h-12
                                rounded-xl
                                bg-emerald-600
                                hover:bg-emerald-700
                                active:scale-[0.99]
                                text-white
                                font-semibold
                                shadow-lg shadow-emerald-600/20
                                transition-all duration-200"
                            >
                                Create Account
                            </button>
                        </div>

                    </form>


                    {/* Bottom Text */}
                    <p className="text-center text-sm text-slate-500 mt-8">
                        Already have an account?
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="ml-1 font-semibold text-emerald-600
                            hover:text-emerald-700 transition-colors"
                        >
                            Login
                        </button>
                    </p>

                </div>
            </div>

        </div>
    )
}

export default Signup
