import React from "react";
import {
    FiTruck,
    FiX,
    FiUser,
    FiShield,
    FiMail,
} from "react-icons/fi";

const FormModal = ({
    isEdit,
    setShowModal,
    formData,
    handleChange,
    handleEditPartner,
    handleAddPartner,
    submitting,
    availableUsers = [],
    loadingUsers = false,
}) => {
    // Find selected user for edit mode
    const selectedUser = availableUsers.find(
        (user) => user._id === formData.user
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">

            <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* MODAL HEADER */}

                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {isEdit
                                ? "Edit Delivery Partner"
                                : "Add Delivery Partner"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {isEdit
                                ? "Update delivery partner vehicle details."
                                : "Register a new delivery partner."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        disabled={submitting}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                    >
                        <FiX size={21} />
                    </button>

                </div>

                {/* MODAL FORM */}

                <form
                    onSubmit={isEdit ? handleEditPartner : handleAddPartner}
                    className="space-y-5 p-6"
                >

                    {/* USER SELECTION */}

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            {isEdit ? "Linked User" : "Select Delivery Partner User"}
                            <span className="ml-1 text-red-500">*</span>
                        </label>

                        {isEdit ? (
                            <div className="rounded-xl border border-slate-200 bg-slate-100 p-4">

                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                        <FiUser size={20} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-800">
                                            {formData.userName || "Linked User"}
                                        </p>

                                        <p className="truncate text-xs text-slate-500">
                                            {formData.userEmail || formData.user}
                                        </p>
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <>
                                <div className="relative">
                                    <FiUser
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                        size={18}
                                    />

                                    <select
                                        name="user"
                                        value={formData.user}
                                        onChange={handleChange}
                                        disabled={loadingUsers || submitting}
                                        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <option value="">
                                            {loadingUsers
                                                ? "Loading users..."
                                                : availableUsers.length === 0
                                                    ? "No available delivery partner users"
                                                    : "Select a user"}
                                        </option>

                                        {availableUsers.map((user) => (
                                            <option
                                                key={user._id}
                                                value={user._id}
                                            >
                                                {user.firstName} {user.lastName || ""} - {user.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <p className="mt-2 text-xs text-slate-400">
                                    Only users with the delivery partner role who are not already registered are displayed.
                                </p>

                                {!loadingUsers && availableUsers.length === 0 && (
                                    <p className="mt-2 text-xs font-medium text-amber-600">
                                        No eligible users found. Please create a user with the delivery partner role first.
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                    {/* VEHICLE TYPE */}

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Vehicle Type
                            <span className="ml-1 text-red-500">*</span>
                        </label>

                        <div className="relative">
                            <FiTruck
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                size={18}
                            />

                            <select
                                name="vehicleType"
                                value={formData.vehicleType}
                                onChange={handleChange}
                                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                            >
                                <option value="bike">Bike</option>
                                <option value="scooter">Scooter</option>
                                <option value="cycle">Cycle</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* VEHICLE NUMBER */}

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Vehicle Number
                            <span className="ml-1 text-red-500">*</span>
                        </label>

                        <input
                            type="text"
                            name="vehicleNumber"
                            value={formData.vehicleNumber}
                            onChange={handleChange}
                            placeholder="e.g. DL01AB1234"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm uppercase text-slate-700 outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        />
                    </div>

                    {/* LICENSE NUMBER */}

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Driving License Number
                            <span className="ml-1 text-red-500">*</span>
                        </label>

                        <div className="relative">
                            <FiShield
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                size={18}
                            />

                            <input
                                type="text"
                                name="drivingLicenseNumber"
                                value={formData.drivingLicenseNumber}
                                onChange={handleChange}
                                placeholder="Enter driving license number"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm uppercase text-slate-700 outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                            />
                        </div>
                    </div>

                    {/* MODAL FOOTER */}

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            disabled={submitting}
                            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                submitting ||
                                (!isEdit && (loadingUsers || availableUsers.length === 0))
                            }
                            className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting
                                ? "Please wait..."
                                : isEdit
                                    ? "Update Partner"
                                    : "Add Partner"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default FormModal;