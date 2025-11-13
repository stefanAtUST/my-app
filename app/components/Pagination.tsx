import React from 'react';

interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    onPageSizeChange?: (size: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange, pageSize, onPageSizeChange }: Props) {
    const makePageButtons = () => {
        const pages = [] as number[];
        // Simple approach: show up to 7 pages with current in the middle when possible
        const maxButtons = 7;
        let start = 1;
        let end = totalPages;

        if (totalPages > maxButtons) {
            const middle = Math.floor(maxButtons / 2);
            start = Math.max(1, currentPage - middle);
            end = start + maxButtons - 1;
            if (end > totalPages) {
                end = totalPages;
                start = end - maxButtons + 1;
            }
        }

        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    const pages = makePageButtons();

    return (
        <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <button
                    className="px-2 py-1 rounded disabled:opacity-50 btn"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                >
                    Prev
                </button>

                {pages.map((p) => (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`px-2 py-1 rounded ${p === currentPage ? 'btn-active' : 'btn'}`}
                        aria-current={p === currentPage ? 'page' : undefined}
                    >
                        {p}
                    </button>
                ))}

                <button
                    className="px-2 py-1 rounded disabled:opacity-50 btn"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                >
                    Next
                </button>
            </div>

            <div className="flex items-center gap-2">
                <label htmlFor="pagination-page-size" className="text-sm muted">Per page:</label>
                <select
                    id="pagination-page-size"
                    value={pageSize}
                    onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
                    className="px-2 py-1 rounded select-css"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
            </div>
        </div>
    );
}
