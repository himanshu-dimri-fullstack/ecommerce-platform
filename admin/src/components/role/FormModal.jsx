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
        "order",
        "deliveryPartner",
    ];

    // Module-wise permissions
    const moduleActions = {
        dashboard: ["read"],

        order: ["read", "assign"],

        deliveryPartner: [
            "add",
            "read",
            "update",
            "delete",
            "status",
        ],
    };

    // Default permissions for remaining modules
    const defaultActions = [
        "add",
        "read",
        "update",
        "delete",
        "status",
    ];

    // All possible table columns
    const allActions = [
        "add",
        "read",
        "update",
        "delete",
        "status",
        "assign",
    ];

    const getModuleActions = (module) => {
        return moduleActions[module] || defaultActions;
    };

    const formatModuleName = (module) => {
        const names = {
            productVariant: "Product Variant",
            deliveryPartner: "Delivery Partner",
        };

        return names[module] ||
            module.charAt(0).toUpperCase() + module.slice(1);
    };

    const formatActionName = (action) => {
        return action.charAt(0).toUpperCase() + action.slice(1);
    };

    // Check permission
    const hasPermission = (module, action) => {
        if (module === "dashboard") {
            return action === "read";
        }

        return (
            formData.permissions?.includes(`${module}:${action}`) || false
        );
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
                    max-w-3xl
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
                        onSubmit={isEdit ? handleEditRole : handleAddRole}
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
                                    required
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
                                    overflow-x-auto
                                    rounded-xl
                                    border border-slate-200
                                "
                            >
                                <div className="min-w-162.5">

                                    {/* TABLE HEADER */}

                                    <div
                                        className="
                                            grid
                                            grid-cols-[1fr_repeat(6,72px)]
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

                                        {allActions.map((action) => (
                                            <div
                                                key={action}
                                                className="
                                                    text-center
                                                    text-xs font-semibold
                                                    uppercase tracking-wide
                                                    text-slate-500
                                                "
                                            >
                                                {formatActionName(action)}
                                            </div>
                                        ))}
                                    </div>

                                    {/* PERMISSION ROWS */}

                                    {modules.map((module) => {
                                        const allowedActions =
                                            getModuleActions(module);

                                        return (
                                            <div
                                                key={module}
                                                className="
                                                    grid
                                                    grid-cols-[1fr_repeat(6,72px)]
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
                                                            shrink-0
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

                                                {allActions.map((action) => {
                                                    const isAllowed =
                                                        allowedActions.includes(action);

                                                    const isDashboard =
                                                        module === "dashboard";

                                                    if (!isAllowed) {
                                                        return (
                                                            <div
                                                                key={action}
                                                                className="flex justify-center"
                                                            >
                                                                <span className="text-slate-200">
                                                                    -
                                                                </span>
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <div
                                                            key={action}
                                                            className="flex justify-center"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                name={`permissions.${module}.${action}`}
                                                                checked={hasPermission(
                                                                    module,
                                                                    action
                                                                )}
                                                                onChange={handleChange}
                                                                disabled={isDashboard}
                                                                title={
                                                                    isDashboard
                                                                        ? "Dashboard read permission is mandatory"
                                                                        : `${module}:${action}`
                                                                }
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
                                        );
                                    })}
                                </div>
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