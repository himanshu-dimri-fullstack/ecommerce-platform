import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    FiArrowLeft,
    FiCalendar,
    FiCode,
    FiEye,
    FiCopy,
    FiCheck,
    FiRefreshCw,
} from "react-icons/fi";
import { API } from "../../api/axios";
import { toast } from "react-toastify";

const BannerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [banner, setBanner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCode, setShowCode] = useState(false);
    const [copied, setCopied] = useState(false);

    const getBanner = async () => {
        try {
            setLoading(true);

            const res = await API.get(`/banner/get/${id}`);

            if (res.data.success) {
                setBanner(res.data.banner);
            } else {
                toast.error("Banner not found");
            }
        } catch (error) {
            console.error("Get banner error:", error);

            toast.error(
                error.response?.data?.message || "Failed to fetch banner"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            getBanner();
        }
    }, [id]);

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const decodeHtml = (html = "") => {
        if (typeof document === "undefined") return html;

        const textarea = document.createElement("textarea");
        textarea.innerHTML = html;

        return textarea.value;
    };

    const getPreviewDocument = (html = "") => {
        const decodedHtml = decodeHtml(html);

        if (/<html[\s>]/i.test(decodedHtml)) {
            return decodedHtml;
        }

        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <style>
                        * {
                            box-sizing: border-box;
                        }

                        html, body {
                            margin: 0;
                            padding: 0;
                            width: 100%;
                            min-height: 100%;
                        }

                        img {
                            max-width: 100%;
                        }
                    </style>
                </head>
                <body>
                    ${decodedHtml}
                </body>
            </html>
        `;
    };

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(
                decodeHtml(banner?.htmlContent || "")
            );

            setCopied(true);
            toast.success("HTML copied successfully");

            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error("Unable to copy HTML");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                    <FiRefreshCw className="animate-spin" size={20} />
                    Loading banner details...
                </div>
            </div>
        );
    }

    if (!banner) {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50 px-4">
                <div className="mb-4 rounded-full bg-slate-100 p-5 text-slate-400">
                    <FiEye size={32} />
                </div>

                <h2 className="text-xl font-bold text-slate-800">
                    Banner not found
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    The requested banner could not be found.
                </p>

                <button
                    onClick={() => navigate(-1)}
                    className="mt-5 flex items-center gap-2 rounded-lg bg-[#003963] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002b4b]"
                >
                    <FiArrowLeft size={17} />
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#003963]"
                    >
                        <FiArrowLeft size={17} />
                        Back to Banners
                    </button>

                    <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
                        Banner Details
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        View the complete banner preview and its HTML content.
                    </p>
                </div>

                <button
                    onClick={() => setShowCode((prev) => !prev)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#002b4b]"
                >
                    <FiCode size={18} />
                    {showCode ? "Hide HTML Source" : "View HTML Source"}
                </button>
            </div>

            {/* Banner Information */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                            <FiEye size={21} />
                        </div>

                        <p className="text-sm font-medium text-slate-500">
                            Banner Preview
                        </p>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800">
                        Live HTML Preview
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                        Rendered from saved HTML content
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="rounded-lg bg-green-50 p-3 text-green-600">
                            <FiCalendar size={21} />
                        </div>

                        <p className="text-sm font-medium text-slate-500">
                            Created At
                        </p>
                    </div>

                    <h3 className="text-base font-bold text-slate-800">
                        {formatDate(banner.createdAt)}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                        Banner creation date
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
                            <FiRefreshCw size={21} />
                        </div>

                        <p className="text-sm font-medium text-slate-500">
                            Last Updated
                        </p>
                    </div>

                    <h3 className="text-base font-bold text-slate-800">
                        {formatDate(banner.updatedAt)}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                        Most recent modification
                    </p>
                </div>
            </div>

            {/* Complete Banner Preview */}
            <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col justify-between gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-base font-bold text-slate-800">
                            Complete Banner Preview
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Your saved HTML rendered as a webpage
                        </p>
                    </div>

                    <span className="w-fit rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                        HTML Preview
                    </span>
                </div>

                <div className="bg-slate-100 p-3 sm:p-6">
                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <iframe
                            title="Complete Banner Preview"
                            srcDoc={getPreviewDocument(banner.htmlContent)}
                            sandbox=""
                            className="block min-h-[380px] w-full border-0 sm:min-h-[450px] lg:min-h-[500px]"
                            loading="eager"
                        />
                    </div>
                </div>
            </div>

            {/* HTML Source */}
            {showCode && (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="text-base font-bold text-slate-800">
                                HTML Source Code
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Saved HTML content of this banner
                            </p>
                        </div>

                        <button
                            onClick={handleCopyCode}
                            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            {copied ? (
                                <FiCheck size={17} />
                            ) : (
                                <FiCopy size={17} />
                            )}

                            {copied ? "Copied" : "Copy HTML"}
                        </button>
                    </div>

                    <pre className="max-h-[600px] overflow-auto bg-slate-950 p-5 text-sm leading-6 text-green-300">
                        <code>
                            {decodeHtml(banner.htmlContent || "")}
                        </code>
                    </pre>
                </div>
            )}

            {/* Banner ID */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Banner ID
                </p>

                <p className="break-all font-mono text-sm text-slate-600">
                    {banner._id}
                </p>
            </div>
        </div>
    );
};

export default BannerDetail;