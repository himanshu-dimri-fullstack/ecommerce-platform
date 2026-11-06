import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import authReducer from "./authSlice";
import storeReducer from "./storeSlice";

export const makeStore = () => {
    return configureStore({
        reducer: {
            cart: cartReducer,
            auth: authReducer,
            store: storeReducer,
        },
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];