import { useEffect, useState } from "react";
import {
    FiX,
    FiPackage,
    FiTag,
    FiFileText,
    FiImage,
    FiPlus,
    FiEdit2,
    FiGrid,
    FiLayers,
    FiAward,
    FiBox,
    FiStar,
    FiSearch,
    FiChevronLeft,
    FiChevronRight,
} from "react-icons/fi";
import { API } from "../../api/axios";

// REUSABLE SEARCH + PAGINATION HOOK
const usePaginatedDropdown = ({
    endpoint,
    responseKey,
    category = "",
    selectedOption = null,
}) => {
    const [options, setOptions] = useState([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);

    // SEARCH DEBOUNCE
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    // RESET SUBCATEGORY SEARCH WHEN CATEGORY CHANGES
    useEffect(() => {
        if (endpoint === "/subcategory/get") {
            setSearch("");
            setDebouncedSearch("");
            setPage(1);
        }
    }, [category, endpoint]);

    // FETCH OPTIONS
    useEffect(() => {
        let isMounted = true;

        const fetchOptions = async () => {
            try {
                setLoading(true);

                const params = {
                    page,
                    limit: 10,
                    search: debouncedSearch,
                };

                if (endpoint === "/subcategory/get" && category) {
                    params.category = category;
                }

                const res = await API.get(endpoint, { params });

                if (!isMounted) return;

                setOptions(res.data[responseKey] || []);
                setTotalPages(res.data.totalPages || 0);
            } catch (error) {
                if (!isMounted) return;

                console.error(
                    `Failed to fetch ${responseKey}:`,
                    error
                );

                setOptions([]);
                setTotalPages(0);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchOptions();

        return () => {
            isMounted = false;
        };
    }, [
        endpoint,
        responseKey,
        category,
        page,
        debouncedSearch,
    ]);

    // KEEP EDIT MODE SELECTED OPTION VISIBLE
    const finalOptions = [...options];

    if (
        selectedOption?._id &&
        !finalOptions.some(
            (option) =>
                String(option._id) === String(selectedOption._id)
        )
    ) {
        finalOptions.unshift(selectedOption);
    }

    return {
        options: finalOptions,
        search,
        setSearch,
        page,
        setPage,
        totalPages,
        loading,
    };
};

// REUSABLE SEARCHABLE PAGINATED SELECT
const SearchableDropdown = ({
    label,
    icon: Icon,
    name,
    value,
    onChange,
    options,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    loading,
    placeholder,
    disabled = false,
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>

            <div className="relative">
                <Icon
                    size={17}
                    className="absolute left-3 top-3.5 z-10 text-slate-400"
                />

                <select
                    name={name}
                    value={value || ""}
                    onChange={onChange}
                    disabled={disabled}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#003963] focus:ring-2 focus:ring-[#003963]/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                    <option value="">
                        {disabled
                            ? "Select category first"
                            : placeholder}
                    </option>

                    {options.map((option) => (
                        <option
                            key={option._id}
                            value={option._id}
                        >
                            {option.name}
                        </option>
                    ))}
                </select>
            </div>

            {!disabled && (
                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                    <div className="relative">
                        <FiSearch
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={`Search ${label.toLowerCase()}...`}
                            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#003963] focus:ring-2 focus:ring-[#003963]/10"
                        />
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-500">
                            {loading
                                ? "Loading..."
                                : `Page ${page} of ${totalPages || 0}`}
                        </span>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={page <= 1 || loading}
                                onClick={() =>
                                    setPage((prev) => Math.max(1, prev - 1))
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-[#003963] hover:text-[#003963] disabled:cursor-not-allowed disabled:opacity-40"
                                title="Previous page"
                            >
                                <FiChevronLeft size={15} />
                            </button>

                            <button
                                type="button"
                                disabled={
                                    page >= totalPages ||
                                    totalPages === 0 ||
                                    loading
                                }
                                onClick={() =>
                                    setPage((prev) =>
                                        Math.min(totalPages, prev + 1)
                                    )
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-[#003963] hover:text-[#003963] disabled:cursor-not-allowed disabled:opacity-40"
                                title="Next page"
                            >
                                <FiChevronRight size={15} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const FormModal = ({
    setShowModal,
    handleAddProduct,
    handleEditProduct,
    formData,
    handleChange,
    isEdit,
    tagInput,
    setTagInput,
    setFormData,
    existingImages,
    setExistingImages,
    selectedOptions,
}) => {
    const images = existingImages || [];
    const selectedImages = formData?.images || [];

    // CATEGORY DROPDOWN
    const categoryDropdown = usePaginatedDropdown({
        endpoint: "/category/get",
        responseKey: "categories",
        selectedOption: selectedOptions?.category,
    });

    // SUBCATEGORY DROPDOWN
    const subcategoryDropdown = usePaginatedDropdown({
        endpoint: "/subcategory/get",
        responseKey: "subcategories",
        category: formData.category || "",
        selectedOption: selectedOptions?.subcategory,
    });

    // BRAND DROPDOWN
    const brandDropdown = usePaginatedDropdown({
        endpoint: "/brand/get",
        responseKey: "brands",
        selectedOption: selectedOptions?.brand,
    });

    // CLOSE MODAL
    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div
                onClick={(e) => e.stopPropagation()}
                className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
                {/* HEADER */}
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-5">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {isEdit ? "Update Product" : "Add New Product"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {isEdit
                                ? "Update product information and images."
                                : "Add a new product to your catalogue."}
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

                {/* SCROLLABLE FORM */}
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <form
                        id="product-form"
                        onSubmit={
                            isEdit
                                ? handleEditProduct
                                : handleAddProduct
                        }
                        className="space-y-5 p-6"
                    >
                        {/* PRODUCT NAME */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Product Name *
                            </label>

                            <div className="relative">
                                <FiPackage
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name || ""}
                                    onChange={handleChange}
                                    placeholder="Enter product name"
                                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#003963] focus:ring-2 focus:ring-[#003963]/10"
                                />
                            </div>
                        </div>

                        {/* CATEGORY & SUBCATEGORY */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <SearchableDropdown
                                label="Category *"
                                icon={FiGrid}
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="Select category"
                                {...categoryDropdown}
                            />

                            <SearchableDropdown
                                label="Subcategory"
                                icon={FiLayers}
                                name="subcategory"
                                value={formData.subcategory}
                                onChange={handleChange}
                                placeholder="Select subcategory"
                                disabled={!formData.category}
                                {...subcategoryDropdown}
                            />
                        </div>

                        {/* BRAND */}
                        <SearchableDropdown
                            label="Brand *"
                            icon={FiAward}
                            name="brand"
                            value={formData.brand}
                            onChange={handleChange}
                            placeholder="Select brand"
                            {...brandDropdown}
                        />

                        {/* DESCRIPTION */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Description
                            </label>

                            <div className="relative">
                                <FiFileText
                                    size={18}
                                    className="absolute left-3 top-3 text-slate-400"
                                />

                                <textarea
                                    name="description"
                                    value={formData.description || ""}
                                    onChange={handleChange}
                                    placeholder="Enter product description"
                                    rows={4}
                                    className="w-full resize-y rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#003963] focus:ring-2 focus:ring-[#003963]/10"
                                />
                            </div>
                        </div>

                        {/* UNIT */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Unit
                            </label>

                            <div className="relative">
                                <FiBox
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="text"
                                    name="unit"
                                    value={formData.unit || ""}
                                    onChange={handleChange}
                                    placeholder="e.g. Piece, Set, Box"
                                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#003963] focus:ring-2 focus:ring-[#003963]/10"
                                />
                            </div>
                        </div>

                        {/* TAGS */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Tags
                            </label>

                            <div className="relative">
                                <FiTag
                                    size={18}
                                    className="absolute left-3 top-3 text-slate-400"
                                />

                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) =>
                                        setTagInput(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === " " ||
                                            e.key === "Enter"
                                        ) {
                                            e.preventDefault();

                                            const newTag = tagInput.trim();

                                            if (
                                                newTag &&
                                                !formData.tags.some(
                                                    (tag) =>
                                                        tag.toLowerCase() ===
                                                        newTag.toLowerCase()
                                                )
                                            ) {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    tags: [
                                                        ...prev.tags,
                                                        newTag,
                                                    ],
                                                }));
                                            }

                                            setTagInput("");
                                        }

                                        if (
                                            e.key === "Backspace" &&
                                            !tagInput &&
                                            formData.tags.length > 0
                                        ) {
                                            setFormData((prev) => ({
                                                ...prev,
                                                tags: prev.tags.slice(0, -1),
                                            }));
                                        }
                                    }}
                                    placeholder="Type a tag and press Space"
                                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#003963] focus:ring-2 focus:ring-[#003963]/10"
                                />
                            </div>

                            {formData.tags.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {formData.tags.map((tag, index) => (
                                        <span
                                            key={`${tag}-${index}`}
                                            className="inline-flex items-center gap-1.5 rounded-full border border-[#003963]/10 bg-[#003963]/5 px-3 py-1.5 text-sm font-medium text-[#003963]"
                                        >
                                            {tag}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        tags: prev.tags.filter(
                                                            (_, i) => i !== index
                                                        ),
                                                    }))
                                                }
                                                className="rounded-full p-0.5 transition hover:bg-[#003963]/10"
                                                aria-label={`Remove ${tag} tag`}
                                            >
                                                <FiX size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            <p className="mt-1.5 text-xs text-slate-400">
                                Press Space or Enter to add a tag. Click × to remove it.
                            </p>
                        </div>

                        {/* PRODUCT IMAGES */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Product Images {!isEdit && "*"}
                            </label>

                            {/* EXISTING IMAGES */}
                            {isEdit && images.length > 0 && (
                                <div className="mb-4">
                                    <p className="mb-2 text-xs font-semibold text-slate-500">
                                        Current Images
                                    </p>

                                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                                        {images.map((image, index) => {
                                            const imageUrl =
                                                typeof image === "string"
                                                    ? image
                                                    : image.url;

                                            return (
                                                <div
                                                    key={
                                                        image._id ||
                                                        image.public_id ||
                                                        imageUrl ||
                                                        index
                                                    }
                                                    className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                                                >
                                                    <img
                                                        src={imageUrl}
                                                        alt={`${formData.name || "Product"} ${index + 1}`}
                                                        className="h-24 w-full object-contain"
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setExistingImages(
                                                                (prevImages) =>
                                                                    prevImages.filter(
                                                                        (_, i) =>
                                                                            i !== index
                                                                    )
                                                            );
                                                        }}
                                                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition hover:bg-red-700"
                                                        title="Remove image"
                                                        aria-label={`Remove image ${index + 1}`}
                                                    >
                                                        <FiX size={16} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <p className="mt-2 text-xs text-slate-500">
                                        Upload new images to add them to the product.
                                        Remove existing images using the delete button.
                                    </p>
                                </div>
                            )}

                            {/* UPLOAD BOX */}
                            <div className="relative flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-[#003963]/40 hover:bg-slate-100">
                                <FiImage
                                    size={26}
                                    className="mb-2 text-slate-400"
                                />

                                <p className="text-sm font-medium text-slate-600">
                                    Upload product images
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    JPG, JPEG, PNG, WEBP or AVIF
                                </p>

                                <input
                                    type="file"
                                    name="images"
                                    accept="image/jpeg,image/png,image/webp,image/avif"
                                    multiple
                                    onChange={handleChange}
                                    className="absolute inset-0 cursor-pointer opacity-0"
                                />
                            </div>

                            {/* SELECTED FILES */}
                            {selectedImages.length > 0 && (
                                <div className="mt-3 grid grid-cols-4 gap-3">
                                    {selectedImages.map((image, index) => (
                                        <div key={`${image.name}-${index}`}>
                                            <img
                                                src={URL.createObjectURL(image)}
                                                alt={image.name}
                                                className="h-20 w-full border border-[#eee] object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* PRODUCT OPTIONS */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    checked={Boolean(formData.isFeatured)}
                                    onChange={handleChange}
                                    className="h-4 w-4 accent-[#003963]"
                                />

                                <FiStar
                                    size={18}
                                    className="text-amber-500"
                                />

                                <div>
                                    <p className="text-sm font-semibold text-slate-700">
                                        Featured Product
                                    </p>

                                    <p className="text-xs text-slate-400">
                                        Highlight this product
                                    </p>
                                </div>
                            </label>
                        </div>
                    </form>
                </div>

                {/* FOOTER */}
                <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        form="product-form"
                        className="flex items-center gap-2 rounded-xl bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                        {isEdit ? (
                            <>
                                <FiEdit2 size={18} />
                                Update Product
                            </>
                        ) : (
                            <>
                                <FiPlus size={18} />
                                Add Product
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FormModal;