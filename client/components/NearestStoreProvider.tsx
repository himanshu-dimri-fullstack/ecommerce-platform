
"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNearestStore } from "@/redux/storeSlice";
import type { RootState, AppDispatch } from "@/redux/store";

export default function NearestStoreProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const savedLocation = sessionStorage.getItem("quickkart_location");

        if (!savedLocation) return;

        try {
            const location = JSON.parse(savedLocation);

            const { latitude, longitude } = location;

            if (
                typeof latitude !== "number" ||
                typeof longitude !== "number"
            ) {
                return;
            }

            dispatch(
                fetchNearestStore({
                    latitude,
                    longitude,
                })
            );
        } catch (error) {
            console.error("Invalid saved location:", error);
        }
    }, [dispatch]);

    return <>{children}</>;
}
