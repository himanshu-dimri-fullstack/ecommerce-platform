import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { API } from "../../api/axios"

const ResetPassword = () => {
    const navigate = useNavigate()
    const location = useLocation()
    console.log(location)

    const [form, setForm] = useState({
        password: "",
        confirmPassword: ""
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm({
            ...form,
            [name]: value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
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
            const res = await API.post(
                "/admin/reset-password",
                {
                    email: location?.state?.email,
                    password: form.password
                }
            )
            toast.success(res?.data?.message)
            navigate("/")
        }
        catch (error) {
            toast.error(error?.response?.data?.message)
        }
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
                        Secure Account
                    </p>

                    <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                        Create a new
                        <span className="block text-emerald-300">
                            secure password.
                        </span>
                    </h1>

                    <p className="text-slate-200/80 text-lg leading-8 mt-6">
                        Choose a strong password to keep your account
                        safe and secure.
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
                            Secure Account
                        </p>

                    </div>


                    {/* Heading */}
                    <div className="mb-8">

                        <h2 className="text-3xl font-bold text-slate-900">
                            Reset Password
                        </h2>

                        <p className="mt-2 text-slate-500 leading-6">
                            Create a new password for your account.
                            Make sure both passwords match.
                        </p>

                    </div>


                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Password */}
                        <div>

                            <label className="block text-sm font-semibold
                                text-slate-700 mb-2">
                                New Password
                            </label>

                            <input
                                onChange={handleChange}
                                type="password"
                                name="password"
                                placeholder="Enter new password"
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
                                Confirm New Password
                            </label>

                            <input
                                onChange={handleChange}
                                type="password"
                                name="confirmPassword"
                                placeholder="Re-enter new password"
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


                        {/* Password Info */}
                        <div className="flex items-start gap-3
                            bg-emerald-50 border border-emerald-100
                            rounded-xl p-4">

                            <div className="mt-0.5 w-5 h-5 rounded-full
                                bg-emerald-100 text-emerald-700
                                flex items-center justify-center
                                text-xs font-bold">
                                i
                            </div>

                            <p className="text-sm text-emerald-800 leading-5">
                                Use a password that you don't use on other
                                websites for better account security.
                            </p>

                        </div>


                        {/* Submit */}
                        <div className="pt-2">

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
                                Change Password
                            </button>

                        </div>

                    </form>


                    {/* Back to Login */}
                    <div className="text-center mt-8">

                        <button
                            type="button"
                            onClick={() => navigate("/")}
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

export default ResetPassword
