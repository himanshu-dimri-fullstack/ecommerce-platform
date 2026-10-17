import {
    FiX,
    FiPackage,
    FiTag,
    FiDollarSign,
    FiImage,
} from "react-icons/fi";

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#003963] focus:bg-white focus:ring-2 focus:ring-[#003963]/10";

const labelClass =
    "mb-1.5 block text-sm font-medium text-slate-700";

const FormModal = ({
    isEdit,
    setShowModal,
    resetForm,
    handleEditVariant,
    handleAddVariant,
    formData,
    handleChange,
    products,
    existingImages,
    setExistingImages,
    setFormData,
}) => {
    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowModal(false)}>
            <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}>

                {/* MODAL HEADER */}
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {isEdit ? "Edit Product Variant" : "Add Product Variant"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Enter the variant details and pricing.
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
                        <FiX size={22} />
                    </button>
                </div>

                {/* MODAL FORM */}
                <form
                    onSubmit={isEdit ? handleEditVariant : handleAddVariant}
                    className="overflow-y-auto"
                >
                    <div className="space-y-6 p-6">

                        {/* BASIC INFORMATION */}
                        <section>
                            <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-800">
                                <FiPackage className="text-[#003963]" size={19} />
                                Basic Information
                            </h3>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                <div className="md:col-span-2">
                                    <label className={labelClass}>
                                        Product *
                                    </label>

                                    <select
                                        name="product"
                                        value={formData.product}
                                        onChange={handleChange}
                                        required
                                        className={inputClass}
                                    >
                                        <option value="">
                                            Select Product
                                        </option>

                                        {products.map((product) => (
                                            <option
                                                key={product._id}
                                                value={product._id}
                                            >
                                                {product.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Variant Name *
                                    </label>

                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. 500ml, Large, 1kg"
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Barcode
                                    </label>

                                    <input
                                        name="barcode"
                                        value={formData.barcode}
                                        onChange={handleChange}
                                        placeholder="Enter barcode"
                                        className={inputClass}
                                    />
                                </div>

                            </div>
                        </section>

                        {/* UNIT INFORMATION */}
                        <section>
                            <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-800">
                                <FiTag className="text-[#003963]" size={19} />
                                Unit Information
                            </h3>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                <div>
                                    <label className={labelClass}>
                                        Unit Value *
                                    </label>

                                    <input
                                        type="number"
                                        name="unitValue"
                                        value={formData.unitValue}
                                        onChange={handleChange}
                                        min="0.01"
                                        step="any"
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Unit *
                                    </label>

                                    <select
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleChange}
                                        required
                                        className={inputClass}
                                    >
                                        {[
                                            "piece",
                                            "pack",
                                            "box",
                                            "set",
                                            "pair",
                                            "kg",
                                            "g",
                                            "mg",
                                            "l",
                                            "ml",
                                            "cm",
                                            "m",
                                        ].map((unit) => (
                                            <option key={unit} value={unit}>
                                                {unit}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* PRICING */}
                        <section>
                            <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-800">
                                <FiDollarSign className="text-[#003963]" size={19} />
                                Pricing
                            </h3>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                                <div>
                                    <label className={labelClass}>
                                        MRP (₹) *
                                    </label>

                                    <input
                                        type="number"
                                        name="mrp"
                                        value={formData.mrp}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Selling Price (₹) *
                                    </label>

                                    <input
                                        type="number"
                                        name="sellingPrice"
                                        value={formData.sellingPrice}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Discount (%)
                                    </label>

                                    <input
                                        type="number"
                                        name="discountPercentage"
                                        value={formData.discountPercentage}
                                        readOnly
                                        className={`${inputClass} cursor-not-allowed bg-slate-100`}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* WEIGHT & DIMENSIONS */}
                        <section>
                            <h3 className="mb-4 font-semibold text-slate-800">
                                Weight & Dimensions
                            </h3>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                                <div>
                                    <label className={labelClass}>
                                        Weight
                                    </label>

                                    <input
                                        type="number"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        min="0"
                                        step="any"
                                        placeholder="Weight"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Length
                                    </label>

                                    <input
                                        type="number"
                                        name="length"
                                        value={formData.length}
                                        onChange={handleChange}
                                        min="0"
                                        step="any"
                                        placeholder="Length"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Width
                                    </label>

                                    <input
                                        type="number"
                                        name="width"
                                        value={formData.width}
                                        onChange={handleChange}
                                        min="0"
                                        step="any"
                                        placeholder="Width"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Height
                                    </label>

                                    <input
                                        type="number"
                                        name="height"
                                        value={formData.height}
                                        onChange={handleChange}
                                        min="0"
                                        step="any"
                                        placeholder="Height"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <p className="mt-2 text-xs text-slate-400">
                                Use a consistent unit for weight and dimensions
                                throughout your application.
                            </p>
                        </section>

                        {/* IMAGES */}
                        <section>
                            <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-800">
                                <FiImage className="text-[#003963]" size={19} />
                                Variant Images
                            </h3>

                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-[#003963] hover:bg-blue-50/50">
                                <FiImage
                                    size={30}
                                    className="mb-3 text-slate-400"
                                />

                                <span className="text-sm font-semibold text-slate-700">
                                    Choose variant images
                                </span>

                                <span className="mt-1 text-xs text-slate-400">
                                    Select one or more image files
                                </span>

                                <input
                                    type="file"
                                    name="images"
                                    accept="image/*"
                                    multiple
                                    onChange={handleChange}
                                    className="hidden"
                                />
                            </label>

                            {/* EXISTING IMAGES */}
                            {existingImages.length > 0 && (
                                <div className="mt-4">
                                    <p className="mb-3 text-sm font-medium text-slate-700">
                                        Existing Images
                                    </p>

                                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                                        {existingImages.map((image, index) => {
                                            const imageUrl =
                                                typeof image === "string"
                                                    ? image
                                                    : image?.url;

                                            return (
                                                <div
                                                    key={imageUrl || index}
                                                    className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200"
                                                >
                                                    {imageUrl && (
                                                        <img
                                                            src={imageUrl}
                                                            alt={`Variant ${index + 1}`}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    )}

                                                    <button
                                                        type="button"
                                                        title="Remove image"
                                                        onClick={() =>
                                                            setExistingImages((prev) =>
                                                                prev.filter(
                                                                    (_, i) => i !== index
                                                                )
                                                            )
                                                        }
                                                        className="absolute right-1 top-1 rounded-lg bg-red-500 p-1.5 text-white opacity-100 transition hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                                                    >
                                                        <FiX size={15} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* NEW IMAGE PREVIEWS */}
                            {formData.images.length > 0 && (
                                <div className="mt-4">
                                    <p className="mb-3 text-sm font-medium text-slate-700">
                                        Selected Images
                                    </p>

                                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                                        {formData.images.map((image, index) => (
                                            <div
                                                key={`${image.name}-${index}`}
                                                className="relative aspect-square overflow-hidden rounded-xl border border-slate-200"
                                            >
                                                <img
                                                    src={URL.createObjectURL(image)}
                                                    alt={image.name}
                                                    className="h-full w-full object-cover"
                                                />

                                                <button
                                                    type="button"
                                                    title="Remove selected image"
                                                    onClick={() =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            images: prev.images.filter(
                                                                (_, i) => i !== index
                                                            ),
                                                        }))
                                                    }
                                                    className="absolute right-1 top-1 rounded-lg bg-red-500 p-1.5 text-white hover:bg-red-600"
                                                >
                                                    <FiX size={15} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* MODAL FOOTER */}
                    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-6 py-4 sm:flex-row sm:justify-end">
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
                            className="rounded-xl bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002b4b] active:scale-95"
                        >
                            {isEdit ? "Update Variant" : "Add Variant"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default FormModal