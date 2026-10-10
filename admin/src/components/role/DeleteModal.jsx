import React from "react";
import { FiTrash2, FiShield } from "react-icons/fi";

const DeleteModal = ({ handleDeleteRole, setShowDeleteModal }) => {
    return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"> <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

        {/* Header */}
        <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <FiTrash2 className="text-2xl text-red-600" />
            </div>

            <h2 className="text-xl font-bold text-gray-800">
                Delete Role?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
                Are you sure you want to delete this role?
                All permissions associated with this role may be affected.
                This action cannot be undone.
            </p>
        </div>

        {/* Role Warning */}
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-3">
            <FiShield className="mt-0.5 shrink-0 text-lg text-red-600" />

            <p className="text-sm text-red-700">
                Please make sure this role is not assigned to any users
                before deleting it.
            </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
            <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-100"
            >
                Cancel
            </button>

            <button
                type="button"
                onClick={handleDeleteRole}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700"
            >
                Delete Role
            </button>
        </div>

    </div>
    </div>
    );

};

export default DeleteModal;
