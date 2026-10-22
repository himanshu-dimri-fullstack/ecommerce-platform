
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
    _id: string
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
            console.log("newItem", newItem)

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
            action: PayloadAction<{
                product: string;
                _id: string;
            }>
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
            action: PayloadAction<{
                product: string;
                _id: string;
            }>
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
            action: PayloadAction<{
                product: string;
                _id: string;
            }>
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
});

export const {
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
