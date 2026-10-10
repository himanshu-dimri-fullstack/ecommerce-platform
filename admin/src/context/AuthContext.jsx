import { createContext, useEffect, useState } from "react";
import { API } from "../api/axios.js"

export const AuthContext = createContext()

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await API.get("/admin/check-user")
                if (res.data.user) {
                    setUser(res.data.user)
                }
                console.log(res.data)
            }
            catch (error) {
                console.log(error)
            }
            finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [])

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider