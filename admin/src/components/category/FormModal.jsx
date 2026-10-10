import {
    FiX,
    FiTag,
    FiFileText,
    FiImage,
    FiPlus,
    FiEdit2,
} from "react-icons/fi";

const FormModal = ({
    setShowModal,
    handleAddCategory,
    handleEditCategory,
    formData,
    handleChange,
    isEdit,
}) => {
    const existingImage = formData?.existingImage;

    return (
        <div
            className="
                fixed inset-0 z-100
                flex items-center justify-center
                bg-black/50
                p-4
                backdrop-blur-sm
            "
            onClick={() => setShowModal(false)}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="
                    flex
                    w-full
                    max-w-lg
                    max-h-[90vh]
                    flex-col
                    overflow-hidden
                    rounded-2xl
                    bg-white
                    shadow-2xl
                "
            >

                {/* HEADER */}

                <div
                    className="
                        flex
                        shrink-0
                        items-center
                        justify-between
                        border-b
                        border-slate-200
                        px-6
                        py-5
                    "
                >

                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {isEdit
                                ? "Update Category"
                                : "Add New Category"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {isEdit
                                ? "Update category information and image."
                                : "Create a new product category."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="
                            rounded-lg
                            p-2
                            text-slate-500
                            transition
                            hover:bg-slate-100
                        "
                    >
                        <FiX size={22} />
                    </button>

                </div>


                {/* SCROLLABLE FORM */}

                <div
                    className="
                        min-h-0
                        flex-1
                        overflow-y-auto
                    "
                >

                    <form
                        id="category-form"
                        onSubmit={
                            isEdit
                                ? handleEditCategory
                                : handleAddCategory
                        }
                        className="space-y-5 p-6"
                    >

                        {/* CATEGORY NAME */}

                        <div>

                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Category Name
                            </label>

                            <div className="relative">

                                <FiTag
                                    size={18}
                                    className="
                                        absolute left-3 top-1/2
                                        -translate-y-1/2
                                        text-slate-400
                                    "
                                />

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter category name"
                                    required
                                    className="
                                        w-full
                                        rounded-xl
                                        border border-slate-200
                                        py-2.5
                                        pl-10
                                        pr-4
                                        text-sm
                                        text-slate-700
                                        outline-none
                                        transition
                                        placeholder:text-slate-400
                                        focus:border-[#003963]
                                        focus:ring-2
                                        focus:ring-[#003963]/10
                                    "
                                />

                            </div>

                        </div>


                        {/* DESCRIPTION */}

                        <div>

                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Description
                            </label>

                            <div className="relative">

                                <FiFileText
                                    size={18}
                                    className="
                                        absolute left-3 top-3
                                        text-slate-400
                                    "
                                />

                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter category description"
                                    rows={4}
                                    className="
                                        w-full
                                        resize-none
                                        rounded-xl
                                        border border-slate-200
                                        py-2.5
                                        pl-10
                                        pr-4
                                        text-sm
                                        text-slate-700
                                        outline-none
                                        transition
                                        placeholder:text-slate-400
                                        focus:border-[#003963]
                                        focus:ring-2
                                        focus:ring-[#003963]/10
                                    "
                                />

                            </div>

                        </div>


                        {/* CATEGORY IMAGE */}

                        <div>

                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Category Image
                            </label>


                            {/* EXISTING IMAGE */}

                            {isEdit &&
                                existingImage &&
                                !formData.image && (
                                    <div
                                        className="
                                            mb-3
                                            flex
                                            items-center
                                            gap-4
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-slate-50
                                            p-3
                                        "
                                    >

                                        <img
                                            src={existingImage}
                                            alt={formData.name}
                                            className="
                                                h-16
                                                w-16
                                                rounded-lg
                                                border
                                                border-slate-200
                                                object-cover
                                            "
                                        />

                                        <div>
                                            <p className="text-sm font-semibold text-slate-700">
                                                Current Image
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Upload a new image to replace it.
                                            </p>
                                        </div>

                                    </div>
                                )}


                            {/* UPLOAD BOX */}

                            <div
                                className="
                                    relative
                                    flex
                                    min-h-32
                                    cursor-pointer
                                    flex-col
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border-2
                                    border-dashed
                                    border-slate-200
                                    bg-slate-50
                                    transition
                                    hover:border-[#003963]/40
                                    hover:bg-slate-100
                                "
                            >

                                <FiImage
                                    size={26}
                                    className="mb-2 text-slate-400"
                                />

                                <p className="text-sm font-medium text-slate-600">
                                    {isEdit
                                        ? "Upload new category image"
                                        : "Upload category image"}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    JPG, JPEG, PNG, WEBP or AVIF
                                </p>

                                <input
                                    type="file"
                                    name="image"
                                    accept="
                                        image/jpeg,
                                        image/png,
                                        image/webp,
                                        image/avif
                                    "
                                    onChange={handleChange}
                                    required={!isEdit}
                                    className="
                                        absolute
                                        inset-0
                                        cursor-pointer
                                        opacity-0
                                    "
                                />

                            </div>


                            {/* SELECTED FILE */}

                            {formData.image && (
                                <div
                                    className="
                                        mt-2
                                        flex
                                        items-center
                                        gap-2
                                        rounded-lg
                                        bg-slate-50
                                        px-3
                                        py-2
                                    "
                                >

                                    <FiImage
                                        size={16}
                                        className="
                                            shrink-0
                                            text-[#003963]
                                        "
                                    />

                                    <p className="truncate text-xs font-medium text-slate-600">
                                        {formData.image.name}
                                    </p>

                                </div>
                            )}

                        </div>

                    </form>

                </div>


                {/* BUTTONS */}

                <div
                    className="
                        flex
                        shrink-0
                        justify-end
                        gap-3
                        border-t
                        border-slate-100
                        bg-white
                        px-6
                        py-4
                    "
                >

                    <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="
                            rounded-xl
                            border
                            border-slate-200
                            px-5
                            py-2.5
                            text-sm
                            font-semibold
                            text-slate-600
                            transition
                            hover:bg-slate-50
                        "
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        form="category-form"
                        className="
                            flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-[#003963]
                            px-5
                            py-2.5
                            text-sm
                            font-semibold
                            text-white
                            transition
                            hover:bg-[#002d4f]
                        "
                    >
                        {isEdit ? (
                            <>
                                <FiEdit2 size={18} />
                                Update Category
                            </>
                        ) : (
                            <>
                                <FiPlus size={18} />
                                Add Category
                            </>
                        )}
                    </button>

                </div>

            </div>
        </div>
    );
};

export default FormModal;
