import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { API } from "../axios/axios.js";

export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    [key: string]: unknown;
}

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string;
}

interface ApiError {
    message: string;
}

export const fetchUser = createAsyncThunk<
    User,
    void,
    { rejectValue: string }
>(
    "user/fetch",
    async (_, { rejectWithValue }) => {
        try {
            const res = await API.get<{ user: User }>("admin/check-user");
            return res.data.user;
        } catch (error: unknown) {
            const err = error as ApiError;
            return rejectWithValue(err.message || "Failed to fetch user");
        }
    }
);

const initialState: AuthState = {
    user: null,
    loading: true,
    error: "",
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
                state.error = "";
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.loading = false;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.error =
                    action.payload ?? action.error.message ?? "Failed to fetch user";
                state.loading = false;
            });
    },
});

export const { setUser, setLoading } = authSlice.actions;

export default authSlice.reducer;