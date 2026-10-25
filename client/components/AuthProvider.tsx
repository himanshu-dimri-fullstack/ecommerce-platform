"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { fetchUser } from "@/redux/authSlice";

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(fetchUser());
    }, [dispatch]);

    return <>{children}</>;
}