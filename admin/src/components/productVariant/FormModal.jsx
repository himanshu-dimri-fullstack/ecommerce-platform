import { useState } from "react";

import {
    FiX,
    FiPackage,
    FiTag,
    FiDollarSign,
    FiImage,
    FiSearch,
    FiChevronDown,
    FiChevronLeft,
    FiChevronRight,
    FiCheckCircle,
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

    // PRODUCT DROPDOWN PROPS
    handleProductChange,
    products,
    productSearch,
    setProductSearch,
    productPage,
    setProductPage,
    productTotalPages,
    productLoading,
    selectedProduct,

    // IMAGE PROPS
    existingImages,
    setExistingImages,
    setFormData,
}) => {
    const [showProductDropdown, setShowProductDropdown] = useState(false);

    // PRESERVE SELECTED PRODUCT EVEN IF IT IS NOT ON CURRENT PAGE
    const currentSelectedProduct =
        products.find(
            (product) => product._id === formData.product
        ) ||
        (selectedProduct?._id === formData.product
            ? selectedProduct
            : null);

    // CLOSE MODAL
    const closeModal = () => {
        setShowModal(false);
        setShowProductDropdown(false);
        resetForm();
    };

    // SELECT PRODUCT
    const selectProduct = (product) => {
        handleProductChange({
            target: {
                value: product._id,
            },
        });

        setShowProductDropdown(false);
    };

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
            onClick={closeModal}
        >
            <div
                className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >

                {/* MODAL HEADER */}
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {isEdit
                                ? "Edit Product Variant"
                                : "Add Product Variant"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Enter the variant details and pricing.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={closeModal}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                    >
                        <FiX size={22} />
                    </button>
                </div>

                {/* MODAL FORM */}
                <form
                    onSubmit={
                        isEdit
                            ? handleEditVariant
                            : handleAddVariant
                    }
                    className="overflow-y-auto"
                >
                    <div className="space-y-6 p-6">

                        {/* BASIC INFORMATION */}
                        <section>
                            <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-800">
                                <FiPackage
                                    className="text-[#003963]"
                                    size={19}
                                />
                                Basic Information
                            </h3>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                {/* SEARCHABLE PRODUCT DROPDOWN */}
                                <div className="relative md:col-span-2">
                                    <label className={labelClass}>
                                        Product *
                                    </label>

                                    {/* SELECTED PRODUCT BUTTON */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowProductDropdown((prev) => !prev)
                                        }
                                        className={`${inputClass} flex items-center justify-between text-left`}
                                    >
                                        <span
                                            className={
                                                currentSelectedProduct
                                                    ? "text-slate-800"
                                                    : "text-slate-400"
                                            }
                                        >
                                            {currentSelectedProduct?.name ||
                                                "Select Product"}
                                        </span>

                                        <FiChevronDown
                                            size={18}
                                            className={`text-slate-400 transition ${showProductDropdown
                                                    ? "rotate-180"
                                                    : ""
                                                }`}
                                        />
                                    </button>

                                    {/* DROPDOWN PANEL */}
                                    {showProductDropdown && (
                                        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

                                            {/* SEARCH INPUT */}
                                            <div className="border-b border-slate-100 p-3">
                                                <div className="relative">
                                                    <FiSearch
                                                        size={17}
                                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                    />

                                                    <input
                                                        type="text"
                                                        value={productSearch}
                                                        onChange={(e) =>
                                                            setProductSearch(e.target.value)
                                                        }
                                                        placeholder="Search products..."
                                                        className={`${inputClass} pl-9`}
                                                        autoComplete="off"
                                                    />

                                                    {productSearch && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setProductSearch("")
                                                            }
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                                                            title="Clear search"
                                                        >
                                                            <FiX size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* PRODUCT LIST */}
                                            <div className="max-h-64 overflow-y-auto p-2">

                                                {productLoading ? (
                                                    <div className="py-8 text-center">
                                                        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-[#047857]" />

                                                        <p className="mt-3 text-sm text-slate-400">
                                                            Loading products...
                                                        </p>
                                                    </div>
                                                ) : products.length > 0 ? (
                                                    products.map((product) => (
                                                        <button
                                                            key={product._id}
                                                            type="button"
                                                            onClick={() =>
                                                                selectProduct(product)
                                                            }
                                                            className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left text-sm transition hover:bg-slate-50 ${formData.product === product._id
                                                                    ? "bg-emerald-50 font-semibold text-[#047857]"
                                                                    : "text-slate-700"
                                                                }`}
                                                        >
                                                            <span className="min-w-0 truncate">
                                                                {product.name}
                                                            </span>

                                                            {formData.product === product._id && (
                                                                <FiCheckCircle
                                                                    size={17}
                                                                    className="shrink-0 text-[#047857]"
                                                                />
                                                            )}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="py-8 text-center">
                                                        <FiPackage
                                                            size={28}
                                                            className="mx-auto text-slate-300"
                                                        />

                                                        <p className="mt-2 text-sm font-medium text-slate-600">
                                                            No products found
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            Try another product name.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* PRODUCT PAGINATION */}
                                            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-3 py-3">

                                                <span className="text-xs text-slate-500">
                                                    Page{" "}
                                                    <span className="font-semibold text-slate-700">
                                                        {productTotalPages > 0
                                                            ? productPage
                                                            : 0}
                                                    </span>{" "}
                                                    of{" "}
                                                    <span className="font-semibold text-slate-700">
                                                        {productTotalPages}
                                                    </span>
                                                </span>

                                                <div className="flex items-center gap-2">

                                                    {/* PREVIOUS */}
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            productPage <= 1 ||
                                                            productLoading
                                                        }
                                                        onClick={() =>
                                                            setProductPage((prev) =>
                                                                Math.max(1, prev - 1)
                                                            )
                                                        }
                                                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                                        title="Previous page"
                                                    >
                                                        <FiChevronLeft size={17} />
                                                    </button>

                                                    {/* NEXT */}
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            productPage >= productTotalPages ||
                                                            productLoading ||
                                                            productTotalPages === 0
                                                        }
                                                        onClick={() =>
                                                            setProductPage((prev) =>
                                                                Math.min(
                                                                    productTotalPages,
                                                                    prev + 1
                                                                )
                                                            )
                                                        }
                                                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                                        title="Next page"
                                                    >
                                                        <FiChevronRight size={17} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* VARIANT NAME */}
                                <div>
                                    <label className={labelClass}>
                                        Variant Name *
                                    </label>

                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. 500ml, Large, 1kg"
                                        className={inputClass}
                                    />
                                </div>

                                {/* BARCODE */}
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
                                <FiTag
                                    className="text-[#003963]"
                                    size={19}
                                />
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
                                            <option
                                                key={unit}
                                                value={unit}
                                            >
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
                                <FiDollarSign
                                    className="text-[#003963]"
                                    size={19}
                                />
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
                                <FiImage
                                    className="text-[#003963]"
                                    size={19}
                                />
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
                            onClick={closeModal}
                            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="rounded-xl bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002b4b] active:scale-95"
                        >
                            {isEdit
                                ? "Update Variant"
                                : "Add Variant"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormModal;