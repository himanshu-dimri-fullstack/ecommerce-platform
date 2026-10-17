import { FiX, FiMapPin } from "react-icons/fi";

const FormModal = (
    {
        isEdit,
        setShowModal,
        resetForm,
        handleEditStore,
        handleAddStore,
        formData,
        handleChange,
        managers,
        inputClass,
    }
) => {
    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    setShowModal(false);
                    resetForm();
                }
            }}
        >
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {isEdit ? "Edit Store" : "Add Store"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Enter store information below.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setShowModal(false);
                            resetForm();
                        }}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                    >
                        <FiX size={21} />
                    </button>
                </div>

                <form
                    onSubmit={
                        isEdit ? handleEditStore : handleAddStore
                    }
                    className="space-y-5 p-6"
                >
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        {/* STORE NAME */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Store Name *
                            </label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Jaipur Central Store"
                                className={inputClass}
                                required
                            />
                        </div>

                        {/* STORE CODE */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Store Code *
                            </label>
                            <input
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                placeholder="e.g. JPR001"
                                className={inputClass}
                                required
                            />
                        </div>

                        {/* MANAGER */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Store Manager *
                            </label>
                            <select
                                name="manager"
                                value={formData.manager}
                                onChange={handleChange}
                                className={inputClass}
                                required
                            >
                                <option value="">
                                    Select manager
                                </option>

                                {managers.map((manager) => (
                                    <option
                                        key={manager._id}
                                        value={manager._id}
                                    >
                                        {`${manager.firstName}` + " " + `${manager.lastName}`}
                                    </option>
                                ))}
                            </select>

                            {managers.length === 0 && (
                                <p className="mt-1 text-xs text-amber-600">
                                    No eligible managers found. Check the
                                    users API and role field.
                                </p>
                            )}
                        </div>

                        {/* PHONE */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                                className={inputClass}
                                required
                            />
                        </div>

                        {/* SERVICE RADIUS */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Service Radius (km) *
                            </label>
                            <input
                                type="number"
                                name="serviceRadius"
                                value={formData.serviceRadius}
                                onChange={handleChange}
                                min="0"
                                step="any"
                                className={inputClass}
                                required
                            />
                        </div>
                    </div>

                    {/* ADDRESS */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Store Address *
                        </label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter complete store address"
                            rows={3}
                            className={`${inputClass} resize-y`}
                            required
                        />
                    </div>

                    {/* GEOLOCATION */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <FiMapPin
                                className="text-[#003963]"
                                size={19}
                            />
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800">
                                    Store Coordinates
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Optional. Enter both values to save a
                                    GeoJSON Point.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Longitude
                                </label>
                                <input
                                    type="number"
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    min="-180"
                                    max="180"
                                    step="any"
                                    placeholder="e.g. 75.7873"
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Latitude
                                </label>
                                <input
                                    type="number"
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    min="-90"
                                    max="90"
                                    step="any"
                                    placeholder="e.g. 26.9124"
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <p className="mt-3 text-xs text-slate-500">
                            GeoJSON coordinates are stored as
                            [longitude, latitude].
                        </p>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                setShowModal(false);
                                resetForm();
                            }}
                            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="rounded-xl bg-[#003963] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002b4b] active:scale-95"
                        >
                            {isEdit ? "Update Store" : "Create Store"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default FormModal