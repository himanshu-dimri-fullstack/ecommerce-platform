import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./AuthSlice.js"

export const store = configureStore({
    reducer: {
        auth: authReducer
    }
})