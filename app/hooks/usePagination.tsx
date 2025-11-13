import { useEffect, useMemo, useState } from 'react';

export type UsePaginationReturn<T> = {
    currentPage: number;
    totalPages: number;
    setPage: (p: number) => void;
    pageSize: number;
    setPageSize: (s: number) => void;
    paginatedItems: T[];
    next: () => void;
    prev: () => void;
    canNext: boolean;
    canPrev: boolean;
};

export default function usePagination<T>(
    items: T[],
    initialPage = 1,
    initialPageSize = 10
): UsePaginationReturn<T> {
    const [currentPage, setCurrentPage] = useState(() =>
        Math.max(1, initialPage)
    );
    const [pageSize, setPageSize] = useState(initialPageSize);

    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(items.length / pageSize));
    }, [items.length, pageSize]);

    // Reset to page 1 when the source items change (e.g. after search/filter)
    // useEffect(() => {
    //     // Schedule state update as a callback to avoid synchronous setState in effect
    //     const timer = setTimeout(() => setCurrentPage(1), 0);
    //     return () => clearTimeout(timer);
    // }, [items]);

    // Clamp page for safe calculations
    const clampedPage = Math.min(Math.max(1, currentPage), totalPages);

    const paginatedItems = useMemo(() => {
        const start = (clampedPage - 1) * pageSize;
        return items.slice(start, start + pageSize);
    }, [items, clampedPage, pageSize]);

    const canNext = currentPage < totalPages;
    const canPrev = currentPage > 1;

    const next = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
    const prev = () => setCurrentPage((p) => Math.max(1, p - 1));

    return {
        currentPage,
        totalPages,
        setPage: setCurrentPage,
        pageSize,
        setPageSize,
        paginatedItems,
        next,
        prev,
        canNext,
        canPrev,
    };
}
