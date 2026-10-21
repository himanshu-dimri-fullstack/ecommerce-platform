import { useState, useEffect } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { Link } from "react-router-dom"
import { API } from "../../api/axios"
import { useDispatch, useSelector } from "react-redux";
import { fetchUser } from "../../redux/AuthSlice.js";
import { setUser, setLoading } from "../../redux/AuthSlice.js"
import Loader from "../Loader.jsx"

const LoginPage = () => {

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const user = useSelector((store) => store.auth.user)
    const loading = useSelector((store) => store.auth.loading)

    const [form, setForm] = useState({
        email: "",
        password: ""
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
        if (form.email == "") {
            toast.error("Enter email")
            return
        }
        if (form.password == "") {
            toast.error("Enter password")
            return
        }
        try {
            // setLoading(true)
            const res = await API.post(
                "/admin/login",
                {
                    email: form.email,
                    password: form.password
                }
            )
            setForm({
                email: form.email,
                password: ""
            })
            // setLoading(false)
            toast.success(res?.data?.message)
            setUser(res.data.user)
            navigate("/admin/dashboard", { replace: true })
        }
        catch (error) {
            setForm({
                email: form.email,
                password: ""
            })
            // setLoading(false)
            toast.error(error?.response?.data?.message)
        }
    }

    useEffect(() => {
        dispatch(fetchUser())
    }, [])

    if (loading) {
        return (
            <Loader />
        )
    }

    if (user) {
        return <Navigate to="/admin/dashboard" replace />
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

                        <p className="text-emerald-300 font-semibold
                            tracking-widest uppercase text-sm mb-4">
                            Welcome Back
                        </p>

                        <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                            Good to see
                            <span className="block text-emerald-300">
                                you again.
                            </span>
                        </h1>

                    </div>

                    <p className="text-slate-200/80 text-lg leading-8">
                        Sign in to continue your journey and access
                        everything waiting for you.
                    </p>

                    <div className="mt-10 flex items-center gap-3">
                        <div className="h-1 w-12 rounded-full bg-emerald-300" />
                        <div className="h-1 w-4 rounded-full bg-white/30" />
                        <div className="h-1 w-4 rounded-full bg-white/30" />
                    </div>

                </div>
            </div>


            {/* RIGHT - LOGIN FORM */}
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
                            Welcome Back
                        </p>

                    </div>


                    {/* Heading */}
                    <div className="mb-8">

                        <h2 className="text-3xl font-bold text-slate-900">
                            Welcome Back
                        </h2>

                        <p className="mt-2 text-slate-500">
                            Sign in to your account to continue.
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
                                value={form.email}
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
                                value={form.password}
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


                        {/* Forgot Password */}
                        <div className="flex justify-end pt-1">

                            <Link
                                to="/forget-password"
                                className="text-sm font-semibold
                                text-emerald-600
                                hover:text-emerald-700
                                transition-colors"
                            >
                                Forgot Password?
                            </Link>

                        </div>


                        {/* Login Button */}
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
                                Login
                            </button>

                        </div>

                    </form>


                    {/* Signup */}
                    {/* <p className="text-center text-sm text-slate-500 mt-8">

                        Don't have an account?

                        <Link
                            to="/signup"
                            className="ml-1 font-semibold
                            text-emerald-600
                            hover:text-emerald-700
                            transition-colors"
                        >
                            Create Account
                        </Link>

                    </p> */}

                </div>
            </div>
        </div>
    )
}

export default LoginPage
