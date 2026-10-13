import React from "react";
import { FiTrash2 } from "react-icons/fi";

const DeleteModal = ({
    handleDeleteProduct,
    setShowDeleteModal,
}) => {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
                {/* HEADER */}
                <div className="mb-5 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                        <FiTrash2 className="text-2xl text-red-600" />
                    </div>

                    <h2 className="text-xl font-bold text-slate-800">
                        Delete Product?
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Are you sure you want to delete this product?
                        This action cannot be undone.
                    </p>
                </div>

                {/* BUTTONS */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(false)}
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleDeleteProduct}
                        className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                        <span className="inline-flex items-center justify-center gap-2">
                            <FiTrash2 size={16} />
                            Delete Product
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;