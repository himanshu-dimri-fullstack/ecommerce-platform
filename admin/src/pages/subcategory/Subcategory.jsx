import React, { useContext, useEffect, useState } from "react";
import {
    FiSearch,
    FiPlus,
    FiEye,
    FiEdit2,
    FiTrash2,
    FiCheckCircle,
    FiXCircle,
    FiGrid,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import { API } from "../../api/axios";
import Loader from "../../components/Loader";
import DeleteModal from "../../components/subcategory/DeleteModal";
import FormModal from "../../components/subcategory/FormModal";
import DataLoader from "../../components/DataLoader";

const Subcategory = () => {

    const navigate = useNavigate();

    const [dataLoading, setDataLoading] = useState(true)

    // =========================
    // STATES
    // =========================

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [isEdit, setIsEdit] = useState(false)
    const [editId, setEditId] = useState(null)

    const [deleteId, setDeleteId] = useState(null);

    const [categories, setCategories] = useState([])
    const [subcategories, setSubcategories] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        description: "",
        image: ""
    });


    // =========================
    // STATISTICS
    // =========================

    const totalSubcategories = subcategories?.length;

    const activeSubcategories = subcategories.filter(
        (subcategory) => subcategory.status === "active"
    ).length;

    const inactiveSubcategories = subcategories.filter(
        (subcategory) => subcategory.status === "inactive"
    ).length;


    // =========================
    // FORM CHANGE
    // =========================

    const handleChange = (e) => {

        const { name, value, files } = e.target;

        if (files) {
            setFormData((prev) => ({
                ...prev,
                image: files[0],
            }));
        }
        else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };


    // =========================
    // GET ALL SUBCATEGORIES
    // =========================

    const getAllSubcategories = async () => {

        try {

            const res = await API.get("/admin/subcategories");

            setSubcategories(res.data.subcategories);

        }
        catch (error) {

            console.log(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to fetch subcategories"
            );
        }
        finally {
            setDataLoading(false)
        }
    };


    // =========================
    // ADD SUBCATEGORY
    // =========================

    const handleAddSubcategory = async (e) => {

        e.preventDefault();

        try {

            setDataLoading(true);

            const finalFormData = new FormData()
            finalFormData.append("name", formData.name)
            finalFormData.append("description", formData.description)
            finalFormData.append("category", formData.category)
            finalFormData.append("image", formData.image)


            const res = await API.post(
                "/admin/subcategories",
                finalFormData
            );

            await getAllSubcategories();

            toast.success(res.data.message);

            setFormData({
                name: "",
                category: "",
                description: "",
                image: ""
            });

        }
        catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to add subcategory"
            );
        }
        finally {
            setDataLoading(false);
            setShowModal(false);
        }
    };

    // =========================
    // EDIT SUBCATEGORY
    // =========================

    const handleEditSubcategory = async (e) => {

        e.preventDefault();

        try {

            setDataLoading(true);

            const finalFormData = new FormData()
            finalFormData.append("name", formData.name)
            finalFormData.append("description", formData.description)
            finalFormData.append("category", formData.category)
            finalFormData.append("image", formData.image)


            const res = await API.put(
                `/admin/subcategories/${editId}`,
                finalFormData
            );

            await getAllSubcategories();

            toast.success(res.data.message);

            setFormData({
                name: "",
                category: "",
                description: "",
                image: ""
            });

        }
        catch (error) {

            toast.error(
                error?.response?.data?.message ||
                "Failed to add subcategory"
            );
        }
        finally {

            setDataLoading(false);

            setShowModal(false);
        }
    };

    // =========================
    // DELETE MODAL
    // =========================

    const handleDeleteModal = (id) => {

        setDeleteId(id);

        setShowDeleteModal(true);
    };


    // =========================
    // DELETE SUBCATEGORY
    // =========================

    const handleDeleteSubcategory = async () => {

        try {

            setDataLoading(true);

            const res = await API.delete(
                `/admin/subcategories/${deleteId}`
            );

            await getAllSubcategories();

            toast.success(res.data.message);

        }
        catch (error) {

            toast.error(
                error?.response?.data?.message ||
                "Failed to delete subcategory"
            );
        }
        finally {

            setDataLoading(false);

            setShowDeleteModal(false);

            setDeleteId(null);
        }
    };


    // =========================
    // CHANGE STATUS
    // =========================

    const changeStatus = async (id, status) => {

        try {

            setDataLoading(true);

            const res = await API.patch(
                "/admin/subcategory/status",
                {
                    id,
                    status,
                }
            );

            await getAllSubcategories();

            toast.success(res.data.message);

        }
        catch (error) {

            toast.error(
                error?.response?.data?.message ||
                "Failed to change subcategory status"
            );
        }
        finally {

            setDataLoading(false);
        }
    };


    // =========================
    // VIEW SUBCATEGORY
    // =========================

    const handleSubcategoryView = (id) => {

        navigate(`/admin/subcategories/${id}`);
    };


    // =========================
    // EDIT SUBCATEGORY MODAL
    // =========================

    const handleEditSubcategoryModal = (subcategory) => {
        setIsEdit(true)
        setEditId(subcategory._id)
        setFormData({
            name: subcategory.name,
            category: subcategory.category._id,
            description: subcategory.description,
            image: subcategory.image.url
        });

        setShowModal(true);
    };

    // =========================
    // ADD SUBCATEGORY MODAL
    // =========================

    const handleAddSubcategoryModal = (subcategory) => {
        setIsEdit(false)
        setEditId(null)
        setFormData({
            name: "",
            category: "",
            description: "",
            image: ""
        });

        setShowModal(true);
    };



    // =========================
    // SEARCH
    // =========================

    const filteredSubcategories = subcategories.filter(
        (subcategory) => {

            const searchValue = search.toLowerCase();

            return (
                subcategory.name
                    ?.toLowerCase()
                    .includes(searchValue) ||

                subcategory.slug
                    ?.toLowerCase()
                    .includes(searchValue) ||

                subcategory.category?.name
                    ?.toLowerCase()
                    .includes(searchValue)
            );
        }
    );


    // =========================
    // INITIAL FETCH
    // =========================

    useEffect(() => {

        getAllSubcategories();

    }, []);

    useEffect(() => {
        const getAllCategories = async () => {

            try {
                const res = await API.get("/admin/categories");
                setCategories(res.data.categories);
            }
            catch (error) {
                console.log(error);
                toast.error(
                    error?.response?.data?.message ||
                    "Failed to fetch categories"
                );
            }
            finally {
                setDataLoading(false)
            }
        };
        getAllCategories()
    }, [])


    if (dataLoading) {
        return <DataLoader />
    }


    return (

        <div className="space-y-6">


            {/* ========================================= */}
            {/* PAGE HEADER */}
            {/* ========================================= */}

            <div>

                <h1 className="text-2xl font-bold text-slate-800">
                    Subcategories
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Manage all product subcategories and their status.
                </p>

            </div>


            {/* ========================================= */}
            {/* STAT CARDS */}
            {/* ========================================= */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">


                {/* TOTAL */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm font-medium text-slate-500">
                                Total Subcategories
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {totalSubcategories}
                            </h2>

                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                            <FiGrid size={24} />

                        </div>

                    </div>

                </div>


                {/* ACTIVE */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm font-medium text-slate-500">
                                Active Subcategories
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-green-600">
                                {activeSubcategories}
                            </h2>

                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">

                            <FiCheckCircle size={24} />

                        </div>

                    </div>

                </div>


                {/* INACTIVE */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm font-medium text-slate-500">
                                Inactive Subcategories
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-red-500">
                                {inactiveSubcategories}
                            </h2>

                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">

                            <FiXCircle size={24} />

                        </div>

                    </div>

                </div>

            </div>


            {/* ========================================= */}
            {/* SEARCH + ADD SUBCATEGORY */}
            {/* ========================================= */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">


                    {/* SEARCH */}

                    <div className="relative w-full sm:max-w-md">

                        <FiSearch
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={19}
                        />

                        <input
                            type="text"
                            placeholder="Search subcategories..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="
                                w-full
                                rounded-xl
                                border border-slate-200
                                bg-slate-50
                                py-2.5
                                pl-10
                                pr-4
                                text-sm
                                outline-none
                                transition
                                focus:border-[#003963]
                                focus:bg-white
                                focus:ring-2
                                focus:ring-[#003963]/10
                            "
                        />

                    </div>


                    {/* ADD SUBCATEGORY */}

                    <button
                        onClick={handleAddSubcategoryModal}
                        className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22]
                            px-5
                            py-2.5
                            text-sm
                            font-semibold
                            text-white
                            transition
                            active:scale-95
                        "
                    >

                        <FiPlus size={19} />

                        Add Subcategory

                    </button>

                </div>

            </div>


            {/* ========================================= */}
            {/* SUBCATEGORY TABLE */}
            {/* ========================================= */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="overflow-x-auto">

                    <table className="w-full min-w-225">


                        {/* TABLE HEADER */}

                        <thead className="border-b border-slate-200 bg-slate-50">

                            <tr>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Subcategory
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Parent Category
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Slug
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Status
                                </th>

                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        {/* TABLE BODY */}

                        <tbody className="divide-y divide-slate-100">


                            {filteredSubcategories.length > 0 ? (

                                filteredSubcategories.map((subcategory) => (

                                    <tr
                                        key={subcategory._id}
                                        className="transition hover:bg-slate-50"
                                    >


                                        {/* SUBCATEGORY */}

                                        <td className="px-6 py-4">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#003963]/10 font-semibold text-[#003963]">

                                                    <FiGrid size={18} />

                                                </div>

                                                <div>

                                                    <p className="font-semibold text-slate-800">
                                                        {subcategory.name}
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        ID: #{subcategory._id}
                                                    </p>

                                                </div>

                                            </div>

                                        </td>


                                        {/* PARENT CATEGORY */}

                                        <td className="px-6 py-4">

                                            <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-[#003963]">

                                                {subcategory.category?.name ||
                                                    subcategory.categoryName ||
                                                    "-"}

                                            </span>

                                        </td>


                                        {/* SLUG */}

                                        <td className="px-6 py-4">

                                            <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs text-slate-600">
                                                {subcategory.slug}
                                            </span>

                                        </td>


                                        {/* STATUS */}

                                        <td className="px-6 py-4">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    changeStatus(
                                                        subcategory._id,
                                                        subcategory.status
                                                    )
                                                }
                                                className={`
                                            rounded-lg
                                            p-2
                                            transition
                                            ${subcategory?.status === "active"
                                                        ? "text-green-500 text-sm bg-green-100"
                                                        : "text-red-600 text-sm bg-red-100"
                                                    }
                                        `}
                                            >
                                                {subcategory?.status === "active" ? (
                                                    "active"
                                                ) : (
                                                    "inactive"
                                                )}

                                            </button>

                                        </td>


                                        {/* ACTIONS */}

                                        <td className="px-6 py-4">

                                            <div className="flex items-center justify-center gap-2">


                                                {/* VIEW */}

                                                <div className="group relative">

                                                    <button
                                                        onClick={() =>
                                                            handleSubcategoryView(
                                                                subcategory._id
                                                            )
                                                        }
                                                        className="
                                                            rounded-lg
                                                            p-2
                                                            text-blue-600
                                                            transition
                                                            hover:bg-blue-50
                                                        "
                                                    >

                                                        <FiEye size={18} />

                                                    </button>

                                                    <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                                                        View
                                                    </span>

                                                </div>


                                                {/* EDIT */}

                                                <div className="group relative">

                                                    <button
                                                        onClick={() =>
                                                            handleEditSubcategoryModal(
                                                                subcategory
                                                            )
                                                        }
                                                        className="
                                                            rounded-lg
                                                            p-2
                                                            text-amber-600
                                                            transition
                                                            hover:bg-amber-50
                                                        "
                                                    >

                                                        <FiEdit2 size={18} />

                                                    </button>

                                                    <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                                                        Edit
                                                    </span>

                                                </div>


                                                {/* DELETE */}

                                                <div className="group relative">

                                                    <button
                                                        onClick={() =>
                                                            handleDeleteModal(
                                                                subcategory._id
                                                            )
                                                        }
                                                        className="
                                                            rounded-lg
                                                            p-2
                                                            text-red-500
                                                            transition
                                                            hover:bg-red-50
                                                        "
                                                    >

                                                        <FiTrash2 size={18} />

                                                    </button>

                                                    <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                                                        Delete
                                                    </span>

                                                </div>

                                            </div>

                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>

                                    <td
                                        colSpan="5"
                                        className="px-6 py-12 text-center"
                                    >

                                        <FiGrid
                                            size={40}
                                            className="mx-auto text-slate-300"
                                        />

                                        <p className="mt-3 font-medium text-slate-600">
                                            No subcategories found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            Try changing your search or add a new subcategory.
                                        </p>

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* ========================================= */}
            {/* SUBCATEGORY MODAL */}
            {/* ========================================= */}

            {showModal && (

                <FormModal
                    handleChange={handleChange}
                    setShowModal={setShowModal}
                    formData={formData}
                    handleAddSubcategory={handleAddSubcategory}
                    handleEditSubcategory={handleEditSubcategory}
                    categories={categories}
                    isEdit={isEdit}
                />

            )}


            {/* ========================================= */}
            {/* DELETE MODAL */}
            {/* ========================================= */}

            {showDeleteModal && (

                <DeleteModal
                    setShowDeleteModal={setShowDeleteModal}
                    handleDeleteSubcategory={handleDeleteSubcategory}
                />

            )}

        </div>
    );
};

export default Subcategory;