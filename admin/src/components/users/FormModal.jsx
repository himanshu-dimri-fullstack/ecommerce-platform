import {
    FiPlus,
    FiX,
    FiUser,
    FiMail,
    FiPhone,
    FiShield,
    FiEdit2,
} from "react-icons/fi";

const FormModal = ({
    setShowModal,
    handleAddUser,
    handleEditUser,
    formData,
    handleChange,
    roles,
    isEdit,
}) => {
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
                    w-full
                    max-w-lg
                    rounded-2xl
                    bg-white
                    shadow-2xl
                "
            >

                {/* HEADER */}

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {isEdit ? "Update User" : "Add New User"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {isEdit
                                ? "Update user account information."
                                : "Create a new user account."
                            }
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


                {/* FORM */}

                <form
                    onSubmit={isEdit ? handleEditUser : handleAddUser}
                    className="space-y-5 p-6"
                >

                    {/* FIRST + LAST NAME */}

                    <div className="grid grid-cols-2 gap-4">

                        {/* FIRST NAME */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                First Name
                            </label>

                            <div className="relative">

                                <FiUser
                                    size={18}
                                    className="
                                        absolute left-3 top-1/2
                                        -translate-y-1/2
                                        text-slate-400
                                    "
                                />

                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="First name"
                                    required
                                    className="
                                        w-full
                                        rounded-xl
                                        border border-slate-200
                                        py-2.5
                                        pl-10
                                        pr-4
                                        text-sm
                                        outline-none
                                        transition
                                        focus:border-[#003963]
                                        focus:ring-2
                                        focus:ring-[#003963]/10
                                    "
                                />

                            </div>
                        </div>


                        {/* LAST NAME */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Last Name
                            </label>

                            <div className="relative">

                                <FiUser
                                    size={18}
                                    className="
                                        absolute left-3 top-1/2
                                        -translate-y-1/2
                                        text-slate-400
                                    "
                                />

                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Last name"
                                    required
                                    className="
                                        w-full
                                        rounded-xl
                                        border border-slate-200
                                        py-2.5
                                        pl-10
                                        pr-4
                                        text-sm
                                        outline-none
                                        transition
                                        focus:border-[#003963]
                                        focus:ring-2
                                        focus:ring-[#003963]/10
                                    "
                                />

                            </div>
                        </div>

                    </div>


                    {/* EMAIL */}

                    <div>

                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Email Address
                        </label>

                        <div className="relative">

                            <FiMail
                                size={18}
                                className="
                                    absolute left-3 top-1/2
                                    -translate-y-1/2
                                    text-slate-400
                                "
                            />

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter email address"
                                required
                                className="
                                    w-full
                                    rounded-xl
                                    border border-slate-200
                                    py-2.5
                                    pl-10
                                    pr-4
                                    text-sm
                                    outline-none
                                    transition
                                    focus:border-[#003963]
                                    focus:ring-2
                                    focus:ring-[#003963]/10
                                "
                            />

                        </div>

                    </div>


                    {/* PHONE */}

                    <div>

                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Phone Number
                        </label>

                        <div className="relative">

                            <FiPhone
                                size={18}
                                className="
                                    absolute left-3 top-1/2
                                    -translate-y-1/2
                                    text-slate-400
                                "
                            />

                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                                required
                                className="
                                    w-full
                                    rounded-xl
                                    border border-slate-200
                                    py-2.5
                                    pl-10
                                    pr-4
                                    text-sm
                                    outline-none
                                    transition
                                    focus:border-[#003963]
                                    focus:ring-2
                                    focus:ring-[#003963]/10
                                "
                            />

                        </div>

                    </div>


                    {/* ROLE */}

                    <div>

                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Role
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

                            <select
                                name="role"
                                value={formData?.role?._id}
                                onChange={handleChange}
                                className="
                                    w-full
                                    appearance-none
                                    rounded-xl
                                    border border-slate-200
                                    bg-white
                                    py-2.5
                                    pl-10
                                    pr-4
                                    text-sm
                                    text-slate-700
                                    outline-none
                                    transition
                                    focus:border-[#003963]
                                    focus:ring-2
                                    focus:ring-[#003963]/10
                                "
                            >
                                <option value="">
                                    Select role
                                </option>

                                {roles.map((role) => (
                                    <option
                                        key={role._id}
                                        value={role._id}
                                    >
                                        {role.name}
                                    </option>
                                ))}

                            </select>

                        </div>

                    </div>


                    {/* BUTTONS */}

                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

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
                            className="
                                flex items-center gap-2
                                rounded-xl
                                bg-[#003963]
                                px-5 py-2.5
                                text-sm font-semibold
                                text-white
                                transition
                                hover:bg-[#002d4f]
                            "
                        >
                            {isEdit ? (
                                <>
                                    <FiEdit2 size={18} />
                                    Update User
                                </>
                            ) : (
                                <>
                                    <FiPlus size={18} />
                                    Add User
                                </>
                            )}
                        </button>

                    </div>

                </form>

            </div>
        </div>
    );
};

export default FormModal;