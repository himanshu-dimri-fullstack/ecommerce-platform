
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
    product: string;
    variant: string;
    name: string;
    image: string;
    price: number;
    mrp: number;
    quantity: number;
    unit: string;
}

interface CartState {
    items: CartItem[];
}

const initialState: CartState = {
    items: [],
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const newItem = action.payload;

            const existingItem = state.items.find(
                (item) =>
                    item.product === newItem.product &&
                    item.variant === newItem.variant
            );

            if (existingItem) {
                existingItem.quantity += newItem.quantity;
            } else {
                state.items.push(newItem);
            }
        },

        removeFromCart: (
            state,
            action: PayloadAction<{
                product: string;
                variant: string;
            }>
        ) => {
            state.items = state.items.filter(
                (item) =>
                    !(
                        item.product === action.payload.product &&
                        item.variant === action.payload.variant
                    )
            );
        },

        increaseQuantity: (
            state,
            action: PayloadAction<{
                product: string;
                variant: string;
            }>
        ) => {
            const item = state.items.find(
                (item) =>
                    item.product === action.payload.product &&
                    item.variant === action.payload.variant
            );

            if (item) item.quantity += 1;
        },

        decreaseQuantity: (
            state,
            action: PayloadAction<{
                product: string;
                variant: string;
            }>
        ) => {
            const item = state.items.find(
                (item) =>
                    item.product === action.payload.product &&
                    item.variant === action.payload.variant
            );

            if (item) {
                item.quantity -= 1;

                if (item.quantity <= 0) {
                    state.items = state.items.filter(
                        (cartItem) =>
                            !(
                                cartItem.product === action.payload.product &&
                                cartItem.variant === action.payload.variant
                            )
                    );
                }
            }
        },

        clearCart: (state) => {
            state.items = [];
        },
    },
});

export const {
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
