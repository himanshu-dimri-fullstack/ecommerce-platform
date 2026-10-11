import React from "react";

const DataLoader = () => {
    return (
        <div className="flex min-h-100 w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="relative flex h-14 w-14 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />

                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-emerald-700" />

                    <div className="h-3 w-3 rounded-full bg-emerald-700" />
                </div>

                <div className="text-center">
                    <p className="text-sm font-semibold tracking-wide text-slate-700">
                        Loading data
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                        Please wait a moment...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DataLoader;