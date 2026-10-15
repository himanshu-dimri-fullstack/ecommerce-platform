
import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Pagination = ({ totalPages = 10, onPageChange }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages || page === currentPage) return;

        setCurrentPage(page);
        onPageChange?.(page);
    };

    const getPages = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (currentPage <= 4) {
            return [1, 2, 3, 4, 5, "...", totalPages];
        }

        if (currentPage >= totalPages - 3) {
            return [
                1, "...",
                totalPages - 4,
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages,
            ];
        }

        return [
            1, "...",
            currentPage - 1,
            currentPage,
            currentPage + 1,
            "...",
            totalPages,
        ];
    };

    const buttonStyle =
        "flex h-10 min-w-10 items-center justify-center rounded-lg border text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40";

    return (
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 bg-white px-4 py-5 sm:flex-row sm:px-6">

            <p className="text-sm text-gray-500">
                Page{" "}
                <span className="font-semibold text-gray-900">
                    {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                    {totalPages}
                </span>
            </p>

            <nav
                aria-label="Pagination"
                className="flex items-center gap-1.5"
            >
                <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`${buttonStyle} gap-1 px-3 text-gray-600 border-gray-200 hover:bg-gray-50`}
                >
                    <FiChevronLeft size={17} />
                    <span className="hidden sm:inline">Previous</span>
                </button>

                {getPages().map((page, index) =>
                    page === "..." ? (
                        <span
                            key={`ellipsis-${index}`}
                            className="flex h-10 min-w-6 items-center justify-center text-gray-400"
                        >
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            type="button"
                            onClick={() => handlePageChange(page)}
                            aria-current={
                                currentPage === page ? "page" : undefined
                            }
                            className={`${buttonStyle} ${currentPage === page
                                    ? "border-[#003963] bg-[#003963] text-white shadow-sm"
                                    : "border-transparent text-gray-600 hover:border-gray-200 hover:bg-gray-50"
                                }`}
                        >
                            {page}
                        </button>
                    )
                )}

                <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`${buttonStyle} gap-1 px-3 text-gray-600 border-gray-200 hover:bg-gray-50`}
                >
                    <span className="hidden sm:inline">Next</span>
                    <FiChevronRight size={17} />
                </button>
            </nav>
        </div>
    );
};

export default Pagination;
