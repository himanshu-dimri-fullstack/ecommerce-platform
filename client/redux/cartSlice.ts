
import {
    createAsyncThunk,
    createSlice,
    type PayloadAction,
} from "@reduxjs/toolkit";
import { API } from "../axios/axios.js";

export interface CartItem {
    _id: string;
    product: string;
    name: string;
    unitValue: string;
    unit: string;
    sellingPrice: number;
    mrp: number;
    image: string;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    loading: boolean;
    error: string;
}

interface ApiError {
    message?: string;
}

// interface CartApiItem {
//     _id?: string;
//     product?: {
//         _id?: string;
//         name?: string;
//         images?: { url?: string }[];
//     } | string;
//     variant?: {
//         _id?: string;
//         name?: string;
//         unitValue?: string | number;
//         unit?: string;
//         mrp?: number;
//         image?: string | { url?: string };
//     } | string;
//     price?: number;
//     quantity?: number;
// }

// interface CartApiResponse {
//     success: boolean;
//     items: CartApiItem[];
//     message?: string;
// }

export const fetchCart = createAsyncThunk<
    CartItem[],
    void,
    { rejectValue: string }
>(
    "cart/fetchCart",
    async (_, { rejectWithValue }) => {
        try {
            const res = await API.get("/cart/get");

            const items: CartItem[] = (res.data.items || []).map((item: any) => {
                const product =
                    typeof item.product === "object" ? item.product : undefined;

                const variant =
                    typeof item.variant === "object" ? item.variant : undefined;

                const variantImage =
                    typeof variant?.image === "string"
                        ? variant.image
                        : variant?.image?.url;

                return {
                    _id: variant?._id ?? "",
                    product:
                        product?._id ??
                        (typeof item.product === "string" ? item.product : ""),
                    name: variant?.name || product?.name || "",
                    unitValue: String(variant?.unitValue ?? ""),
                    unit: variant?.unit ?? "",
                    sellingPrice: item.price ?? 0,
                    mrp: variant?.mrp ?? item.price ?? 0,
                    image:
                        variantImage ||
                        product?.images?.[0]?.url ||
                        "",
                    quantity: item.quantity ?? 1,
                };
            });

            return items;
        } catch (error: unknown) {
            const err = error as ApiError;
            return rejectWithValue(err.message || "Failed to fetch cart");
        }
    }
);

const initialState: CartState = {
    items: [],
    loading: false,
    error: "",
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        setCart: (state, action: PayloadAction<CartItem[]>) => {
            state.items = action.payload;
        },

        addToCart: (state, action: PayloadAction<CartItem>) => {
            const newItem = action.payload;

            const existingItem = state.items.find(
                (item) =>
                    item.product === newItem.product &&
                    item._id === newItem._id
            );

            if (existingItem) {
                existingItem.quantity += newItem.quantity;
            } else {
                state.items.push(newItem);
            }
        },

        removeFromCart: (
            state,
            action: PayloadAction<{ product: string; _id: string }>
        ) => {
            state.items = state.items.filter(
                (item) =>
                    !(
                        item.product === action.payload.product &&
                        item._id === action.payload._id
                    )
            );
        },

        increaseQuantity: (
            state,
            action: PayloadAction<{ product: string; _id: string }>
        ) => {
            const item = state.items.find(
                (item) =>
                    item.product === action.payload.product &&
                    item._id === action.payload._id
            );

            if (item) item.quantity += 1;
        },

        decreaseQuantity: (
            state,
            action: PayloadAction<{ product: string; _id: string }>
        ) => {
            const item = state.items.find(
                (item) =>
                    item.product === action.payload.product &&
                    item._id === action.payload._id
            );

            if (item) {
                item.quantity -= 1;

                if (item.quantity <= 0) {
                    state.items = state.items.filter(
                        (cartItem) =>
                            !(
                                cartItem.product === action.payload.product &&
                                cartItem._id === action.payload._id
                            )
                    );
                }
            }
        },

        clearCart: (state) => {
            state.items = [];
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
                state.error = "";
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.items = action.payload;
                state.loading = false;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.error =
                    action.payload ?? action.error.message ?? "Failed to fetch cart";
                state.loading = false;
            });
    },
});

export const {
    setCart,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
