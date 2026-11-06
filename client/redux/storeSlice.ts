
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { API } from "@/axios/axios";

// STORE TYPE
interface Store {
    _id: string;
    name: string;
    code: string;
    manager: string;
    phone: string;
    address: string;
    location: {
        type: "Point";
        coordinates: [number, number];
    };
    serviceRadius: number;
    status: "active" | "inactive";
    distance: number;
    distanceInKm: number;
}

// STATE TYPE
interface StoreState {
    store: Store | null;
    loading: boolean;
    error: string | null;
}

// API RESPONSE TYPE
interface NearestStoreResponse {
    success: boolean;
    message: string;
    store: Store;
}

// LOCATION TYPE
interface LocationPayload {
    latitude: number;
    longitude: number;
}

// INITIAL STATE
const initialState: StoreState = {
    store: null,
    loading: false,
    error: null,
};

// GET NEAREST STORE
export const fetchNearestStore = createAsyncThunk<
    Store,
    LocationPayload,
    { rejectValue: string }
>(
    "store/fetchNearestStore",
    async ({ latitude, longitude }, { rejectWithValue }) => {
        try {
            const { data } = await API.get<NearestStoreResponse>(
                `/store/nearest?latitude=${latitude}&longitude=${longitude}`
            );

            return data.store;

        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to find nearest store"
            );
        }
    }
);

// STORE SLICE
const storeSlice = createSlice({
    name: "store",
    initialState,

    reducers: {
        clearStore: (state) => {
            state.store = null;
            state.error = null;
            state.loading = false;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchNearestStore.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(
                fetchNearestStore.fulfilled,
                (state, action: PayloadAction<Store>) => {
                    state.loading = false;
                    state.store = action.payload;
                    state.error = null;
                }
            )

            .addCase(fetchNearestStore.rejected, (state, action) => {
                state.loading = false;
                state.store = null;
                state.error =
                    action.payload || "Something went wrong";
            });
    },
});

export const { clearStore } = storeSlice.actions;

export default storeSlice.reducer;
