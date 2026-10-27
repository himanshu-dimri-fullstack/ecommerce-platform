import { FiTrash2 } from "react-icons/fi";

const DeleteModal = ({ setShowDeleteModal, handleDeleteInventory, setDeleteId }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <FiTrash2 size={23} />
                </div>

                <h2 className="mt-4 text-xl font-bold text-slate-800">
                    Delete Inventory?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                    Are you sure you want to delete this inventory
                    record? This action cannot be undone.
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            setShowDeleteModal(false);
                            setDeleteId(null);
                        }}
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleDeleteInventory}
                        className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteModal