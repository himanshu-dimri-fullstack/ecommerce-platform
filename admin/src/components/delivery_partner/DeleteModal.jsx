import React from 'react'

const DeleteModal = (
    {
        setShowDeleteModal,
        setDeleteId,
        handleDeletePartner,
    }
) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

                <div className="p-6 text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                        <FiTrash2 size={28} />
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-slate-800">
                        Delete Delivery Partner?
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Are you sure you want to delete this delivery partner?
                        This action cannot be undone.
                    </p>

                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">

                    <button
                        type="button"
                        onClick={() => {
                            setShowDeleteModal(false);
                            setDeleteId(null);
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleDeletePartner}
                        className="rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
                    >
                        Yes, Delete
                    </button>

                </div>

            </div>

        </div>
    )
}

export default DeleteModal