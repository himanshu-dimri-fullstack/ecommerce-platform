import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API } from "../api/axios";

export const fetchUser = createAsyncThunk("user/fetch", async () => {
    try {
        const res = await API.get("/admin/check-user")
        console.log("user at redux", res.data.user)
        return res.data.user
    }
    catch (error) {
        return error?.response?.data?.message
    }
})

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        loading: true,
        error: ""
    },

    extraReducers: (builder) => {
        builder.addCase(fetchUser.pending, (state) => {
            state.loading = true
        })
        builder.addCase(fetchUser.fulfilled, (state, action) => {
            // console.log("user in redux", action.payload)
            state.user = action.payload
            state.loading = false
        })
        builder.addCase(fetchUser.rejected, (state, action) => {
            // console.log("error in redux", action.payload)
            state.error = action.payload
            state.loading = false
        })
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        }
    }
})

export const { setUser, setLoading } = authSlice.actions
export default authSlice.reducer