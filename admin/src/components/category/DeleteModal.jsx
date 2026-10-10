import React from 'react'
import { FiTrash2 } from "react-icons/fi";

const DeleteModal = ({ handleDeleteUser, setShowDeleteModal }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

                {/* Header */}
                <div className="mb-5 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                        <FiTrash2 className="text-2xl text-red-600" />
                    </div>

                    <h2 className="text-xl font-bold text-gray-800">
                        Delete User?
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Are you sure you want to delete this user?
                        This action cannot be undone.
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowDeleteModal(false)}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleDeleteUser}
                        className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>

            </div>
        </div>
    )
}

export default DeleteModal