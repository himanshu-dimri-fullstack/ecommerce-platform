import React from "react";
import {
    FiTrash2,
    FiX,
    FiPackage,
    FiAlertTriangle,
} from "react-icons/fi";

const DeleteModal = ({
    handleDeleteVariant,
    setShowDeleteModal,
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">

                {/* HEADER */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <FiTrash2 size={20} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                Delete Product Variant
                            </h2>

                            <p className="text-xs text-slate-500">
                                Product variant management
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(false)}
                        aria-label="Close modal"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="px-6 py-7 text-center">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-8 ring-red-50/50">
                        <FiAlertTriangle size={30} />
                    </div>

                    <h3 className="text-xl font-bold text-slate-800">
                        Are you sure?
                    </h3>

                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                        Are you sure you want to delete this product
                        variant? This action cannot be undone, and the
                        variant will be permanently removed.
                    </p>
                </div>

                {/* FOOTER BUTTONS */}
                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(false)}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleDeleteVariant}
                        className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-600/20 transition hover:bg-red-700 active:scale-[0.98]"
                    >
                        <FiTrash2 size={16} />
                        Delete Variant
                    </button>
                </div>

            </div>
        </div>
    );
};

export default DeleteModal;