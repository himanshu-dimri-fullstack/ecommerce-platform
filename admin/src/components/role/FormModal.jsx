import React from "react";
import {
    FiX,
    FiShield,
    FiPlus,
    FiEdit2,
} from "react-icons/fi";

const FormModal = ({
    setShowModal,
    handleAddRole,
    handleEditRole,
    formData,
    handleChange,
    isEdit,
}) => {
    const modules = [
        "dashboard",
        "banner",
        "role",
        "user",
        "store",
        "inventory",
        "category",
        "subcategory",
        "brand",
        "product",
        "productVariant",
    ];

    const actions = ["add", "read", "update", "delete", "status"];

    const formatModuleName = (module) => {
        return module.charAt(0).toUpperCase() + module.slice(1);
    };

    // Check whether permission exists in array
    const hasPermission = (module, action) => {
        if (module === "dashboard") {
            return action === "read";
        }

        return formData.permissions?.includes(`${module}:${action}`) || false;
    };

    return (
        <div
            className="
                fixed inset-0 z-100
                flex items-center justify-center
                bg-black/50
                p-4
                backdrop-blur-sm
            "
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="
                    flex
                    w-full
                    max-w-2xl
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
                        flex shrink-0
                        items-center justify-between
                        border-b border-slate-200
                        px-6 py-5
                    "
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="
                                flex h-10 w-10
                                items-center justify-center
                                rounded-xl
                                bg-[#003963]/10
                                text-[#003963]
                            "
                        >
                            <FiShield size={20} />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-800">
                                {isEdit ? "Update Role" : "Add New Role"}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {isEdit
                                    ? "Update role information and permissions."
                                    : "Create a new role with specific permissions."}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="
                            rounded-lg p-2
                            text-slate-500
                            transition
                            hover:bg-slate-100
                            hover:text-slate-700
                        "
                    >
                        <FiX size={22} />
                    </button>
                </div>

                {/* FORM */}

                <div className="min-h-0 flex-1 overflow-y-auto">
                    <form
                        id="role-form"
                        onSubmit={
                            isEdit
                                ? handleEditRole
                                : handleAddRole
                        }
                        className="space-y-5 p-6"
                    >
                        {/* ROLE NAME */}

                        <div>
                            <label
                                className="
                                    mb-2 block
                                    text-sm font-medium
                                    text-slate-700
                                "
                            >
                                Role Name*
                            </label>

                            <div className="relative">
                                <FiShield
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
                                    value={formData.name || ""}
                                    onChange={handleChange}
                                    placeholder="Enter role name"
                                    className="
                                        w-full rounded-xl
                                        border border-slate-200
                                        py-2.5 pl-10 pr-4
                                        text-sm text-slate-700
                                        outline-none transition
                                        placeholder:text-slate-400
                                        focus:border-[#003963]
                                        focus:ring-2
                                        focus:ring-[#003963]/10
                                    "
                                />
                            </div>
                        </div>

                        {/* PERMISSIONS */}

                        <div>
                            <div className="mb-3">
                                <label
                                    className="
                                        block
                                        text-sm font-semibold
                                        text-slate-700
                                    "
                                >
                                    Permissions
                                </label>

                                <p className="mt-1 text-xs text-slate-500">
                                    Select the permissions this role should
                                    have for each module.
                                </p>
                            </div>

                            <div
                                className="
                                    overflow-hidden
                                    rounded-xl
                                    border border-slate-200
                                "
                            >
                                {/* TABLE HEADER */}

                                <div
                                    className="
                                        grid
                                        grid-cols-[1fr_repeat(5,60px)]
                                        sm:grid-cols-[1fr_repeat(5,72px)]
                                        border-b border-slate-200
                                        bg-slate-50
                                        px-4 py-3
                                    "
                                >
                                    <div
                                        className="
                                            text-xs font-semibold
                                            uppercase tracking-wide
                                            text-slate-500
                                        "
                                    >
                                        Module
                                    </div>

                                    {["Add", "Read", "Update", "Delete", "Status"].map(
                                        (action) => (
                                            <div
                                                key={action}
                                                className="
                                                    text-center
                                                    text-[10px] sm:text-xs font-semibold
                                                    uppercase tracking-wide
                                                    text-slate-500
                                                "
                                            >
                                                {action}
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* PERMISSION ROWS */}

                                {modules.map((module) => (
                                    <div
                                        key={module}
                                        className="
                                            grid
                                            grid-cols-[1fr_repeat(5,60px)]
                                            sm:grid-cols-[1fr_repeat(5,72px)]
                                            items-center
                                            border-b border-slate-100
                                            px-4 py-3
                                            last:border-b-0
                                            hover:bg-slate-50/70
                                        "
                                    >
                                        {/* MODULE */}

                                        <div className="flex items-center gap-2">
                                            <div
                                                className="
                                                    flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg
                                                    bg-[#003963]/10
                                                    text-[#003963]
                                                "
                                            >
                                                <FiShield size={15} />
                                            </div>

                                            <span
                                                className="
                                                    text-sm font-medium
                                                    text-slate-700
                                                "
                                            >
                                                {formatModuleName(module)}
                                            </span>
                                        </div>

                                        {/* PERMISSIONS */}

                                        {actions.map((action) => {
                                            const isDashboard = module === "dashboard";

                                            return (
                                                <div
                                                    key={action}
                                                    className="flex justify-center"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        name={`permissions.${module}.${action}`}
                                                        checked={hasPermission(module, action)}
                                                        onChange={handleChange}
                                                        disabled={isDashboard}
                                                        className={`
                                                            h-4 w-4
                                                            rounded
                                                            border-slate-300
                                                            accent-[#003963]
                                                            ${isDashboard
                                                                ? "cursor-not-allowed opacity-60"
                                                                : "cursor-pointer"
                                                            }
                                                        `}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </form>
                </div>

                {/* FOOTER */}

                <div
                    className="
                        flex shrink-0
                        justify-end gap-3
                        border-t border-slate-100
                        bg-white
                        px-6 py-4
                    "
                >
                    {/* CANCEL */}

                    <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="
                            rounded-xl
                            border border-slate-200
                            px-5 py-2.5
                            text-sm font-semibold
                            text-slate-600
                            transition
                            hover:bg-slate-50
                        "
                    >
                        Cancel
                    </button>

                    {/* SUBMIT */}

                    <button
                        type="submit"
                        form="role-form"
                        className="
                            flex items-center gap-2
                            rounded-xl
                            bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22]
                            px-5 py-2.5
                            text-sm font-semibold
                            text-white
                            transition
                        "
                    >
                        {isEdit ? (
                            <>
                                <FiEdit2 size={18} />
                                Update Role
                            </>
                        ) : (
                            <>
                                <FiPlus size={18} />
                                Add Role
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FormModal;
