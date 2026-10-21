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
    FiDollarSign,
    FiTag,
    FiX,
    FiImage,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../api/axios";
import DeleteModal from "../../components/productVariant/DeleteModal";
import FormModal from "../../components/productVariant/FormModal";
import DataLoader from "../../components/DataLoader";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const initialFormData = {
    product: "",
    name: "",
    barcode: "",
    unitValue: "1",
    unit: "piece",
    mrp: "",
    sellingPrice: "",
    discountPercentage: "0",
    weight: "",
    length: "",
    width: "",
    height: "",
    images: [],
};
const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#003963] focus:bg-white focus:ring-2 focus:ring-[#003963]/10";

const ProductVariant = () => {
    const navigate = useNavigate();
    const user = useSelector((store) => store.auth.user)
    const [dataLoading, setDataLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const [products, setProducts] = useState([]);
    const [variants, setVariants] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [formData, setFormData] = useState(initialFormData);

    // STATISTICS
    const totalVariants = variants.length;

    const activeVariants = variants.filter(
        (variant) => variant.status === "active"
    ).length;

    const inactiveVariants = variants.filter(
        (variant) => variant.status === "inactive"
    ).length;

    // DISCOUNT CALCULATION
    const calculateDiscount = (mrp, sellingPrice) => {
        const originalPrice = Number(mrp);
        const finalPrice = Number(sellingPrice);

        if (
            !originalPrice ||
            originalPrice < 0 ||
            finalPrice < 0 ||
            finalPrice > originalPrice
        ) {
            return "0";
        }

        return (
            ((originalPrice - finalPrice) / originalPrice) * 100
        ).toFixed(2);
    };

    // FORM CHANGE
    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "images") {
            setFormData((prev) => ({
                ...prev,
                images: Array.from(files || []),
            }));
            return;
        }

        setFormData((prev) => {
            const updated = {
                ...prev,
                [name]: value,
            };

            if (name === "mrp" || name === "sellingPrice") {
                updated.discountPercentage = calculateDiscount(
                    name === "mrp" ? value : prev.mrp,
                    name === "sellingPrice" ? value : prev.sellingPrice
                );
            }

            return updated;
        });
    };

    // FETCH PRODUCTS FOR DROPDOWN
    const getAllProducts = async () => {
        try {
            const res = await API.get("/admin/products");
            setProducts(res.data.products || []);
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to fetch products"
            );
        }
    };

    // FETCH ALL VARIANTS
    const getAllVariants = async () => {
        try {
            const res = await API.get("/admin/product/variant");
            setVariants(res.data.variants || []);
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to fetch product variants"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // RESET FORM
    const resetForm = () => {
        setFormData({ ...initialFormData });
        setExistingImages([]);
        setEditId(null);
        setIsEdit(false);
    };

    // OPEN ADD MODAL
    const handleAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    // BUILD FORMDATA
    const buildVariantFormData = () => {
        const finalFormData = new FormData();

        finalFormData.append("product", formData.product);
        finalFormData.append("name", formData.name.trim());
        finalFormData.append("barcode", formData.barcode.trim());
        finalFormData.append("unitValue", formData.unitValue);
        finalFormData.append("unit", formData.unit);
        finalFormData.append("mrp", formData.mrp);
        finalFormData.append("sellingPrice", formData.sellingPrice);
        finalFormData.append(
            "discountPercentage",
            formData.discountPercentage
        );

        finalFormData.append("weight", formData.weight);

        finalFormData.append(
            "dimensions",
            JSON.stringify({
                length: formData.length || null,
                width: formData.width || null,
                height: formData.height || null,
            })
        );

        formData.images.forEach((image) => {
            finalFormData.append("images", image);
        });

        if (existingImages.length > 0) {
            finalFormData.append(
                "existingImages",
                JSON.stringify(existingImages)
            );
        }


        return finalFormData;
    };

    // VALIDATE FORM
    const validateForm = () => {
        if (!formData.product) {
            toast.error("Please select a product");
            return false;
        }

        if (!formData.name.trim()) {
            toast.error("Variant name is required");
            return false;
        }

        if (
            formData.unitValue === "" ||
            Number(formData.unitValue) <= 0
        ) {
            toast.error("Unit value must be greater than zero");
            return false;
        }

        if (
            formData.mrp === "" ||
            formData.sellingPrice === "" ||
            Number(formData.mrp) < 0 ||
            Number(formData.sellingPrice) < 0
        ) {
            toast.error("Please enter valid prices");
            return false;
        }

        if (Number(formData.sellingPrice) > Number(formData.mrp)) {
            toast.error("Selling price cannot exceed MRP");
            return false;
        }

        return true;
    };

    // ADD VARIANT
    const handleAddVariant = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setDataLoading(true);

            const finalFormData = buildVariantFormData();

            const res = await API.post(
                "/admin/product/variant",
                finalFormData
            );

            toast.success(
                res.data.message
            );

            setShowModal(false);
            resetForm();

            await getAllVariants();
        } catch (error) {
            toast.error(
                error?.response?.data?.message
            );
        } finally {
            setDataLoading(false);
        }
    };

    // OPEN EDIT MODAL
    const handleEditModal = (variant) => {
        setEditId(variant._id);
        setIsEdit(true);

        const dimensions = variant.dimensions || {};

        setFormData({
            product: variant.product?._id || variant.product || "",
            name: variant.name || "",
            barcode: variant.barcode || "",
            unitValue: String(variant.unitValue ?? 1),
            unit: variant.unit || "piece",
            mrp: String(variant.mrp ?? ""),
            sellingPrice: String(variant.sellingPrice ?? ""),
            discountPercentage: String(
                variant.discountPercentage ?? 0
            ),
            weight: String(variant.weight ?? ""),
            length: String(dimensions.length ?? ""),
            width: String(dimensions.width ?? ""),
            height: String(dimensions.height ?? ""),
            images: [],
        });

        setExistingImages(
            Array.isArray(variant.images) ? variant.images : []
        );

        setShowModal(true);
    };

    // UPDATE VARIANT
    const handleEditVariant = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setDataLoading(true);

            const finalFormData = buildVariantFormData();

            const res = await API.put(
                `/admin/product/variant/${editId}`,
                finalFormData
            );

            toast.success(
                res.data.message || "Variant updated successfully"
            );

            setShowModal(false);
            resetForm();

            await getAllVariants();
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to update variant"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // OPEN DELETE MODAL
    const handleDeleteModal = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    // DELETE VARIANT
    const handleDeleteVariant = async () => {
        try {
            setDataLoading(true);

            const res = await API.delete(
                `/admin/product/variant/${deleteId}`
            );

            toast.success(
                res.data.message || "Variant deleted successfully"
            );

            setShowDeleteModal(false);
            setDeleteId(null);

            await getAllVariants();
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to delete variant"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // CHANGE STATUS
    const changeStatus = async (id) => {
        try {
            setDataLoading(true);

            const res = await API.patch(
                "/admin/product/variant/status",
                { id }
            );

            toast.success(
                res.data.message || "Variant status updated"
            );

            await getAllVariants();
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Failed to change variant status"
            );
        } finally {
            setDataLoading(false);
        }
    };

    // SEARCH
    const filteredVariants = variants.filter((variant) => {
        const searchValue = search.toLowerCase();

        return (
            variant.name?.toLowerCase().includes(searchValue) ||
            variant.sku?.toLowerCase().includes(searchValue) ||
            variant.barcode?.toLowerCase().includes(searchValue) ||
            variant.product?.name?.toLowerCase().includes(searchValue) ||
            variant.unit?.toLowerCase().includes(searchValue)
        );
    });

    // INITIAL FETCH
    useEffect(() => {
        getAllProducts();
        getAllVariants();
    }, []);

    if (!user?.role.permissions.some((permission) => permission.includes("productVariant"))) {
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
                    Product Variants
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Manage product variants, SKUs, pricing, images and status.
                </p>
            </div>

            {/* STATISTICS */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {/* TOTAL */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Total Variants
                            </p>
                            <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                {totalVariants}
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
                                Active Variants
                            </p>
                            <h2 className="mt-2 text-3xl font-bold text-green-600">
                                {activeVariants}
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
                                Inactive Variants
                            </p>
                            <h2 className="mt-2 text-3xl font-bold text-red-500">
                                {inactiveVariants}
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
                            placeholder="Search variants, SKU, barcode, product..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`${inputClass} pl-10`}
                        />
                    </div>

                    {
                        user?.role?.permissions.includes("productVariant:add") &&
                        <button
                            type="button"
                            onClick={handleAddModal}
                            className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] px-5 py-2.5 text-sm font-semibold text-white transition active:scale-95"
                        >
                            <FiPlus size={19} />
                            Add Variant
                        </button>
                    }

                </div>
            </div>

            {/* VARIANTS TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-250">

                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                {[
                                    "Variant",
                                    "Product",
                                    "Pricing",
                                    "Status",
                                    "Actions",
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredVariants.length > 0 ? (
                                filteredVariants.map((variant) => (
                                    <tr
                                        key={variant._id}
                                        className="transition hover:bg-slate-50"
                                    >
                                        {/* VARIANT */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-[#003963]">
                                                    {variant.images?.[0] ? (
                                                        <img
                                                            src={
                                                                typeof variant.images[0] === "string"
                                                                    ? variant.images[0]
                                                                    : variant.images[0]?.url
                                                            }
                                                            alt={variant.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <FiImage size={20} />
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-slate-800">
                                                        {variant.name}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        ID: #{variant._id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* PRODUCT */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-700">
                                                {variant.product?.name || "—"}
                                            </p>
                                        </td>


                                        {/* PRICING */}
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-800">
                                                ₹{Number(variant.sellingPrice || 0).toLocaleString("en-IN")}
                                            </p>
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className="text-xs text-slate-400 line-through">
                                                    ₹{Number(variant.mrp || 0).toLocaleString("en-IN")}
                                                </span>

                                                <span className="text-xs font-medium text-green-600">
                                                    {Number(variant.discountPercentage || 0)}% off
                                                </span>
                                            </div>
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-6 py-4">
                                            <button
                                                type="button"
                                                onClick={() => changeStatus(variant._id)}
                                                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${variant.status === "active"
                                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                                    }`}
                                            >
                                                {variant.status || "inactive"}
                                            </button>
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {
                                                    user?.role?.permissions.includes("productVariant:read") &&
                                                    <button
                                                        type="button"
                                                        title="View Variant"
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/product-variants/${variant._id}`
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                    >
                                                        <FiEye size={18} />
                                                    </button>
                                                }

                                                {
                                                    user?.role?.permissions.includes("productVariant:update") &&
                                                    <button
                                                        type="button"
                                                        title="Edit Variant"
                                                        onClick={() =>
                                                            handleEditModal(variant)
                                                        }
                                                        className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                                                    >
                                                        <FiEdit2 size={18} />
                                                    </button>
                                                }
                                                {
                                                    user?.role?.permissions.includes("productVariant:delete") &&
                                                    <button
                                                        type="button"
                                                        title="Delete Variant"
                                                        onClick={() =>
                                                            handleDeleteModal(variant._id)
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
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <FiPackage
                                            size={40}
                                            className="mx-auto text-slate-300"
                                        />

                                        <p className="mt-3 font-medium text-slate-600">
                                            No variants found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            Try changing your search or add a new variant.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADD / EDIT MODAL */}
            {showModal && (
                <FormModal
                    isEdit={isEdit}
                    setShowModal={setShowModal}
                    resetForm={resetForm}
                    handleEditVariant={handleEditVariant}
                    handleAddVariant={handleAddVariant}
                    formData={formData}
                    handleChange={handleChange}
                    products={products}
                    existingImages={existingImages}
                    setExistingImages={setExistingImages}
                    setFormData={setFormData}
                />
            )}
            {/* DELETE MODAL */}
            {showDeleteModal && (
                <DeleteModal
                    setShowDeleteModal={setShowDeleteModal}
                    handleDeleteVariant={handleDeleteVariant}
                />
            )}
        </div>
    );
};

export default ProductVariant;