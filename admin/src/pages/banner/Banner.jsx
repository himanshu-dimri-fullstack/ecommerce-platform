"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiEye,
    FiEdit2,
    FiTrash2,
} from "react-icons/fi";
import { API } from "../../api/axios";
import { toast } from "react-toastify";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
    ClassicEditor,
    Essentials,
    Paragraph,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Heading,
    Link,
    List,
    BlockQuote,
    Table,
    TableToolbar,
    SourceEditing,
    GeneralHtmlSupport,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";

const Banner = () => {
    const navigate = useNavigate();

    const [banners, setBanners] = useState([]);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [htmlContent, setHtmlContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [bannerToDelete, setBannerToDelete] = useState(null);

    const decodeHtml = (html = "") => {
        const textarea = document.createElement("textarea");
        textarea.innerHTML = html;
        return textarea.value;
    };

    const getBanners = async () => {
        try {
            setLoading(true);

            const res = await API.get("/banner/get");
            setBanners(res.data.banners || res.data.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch banners");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getBanners();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!htmlContent.trim()) {
            toast.error("Please enter banner content");
            return;
        }

        try {
            setSaving(true);

            const payload = { htmlContent };

            if (editingBanner) {
                await API.put(`/banner/update/${editingBanner._id}`, payload);
                toast.success("Banner updated successfully");
            } else {
                await API.post("/banner/add", payload);
                toast.success("Banner added successfully");
            }

            setModal(false);
            setEditingBanner(null);
            setHtmlContent("");
            getBanners();
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setHtmlContent(decodeHtml(banner.htmlContent));
        setModal(true);
    };

    const handleDelete = async () => {
        if (!bannerToDelete) return;

        try {
            setDeletingId(bannerToDelete._id);

            await API.delete(`/banner/delete/${bannerToDelete._id}`);

            toast.success("Banner deleted successfully");

            setBannerToDelete(null);
            getBanners();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete banner");
        } finally {
            setDeletingId(null);
        }
    };

    const filteredBanners = banners.filter((banner) =>
        banner._id?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#003963]">
                        Banner Management
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage your website banners
                    </p>
                </div>

                <button
                    onClick={() => {
                        setEditingBanner(null);
                        setHtmlContent("");
                        setModal(true);
                    }}
                    className="rounded-lg bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002b4a]"
                >
                    Add Banner
                </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
                <input
                    type="text"
                    placeholder="Search banners..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#003963]"
                />
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                {[
                                    "#",
                                    "Banner Preview",
                                    "Created At",
                                    "Updated At",
                                    "Actions",
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className="px-5 py-4 text-sm font-semibold text-slate-600"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-5 py-10 text-center text-sm text-slate-500"
                                    >
                                        Loading banners...
                                    </td>
                                </tr>
                            ) : filteredBanners.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-5 py-10 text-center text-sm text-slate-500"
                                    >
                                        No banners found
                                    </td>
                                </tr>
                            ) : (
                                filteredBanners.map((banner, index) => (
                                    <tr key={banner._id}>
                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {index + 1}
                                        </td>

                                        <td className="px-5 py-4">
                                            <iframe
                                                title={`Banner ${index + 1}`}
                                                srcDoc={decodeHtml(banner.htmlContent)}
                                                className="h-24 w-64 rounded-lg border border-slate-200"
                                                sandbox=""
                                            />
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {banner.createdAt
                                                ? new Date(banner.createdAt).toLocaleDateString()
                                                : "-"}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {banner.updatedAt
                                                ? new Date(banner.updatedAt).toLocaleDateString()
                                                : "-"}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        navigate(`/admin/banner/${banner._id}`)
                                                    }
                                                    title="View Banner Details"
                                                    className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50"
                                                >
                                                    <FiEye size={17} />
                                                </button>

                                                <button
                                                    onClick={() => handleEdit(banner)}
                                                    title="Edit Banner"
                                                    className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                >
                                                    <FiEdit2 size={17} />
                                                </button>

                                                <button
                                                    onClick={() => setBannerToDelete(banner)}
                                                    title="Delete Banner"
                                                    className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                                                >
                                                    <FiTrash2 size={17} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[#003963]">
                                {editingBanner ? "Edit Banner" : "Add Banner"}
                            </h2>

                            <button
                                onClick={() => setModal(false)}
                                className="text-2xl text-slate-500 hover:text-slate-800"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <CKEditor
                                editor={ClassicEditor}
                                data={htmlContent}
                                config={{
                                    licenseKey: "GPL",
                                    plugins: [
                                        Essentials,
                                        Paragraph,
                                        Bold,
                                        Italic,
                                        Underline,
                                        Strikethrough,
                                        Heading,
                                        Link,
                                        List,
                                        BlockQuote,
                                        Table,
                                        TableToolbar,
                                        SourceEditing,
                                        GeneralHtmlSupport,
                                    ],
                                    toolbar: [
                                        "undo",
                                        "redo",
                                        "|",
                                        "heading",
                                        "|",
                                        "bold",
                                        "italic",
                                        "underline",
                                        "strikethrough",
                                        "|",
                                        "link",
                                        "bulletedList",
                                        "numberedList",
                                        "|",
                                        "insertTable",
                                        "blockQuote",
                                        "sourceEditing",
                                    ],
                                    htmlSupport: {
                                        allow: [
                                            {
                                                name: /.*/,
                                                attributes: true,
                                                classes: true,
                                                styles: true,
                                            },
                                        ],
                                    },
                                    table: {
                                        contentToolbar: [
                                            "tableColumn",
                                            "tableRow",
                                            "mergeTableCells",
                                        ],
                                    },
                                }}
                                onChange={(event, editor) => {
                                    setHtmlContent(editor.getData());
                                }}
                            />

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setModal(false)}
                                    className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#002b4a] disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : editingBanner ? "Update Banner" : "Add Banner"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {bannerToDelete && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <h2 className="text-lg font-bold text-slate-800">
                            Delete Banner?
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Are you sure you want to delete this banner? This action cannot be undone.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setBannerToDelete(null)}
                                disabled={deletingId !== null}
                                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deletingId !== null}
                                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                            >
                                {deletingId ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Banner;