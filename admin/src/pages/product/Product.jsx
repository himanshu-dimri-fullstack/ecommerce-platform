
import React, { useEffect, useState } from "react";
import {
    FiSearch,
    FiPlus,
    FiEye,
    FiEdit2,
    FiTrash2,
    FiCheckCircle,
    FiXCircle,
    FiPackage,
    FiStar,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../api/axios";
import DeleteModal from "../../components/product/DeleteModal";
import FormModal from "../../components/product/FormModal";
import DataLoader from "../../components/DataLoader";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom"

const Product = () => {
    const navigate = useNavigate();
    const user = useSelector((store) => store.auth.user)

    const [dataLoading, setDataLoading] = useState(true);

    // STATES
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const [categories, setCategories] = useState([])
    const [subcategories, setSubcategories] = useState([])
    const [brands, setBrands] = useState([])

    const [products, setProducts] = useState([]);

    const [formData, setFormData] = useState({
        category: "",
        subcategory: "",
        brand: "",
        name: "",
        description: "",
        images: [],
        unit: "piece",
        tags: [],
        isFeatured: false,
    });
    const [existingImages, setExistingImages] = useState([])

    const [tagInput, setTagInput] = useState("");

    // STATISTICS
    const totalProducts = products.length;

    const activeProducts = products.filter(
        (product) => product.isActive === true
    ).length;

    const inactiveProducts = products.filter(
        (product) => product.isActive === false
    ).length;

    // FORM CHANGE
    const handleChange = (e) => {
        const { name, value, files, type, checked } = e.target;

        if (type === "file") {
            setFormData((prev) => ({
                ...prev,
                images: Array.from(files || []),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]:
                    type === "checkbox" ? checked : value,
            }));
        }
    };

    // GET ALL PRODUCTS
    const getAllProducts = async () => {
        try {
            const res = await API.get("/product/get");

            setProducts(res.data.products || []);
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to fetch products"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // RESET FORM
    const resetForm = () => {
        setFormData({
            category: "",
            subcategory: "",
            brand: "",
            name: "",
            description: "",
            images: [],
            unit: "piece",
            tags: [],
            isFeatured: false,
        });
    };

    // OPEN ADD MODAL
    const handleAddProductModal = () => {
        setIsEdit(false);
        setEditId(null);
        resetForm();
        setShowModal(true);
    };

    // BUILD FORMDATA
    const buildProductFormData = () => {
        const finalFormData = new FormData();

        finalFormData.append("category", formData.category);
        finalFormData.append("subcategory", formData.subcategory);
        finalFormData.append("brand", formData.brand);
        finalFormData.append("name", formData.name);
        finalFormData.append("description", formData.description);
        finalFormData.append("unit", formData.unit);
        finalFormData.append("tags", JSON.stringify(formData.tags));
        finalFormData.append("isFeatured", formData.isFeatured);
        formData.images.forEach((image) => {
            finalFormData.append("images", image);
        });

        if (existingImages.length > 0) {
            finalFormData.append("existingImages", JSON.stringify(existingImages));
        }

        // Array.from(formData.images || []).forEach((image) => {
        //     if (image instanceof File) {
        //         finalFormData.append("images", image);
        //     }
        // });

        return finalFormData;
    };

    // ADD PRODUCT
    const handleAddProduct = async (e) => {
        e.preventDefault();

        try {
            setDataLoading(true);

            const finalFormData = buildProductFormData();

            console.log("formData", formData)
            // return

            const res = await API.post(
                "/product/add",
                finalFormData
            );

            toast.success(
                res.data.message
            );

            setShowModal(false);
            resetForm();

            await getAllProducts();
        } catch (error) {
            toast.error(
                error?.response?.data?.message
            );
        } finally {
            setDataLoading(false);
        }
    };

    // DELETE MODAL
    const handleDeleteModal = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    // DELETE PRODUCT
    const handleDeleteProduct = async () => {
        try {
            setDataLoading(true);

            const res = await API.delete(
                `/product/delete/${deleteId}`
            );

            toast.success(
                res.data.message || "Product deleted successfully"
            );

            setShowDeleteModal(false);
            setDeleteId(null);
            await getAllProducts();
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to delete product"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // CHANGE PRODUCT STATUS
    const changeStatus = async (id) => {
        try {
            setDataLoading(true);

            const res = await API.patch(
                "/product/update/status",
                {
                    id,
                }
            );

            toast.success(
                res.data.message || "Product status updated"
            );

            await getAllProducts();
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to change product status"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // VIEW PRODUCT
    const handleProductView = (id) => {
        navigate(`/admin/products/${id}`);
    };

    // EDIT PRODUCT
    const handleProductEdit = (product) => {
        setEditId(product._id);
        setIsEdit(true);

        setFormData({
            category:
                product.category?._id,
            subcategory:
                product.subcategory?._id,
            brand: product.brand._id,
            name: product.name,
            description: product.description,
            images: [],
            unit: product.unit,
            tags: product.tags,
            isFeatured: product.isFeatured,
        });
        setExistingImages(product.images)
        setShowModal(true);
    };

    // UPDATE PRODUCT
    const handleEditProduct = async (e) => {
        e.preventDefault();

        try {
            setDataLoading(true);

            const finalFormData = buildProductFormData();

            const res = await API.put(
                `/product/update/${editId}`,
                finalFormData
            );

            toast.success(
                res.data.message || "Product updated successfully"
            );

            setShowModal(false);
            setEditId(null);
            resetForm();

            await getAllProducts();
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to update product"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // SEARCH
    const filteredProducts = products.filter((product) => {
        const searchValue = search.toLowerCase();

        return (
            product.name?.toLowerCase().includes(searchValue) ||
            product.slug?.toLowerCase().includes(searchValue) ||
            product.category?.name
                ?.toLowerCase()
                .includes(searchValue) ||
            product.brand?.name
                ?.toLowerCase()
                .includes(searchValue)
        );
    });

    const getAllCategories = async () => {
        try {
            const res = await API.get("/category/get")
            setCategories(res.data.categories)
        }
        catch (error) {
            console.log(error.message)
        }
    }
    const getAllSubcategories = async () => {
        try {
            const res = await API.get("/subcategory/get")
            setSubcategories(res.data.subcategories)
        }
        catch (error) {
            console.log(error.message)
        }
    }
    const getAllBrands = async () => {
        try {
            const res = await API.get("/brand/get")
            setBrands(res.data.brands)
        }
        catch (error) {
            console.log(error.message)
        }
    }

    // INITIAL FETCH
    useEffect(() => {
        getAllProducts();
        getAllCategories()
        getAllSubcategories()
        getAllBrands()
    }, []);

    if (!user?.role.permissions.some((permission) => permission.includes("product"))) {
        return <Navigate to="/admin/dashboard" replace />
    }

    if (dataLoading) {
        return <DataLoader />;
    }

    return (
        <div className="space-y-6">
            {/* PAGE HEADER */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">
                    Products
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Manage your products, inventory listings and status.
                </p>
            </div>

            {/* STATISTICS */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* TOTAL */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Total Products
                            </p>
                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {totalProducts}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FiPackage size={24} />
                        </div>
                    </div>
                </div>

                {/* ACTIVE */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Active Products
                            </p>
                            <h2 className="mt-2 text-3xl font-bold text-green-600">
                                {activeProducts}
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
                                Inactive Products
                            </p>
                            <h2 className="mt-2 text-3xl font-bold text-red-500">
                                {inactiveProducts}
                            </h2>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                            <FiXCircle size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* SEARCH + ADD */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-md">
                        <FiSearch
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={19}
                        />

                        <input
                            type="text"
                            placeholder="Search products, brands, categories..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#003963] focus:bg-white focus:ring-2 focus:ring-[#003963]/10"
                        />
                    </div>
                    {
                        user?.role?.permissions.includes("product:add") &&
                        <button
                            onClick={handleAddProductModal}
                            className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] px-5 py-2.5 text-sm font-semibold text-white transition active:scale-95"
                        >
                            <FiPlus size={19} />
                            Add Product
                        </button>

                    }


                </div>
            </div>

            {/* PRODUCT TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-200">
                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Product
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Category
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Brand
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Rating
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Status
                                </th>

                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <tr
                                        key={product._id}
                                        className="transition hover:bg-slate-50"
                                    >
                                        {/* PRODUCT */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-[#003963]">
                                                    {product.images?.[0]?.url ? (
                                                        <img
                                                            src={product.images[0].url}
                                                            alt={product.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <FiPackage size={20} />
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-slate-800">
                                                        {product.name}
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        ID: #{product._id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* CATEGORY */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-700">
                                                {product.category?.name || "—"}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                {product.subcategory?.name || "—"}
                                            </p>
                                        </td>

                                        {/* BRAND */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-700">
                                                {product.brand?.name || "—"}
                                            </span>
                                        </td>

                                        {/* RATING */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm text-slate-700">
                                                <FiStar
                                                    className="fill-amber-400 text-amber-400"
                                                    size={15}
                                                />
                                                {Number(product.rating || 0).toFixed(1)}
                                                <span className="text-xs text-slate-400">
                                                    ({product.totalReviews || 0})
                                                </span>
                                            </div>
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-6 py-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    changeStatus(
                                                        product._id,
                                                    )
                                                }
                                                className={`rounded-lg p-2 text-sm transition ${product.isActive
                                                    ? "bg-green-100 text-green-600"
                                                    : "bg-red-100 text-red-600"
                                                    }`}
                                            >
                                                {product.isActive
                                                    ? "active"
                                                    : "inactive"}
                                            </button>
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {
                                                    user?.role?.permissions.includes("product:read") &&
                                                    <button
                                                        title="View Product"
                                                        onClick={() =>
                                                            handleProductView(product._id)
                                                        }
                                                        className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                    >
                                                        <FiEye size={18} />
                                                    </button>
                                                }


                                                {
                                                    user?.role?.permissions.includes("product:update") &&
                                                    <button
                                                        title="Edit Product"
                                                        onClick={() =>
                                                            handleProductEdit(product)
                                                        }
                                                        className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                                                    >
                                                        <FiEdit2 size={18} />
                                                    </button>
                                                }


                                                {
                                                    user?.role?.permissions.includes("product:delete") &&
                                                    <button
                                                        title="Delete Product"
                                                        onClick={() =>
                                                            handleDeleteModal(product._id)
                                                        }
                                                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                }

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-6 py-12 text-center"
                                    >
                                        <FiPackage
                                            size={40}
                                            className="mx-auto text-slate-300"
                                        />

                                        <p className="mt-3 font-medium text-slate-600">
                                            No products found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            Try changing your search or add a new product.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PRODUCT MODAL */}
            {showModal && (
                <FormModal
                    setShowModal={setShowModal}
                    handleAddProduct={handleAddProduct}
                    handleEditProduct={handleEditProduct}
                    formData={formData}
                    setFormData={setFormData}
                    handleChange={handleChange}
                    isEdit={isEdit}
                    categories={categories}
                    subcategories={subcategories}
                    brands={brands}
                    tagInput={tagInput}
                    setTagInput={setTagInput}
                    existingImages={existingImages}
                    setExistingImages={setExistingImages}
                />
            )}

            {/* DELETE MODAL */}
            {showDeleteModal && (
                <DeleteModal
                    setShowDeleteModal={setShowDeleteModal}
                    handleDeleteProduct={handleDeleteProduct}
                />
            )}
        </div>
    );
};

export default Product;
