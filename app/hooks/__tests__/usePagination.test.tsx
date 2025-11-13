import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import usePagination from '../usePagination';

describe('usePagination Hook', () => {
    const mockItems = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
    }));

    it('initializes with default values', () => {
        const { result } = renderHook(() => usePagination(mockItems));

        expect(result.current.currentPage).toBe(1);
        expect(result.current.pageSize).toBe(10);
        expect(result.current.totalPages).toBe(3);
        expect(result.current.paginatedItems).toHaveLength(10);
        expect(result.current.canNext).toBe(true);
        expect(result.current.canPrev).toBe(false);
    });

    it('initializes with custom initial page and page size', () => {
        const { result } = renderHook(() =>
            usePagination(mockItems, 2, 5)
        );

        expect(result.current.currentPage).toBe(2);
        expect(result.current.pageSize).toBe(5);
        expect(result.current.totalPages).toBe(5);
        expect(result.current.paginatedItems).toHaveLength(5);
    });

    it('returns correct paginated items for first page', () => {
        const { result } = renderHook(() =>
            usePagination(mockItems, 1, 10)
        );

        expect(result.current.paginatedItems).toHaveLength(10);
        expect(result.current.paginatedItems[0].id).toBe(1);
        expect(result.current.paginatedItems[9].id).toBe(10);
    });

    it('returns correct paginated items for middle page', () => {
        const { result } = renderHook(() =>
            usePagination(mockItems, 2, 10)
        );

        expect(result.current.paginatedItems).toHaveLength(10);
        expect(result.current.paginatedItems[0].id).toBe(11);
        expect(result.current.paginatedItems[9].id).toBe(20);
    });

    it('returns correct paginated items for last page', () => {
        const { result } = renderHook(() =>
            usePagination(mockItems, 3, 10)
        );

        expect(result.current.paginatedItems).toHaveLength(5);
        expect(result.current.paginatedItems[0].id).toBe(21);
        expect(result.current.paginatedItems[4].id).toBe(25);
    });

    it('navigates to next page', () => {
        const { result } = renderHook(() => usePagination(mockItems));

        expect(result.current.currentPage).toBe(1);

        act(() => {
            result.current.next();
        });

        expect(result.current.currentPage).toBe(2);
        expect(result.current.paginatedItems[0].id).toBe(11);
    });

    it('navigates to previous page', () => {
        const { result } = renderHook(() =>
            usePagination(mockItems, 2, 10)
        );

        expect(result.current.currentPage).toBe(2);

        act(() => {
            result.current.prev();
        });

        expect(result.current.currentPage).toBe(1);
        expect(result.current.paginatedItems[0].id).toBe(1);
    });

    it('does not go beyond first page when calling prev', () => {
        const { result } = renderHook(() => usePagination(mockItems));

        expect(result.current.currentPage).toBe(1);
        expect(result.current.canPrev).toBe(false);

        act(() => {
            result.current.prev();
        });

        expect(result.current.currentPage).toBe(1);
    });

    it('does not go beyond last page when calling next', () => {
        const { result } = renderHook(() =>
            usePagination(mockItems, 3, 10)
        );

        expect(result.current.currentPage).toBe(3);
        expect(result.current.canNext).toBe(false);

        act(() => {
            result.current.next();
        });

        expect(result.current.currentPage).toBe(3);
    });

    it('updates canNext and canPrev correctly', () => {
        const { result } = renderHook(() => usePagination(mockItems));

        // Page 1
        expect(result.current.canNext).toBe(true);
        expect(result.current.canPrev).toBe(false);

        // Page 2
        act(() => {
            result.current.next();
        });
        expect(result.current.canNext).toBe(true);
        expect(result.current.canPrev).toBe(true);

        // Page 3 (last)
        act(() => {
            result.current.next();
        });
        expect(result.current.canNext).toBe(false);
        expect(result.current.canPrev).toBe(true);
    });

    it('allows setting page directly', () => {
        const { result } = renderHook(() => usePagination(mockItems));

        act(() => {
            result.current.setPage(3);
        });

        expect(result.current.currentPage).toBe(3);
        expect(result.current.paginatedItems[0].id).toBe(21);
    });

    it('changes page size and recalculates pagination', () => {
        const { result } = renderHook(() => usePagination(mockItems));

        expect(result.current.pageSize).toBe(10);
        expect(result.current.totalPages).toBe(3);

        act(() => {
            result.current.setPageSize(5);
        });

        expect(result.current.pageSize).toBe(5);
        expect(result.current.totalPages).toBe(5);
        expect(result.current.paginatedItems).toHaveLength(5);
    });

    it('handles empty items array', () => {
        const { result } = renderHook(() => usePagination([]));

        expect(result.current.currentPage).toBe(1);
        expect(result.current.totalPages).toBe(1);
        expect(result.current.paginatedItems).toHaveLength(0);
        expect(result.current.canNext).toBe(false);
        expect(result.current.canPrev).toBe(false);
    });

    it('handles single item', () => {
        const { result } = renderHook(() =>
            usePagination([{ id: 1, name: 'Single' }])
        );

        expect(result.current.currentPage).toBe(1);
        expect(result.current.totalPages).toBe(1);
        expect(result.current.paginatedItems).toHaveLength(1);
        expect(result.current.canNext).toBe(false);
        expect(result.current.canPrev).toBe(false);
    });

    it('handles items that exactly fit page size', () => {
        const exactItems = Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
        }));
        const { result } = renderHook(() =>
            usePagination(exactItems, 1, 10)
        );

        expect(result.current.totalPages).toBe(2);
        expect(result.current.paginatedItems).toHaveLength(10);
    });

    it('clamps initial page to valid range', () => {
        const { result } = renderHook(() =>
            usePagination(mockItems, 999, 10)
        );

        // Should clamp to last valid page
        expect(result.current.currentPage).toBe(999);
        expect(result.current.paginatedItems[0].id).toBe(21); // Last page items
    });

    it('clamps negative initial page to 1', () => {
        const { result } = renderHook(() =>
            usePagination(mockItems, -5, 10)
        );

        expect(result.current.currentPage).toBe(1);
        expect(result.current.paginatedItems[0].id).toBe(1);
    });

    it('updates pagination when items change', () => {
        const { result, rerender } = renderHook(
            ({ items }) => usePagination(items, 1, 10),
            {
                initialProps: { items: mockItems },
            }
        );

        expect(result.current.totalPages).toBe(3);
        expect(result.current.paginatedItems).toHaveLength(10);

        // Change items
        const newItems = Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            name: `New Item ${i + 1}`,
        }));

        rerender({ items: newItems });

        expect(result.current.totalPages).toBe(2);
        expect(result.current.paginatedItems).toHaveLength(10);
    });

    it('maintains current page when items increase', () => {
        const { result, rerender } = renderHook(
            ({ items }) => usePagination(items, 2, 10),
            {
                initialProps: { items: mockItems },
            }
        );

        expect(result.current.currentPage).toBe(2);

        // Increase items
        const moreItems = Array.from({ length: 50 }, (_, i) => ({
            id: i + 1,
            name: `Item ${i + 1}`,
        }));

        rerender({ items: moreItems });

        expect(result.current.currentPage).toBe(2);
        expect(result.current.totalPages).toBe(5);
    });

    it('navigates through all pages sequentially', () => {
        const { result } = renderHook(() =>
            usePagination(mockItems, 1, 10)
        );

        // Start at page 1
        expect(result.current.currentPage).toBe(1);

        // Go to page 2
        act(() => {
            result.current.next();
        });
        expect(result.current.currentPage).toBe(2);
        expect(result.current.paginatedItems[0].id).toBe(11);

        // Go to page 3
        act(() => {
            result.current.next();
        });
        expect(result.current.currentPage).toBe(3);
        expect(result.current.paginatedItems[0].id).toBe(21);

        // Back to page 2
        act(() => {
            result.current.prev();
        });
        expect(result.current.currentPage).toBe(2);
        expect(result.current.paginatedItems[0].id).toBe(11);

        // Back to page 1
        act(() => {
            result.current.prev();
        });
        expect(result.current.currentPage).toBe(1);
        expect(result.current.paginatedItems[0].id).toBe(1);
    });

    it('handles page size change when on last page', () => {
        const { result } = renderHook(() =>
            usePagination(mockItems, 3, 10)
        );

        expect(result.current.currentPage).toBe(3);
        expect(result.current.totalPages).toBe(3);

        // Increase page size to reduce total pages
        act(() => {
            result.current.setPageSize(20);
        });

        expect(result.current.totalPages).toBe(2);
        // Current page 3 is now beyond totalPages, should clamp
        expect(result.current.paginatedItems).toHaveLength(5);
    });

    it('handles multiple rapid page changes', () => {
        const { result } = renderHook(() => usePagination(mockItems));

        act(() => {
            result.current.next();
            result.current.next();
            result.current.prev();
        });

        expect(result.current.currentPage).toBe(2);
    });

    it('calculates total pages correctly for various item counts', () => {
        const testCases = [
            { items: 0, pageSize: 10, expected: 1 },
            { items: 1, pageSize: 10, expected: 1 },
            { items: 10, pageSize: 10, expected: 1 },
            { items: 11, pageSize: 10, expected: 2 },
            { items: 20, pageSize: 10, expected: 2 },
            { items: 21, pageSize: 10, expected: 3 },
            { items: 100, pageSize: 25, expected: 4 },
        ];

        for (const { items, pageSize, expected } of testCases) {
            const testItems = Array.from({ length: items }, (_, i) => ({
                id: i + 1,
            }));
            const { result } = renderHook(() =>
                usePagination(testItems, 1, pageSize)
            );

            expect(result.current.totalPages).toBe(expected);
        }
    });
});
