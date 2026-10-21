import React, { useEffect, useState } from "react";
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
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../api/axios";
import DeleteModal from "../../components/category/DeleteModal";
import FormModal from "../../components/category/FormModal"
import DataLoader from "../../components/DataLoader";
// import Pagination from "react-responsive-pagination"
// import 'react-responsive-pagination/themes/classic-light-dark.css';
import { useSelector } from "react-redux";


const Category = () => {
    const user = useSelector((store) => store.auth.user)
    const navigate = useNavigate();

    const [dataLoading, setDataLoading] = useState(true)

    // const [currentPage, setCurrentPage] = useState(1)
    // const [totalPages, setTotalPages] = useState(1)

    // =========================
    // STATES
    // =========================

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false)
    const [editId, setEditId] = useState(null)

    const [deleteId, setDeleteId] = useState(null);

    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image: ""
    });
    const [existingImage, setExistingImage] = useState(null)

    // =========================
    // STATISTICS
    // =========================

    const totalCategories = categories.length;

    const activeCategories = categories.filter(
        (category) => category.status === "active"
    ).length;

    const inactiveCategories = categories.filter(
        (category) => category.status === "inactive"
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
    // GET ALL CATEGORIES
    // =========================

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

    // =========================
    // HANDLE ADD MODAL 
    // =========================


    const handleAddCategoryModal = () => {
        setIsEdit(false)
        setFormData({
            name: "",
            description: "",
            image: ""
        })
        setExistingImage(null)
        setShowModal(true)
    }


    // =========================
    // ADD CATEGORY
    // =========================

    const handleAddCategory = async (e) => {

        e.preventDefault();

        try {
            const finalFormData = new FormData()
            finalFormData.append("name", formData.name)
            finalFormData.append("description", formData.description)
            finalFormData.append("image", formData.image)

            setDataLoading(true);

            const res = await API.post(
                "/admin/categories",
                finalFormData
            );

            await getAllCategories();

            toast.success(res.data.message);
            setFormData({
                name: "",
                slug: "",
            });

        }
        catch (error) {

            toast.error(
                error?.response?.data?.message ||
                "Failed to add category"
            );
        }
        finally {

            setDataLoading(false);

            setShowModal(false);
        }
    };

    // =========================
    // EDIT CATEGORY
    // =========================



    // =========================
    // DELETE MODAL
    // =========================

    const handleDeleteModal = (id) => {

        setDeleteId(id);

        setShowDeleteModal(true);
    };


    // =========================
    // DELETE CATEGORY
    // =========================

    const handleDeleteCategory = async () => {

        try {

            setDataLoading(true);

            const res = await API.delete(
                `/admin/categories/${deleteId}`
            );

            await getAllCategories();

            toast.success(res.data.message);

        }
        catch (error) {

            toast.error(
                error?.response?.data?.message ||
                "Failed to delete category"
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
                "/admin/category/status",
                {
                    id,
                    status,
                }
            );

            await getAllCategories();

            toast.success(res.data.message);

        }
        catch (error) {

            toast.error(
                error?.response?.data?.message ||
                "Failed to change category status"
            );
        }
        finally {

            setDataLoading(false);
        }
    };


    // =========================
    // VIEW CATEGORY
    // =========================

    const handleCategoryView = (id) => {

        navigate(`/admin/categories/${id}`);
    };


    // =========================
    // EDIT CATEGORY
    // =========================

    const handleEditCategoryModal = (category) => {
        setEditId(category._id)
        setIsEdit(true)
        setFormData({
            name: category.name,
            description: category.description,
        });
        if (category.image) {
            setExistingImage(category.image.url)
        }

        setShowModal(true);
    };

    const handleEditCategory = async (e) => {

        e.preventDefault();

        try {
            setDataLoading(true);
            const finalFormData = new FormData()
            finalFormData.append("name", formData.name)
            finalFormData.append("description", formData.description)
            if (formData.image) {
                finalFormData.append("image", formData.image)
            }
            else if (existingImage) {
                finalFormData.append("existingImage", existingImage)
            }

            const res = await API.put(
                `/admin/categories/${editId}`,
                finalFormData
            );

            await getAllCategories();

            toast.success(res.data.message);
            setFormData({
                name: "",
                slug: "",
            });
        }
        catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to add category"
            );
        }
        finally {
            setDataLoading(false);
            setShowModal(false);
        }
    };


    // =========================
    // SEARCH
    // =========================

    const filteredCategories = categories.filter((category) => {

        const searchValue = search.toLowerCase();

        return (
            category.name
                ?.toLowerCase()
                .includes(searchValue) ||

            category.slug
                ?.toLowerCase()
                .includes(searchValue)
        );
    });


    // =========================
    // INITIAL FETCH
    // =========================

    useEffect(() => {

        getAllCategories();

    }, []);

    // =========================
    // HANDLE CURRENT PAGE
    // =========================

    const handleCurrentPage = async (page) => {
        console.log(page)
    }

    if (!user?.role.permissions.some((permission) => permission.includes("category"))) {
        return <Navigate to="/admin/dashboard" replace />
    }

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
                    Categories
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Manage all product categories and their status.
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
                                Total Categories
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {totalCategories}
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
                                Active Categories
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-green-600">
                                {activeCategories}
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
                                Inactive Categories
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-red-500">
                                {inactiveCategories}
                            </h2>

                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">

                            <FiXCircle size={24} />

                        </div>

                    </div>

                </div>

            </div>


            {/* ========================================= */}
            {/* SEARCH + ADD CATEGORY */}
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
                            placeholder="Search categories..."
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


                    {/* ADD CATEGORY */}

                    {
                        user?.role?.permissions.includes("category:add") &&
                        <button
                            onClick={handleAddCategoryModal}
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

                            Add Category

                        </button>
                    }



                </div>

            </div>


            {/* ========================================= */}
            {/* CATEGORY TABLE */}
            {/* ========================================= */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="overflow-x-auto">

                    <table className="w-full min-w-200">


                        {/* TABLE HEADER */}

                        <thead className="border-b border-slate-200 bg-slate-50">

                            <tr>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Category
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


                            {filteredCategories.length > 0 ? (

                                filteredCategories.map((category) => (

                                    <tr
                                        key={category._id}
                                        className="transition hover:bg-slate-50"
                                    >


                                        {/* CATEGORY */}

                                        <td className="px-6 py-4">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#003963]/10 font-semibold text-[#003963]">

                                                    <FiGrid size={18} />

                                                </div>

                                                <div>

                                                    <p className="font-semibold text-slate-800">
                                                        {category.name}
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        ID: #{category._id}
                                                    </p>

                                                </div>

                                            </div>

                                        </td>


                                        {/* SLUG */}

                                        <td className="px-6 py-4">

                                            <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs text-slate-600">
                                                {category.slug}
                                            </span>

                                        </td>


                                        {/* STATUS */}

                                        <td className="px-6 py-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    changeStatus(
                                                        category._id,
                                                        category.status
                                                    )
                                                }
                                                className={`
                                            rounded-lg
                                            p-2
                                            transition
                                            ${category?.status === "active"
                                                        ? "text-green-500 text-sm bg-green-100"
                                                        : "text-red-600 text-sm bg-red-100"
                                                    }
                                        `}
                                            >
                                                {category?.status === "active" ? (
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
                                                    {
                                                        user?.role?.permissions.includes("category:read") &&
                                                        <button
                                                            onClick={() =>
                                                                handleCategoryView(category._id)
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
                                                    }



                                                    <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                                                        View
                                                    </span>

                                                </div>


                                                {/* EDIT */}

                                                <div className="group relative">

                                                    {
                                                        user?.role?.permissions.includes("category:update") &&
                                                        <button
                                                            onClick={() =>
                                                                handleEditCategoryModal(category)
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
                                                    }



                                                    <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                                                        Edit
                                                    </span>

                                                </div>


                                                {/* DELETE */}

                                                <div className="group relative">
                                                    {
                                                        user?.role?.permissions.includes("category:delete") &&
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteModal(
                                                                    category._id
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

                                                    }


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
                                        colSpan="4"
                                        className="px-6 py-12 text-center"
                                    >

                                        <FiGrid
                                            size={40}
                                            className="mx-auto text-slate-300"
                                        />

                                        <p className="mt-3 font-medium text-slate-600">
                                            No categories found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            Try changing your search or add a new category.
                                        </p>

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

                {/* <div className="my-5">
                    <Pagination
                        current={currentPage}
                        total={totalPages}
                        onPageChange={handleCurrentPage}
                    />
                </div> */}



            </div>


            {/* ========================================= */}
            {/* CATEGORY MODAL */}
            {/* ========================================= */}

            {showModal && (

                <FormModal handleEditCategory={handleEditCategory} isEdit={isEdit}
                    handleChange={handleChange} setShowModal={setShowModal}
                    formData={formData} handleAddCategory={handleAddCategory}
                    existingImage={existingImage} setExistingImage={setExistingImage} />
            )}


            {/* ========================================= */}
            {/* DELETE MODAL */}
            {/* ========================================= */}

            {showDeleteModal && (

                <DeleteModal
                    setShowDeleteModal={setShowDeleteModal}
                    handleDeleteUser={handleDeleteCategory}
                />

            )}

        </div>
    );
};

export default Category;