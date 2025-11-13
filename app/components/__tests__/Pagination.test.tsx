import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from '../Pagination';

describe('Pagination Component', () => {
    it('renders prev, next, and page buttons', () => {
        const handlePageChange = vi.fn();
        render(
            <Pagination
                currentPage={1}
                totalPages={3}
                onPageChange={handlePageChange}
                pageSize={10}
            />
        );

        expect(screen.getByRole('button', { name: /prev/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
    });

    it('disables prev button on first page', () => {
        const handlePageChange = vi.fn();
        render(
            <Pagination
                currentPage={1}
                totalPages={3}
                onPageChange={handlePageChange}
                pageSize={10}
            />
        );

        const prevButton = screen.getByRole('button', { name: /prev/i });
        expect(prevButton).toBeDisabled();
    });

    it('disables next button on last page', () => {
        const handlePageChange = vi.fn();
        render(
            <Pagination
                currentPage={3}
                totalPages={3}
                onPageChange={handlePageChange}
                pageSize={10}
            />
        );

        const nextButton = screen.getByRole('button', { name: /next/i });
        expect(nextButton).toBeDisabled();
    });

    it('enables prev button when not on first page', () => {
        const handlePageChange = vi.fn();
        render(
            <Pagination
                currentPage={2}
                totalPages={3}
                onPageChange={handlePageChange}
                pageSize={10}
            />
        );

        const prevButton = screen.getByRole('button', { name: /prev/i });
        expect(prevButton).not.toBeDisabled();
    });

    it('enables next button when not on last page', () => {
        const handlePageChange = vi.fn();
        render(
            <Pagination
                currentPage={2}
                totalPages={3}
                onPageChange={handlePageChange}
                pageSize={10}
            />
        );

        const nextButton = screen.getByRole('button', { name: /next/i });
        expect(nextButton).not.toBeDisabled();
    });

    it('calls onPageChange when prev button is clicked', async () => {
        const user = userEvent.setup();
        const handlePageChange = vi.fn();
        render(
            <Pagination
                currentPage={2}
                totalPages={3}
                onPageChange={handlePageChange}
                pageSize={10}
            />
        );

        const prevButton = screen.getByRole('button', { name: /prev/i });
        await user.click(prevButton);

        expect(handlePageChange).toHaveBeenCalledWith(1);
    });

    it('calls onPageChange when next button is clicked', async () => {
        const user = userEvent.setup();
        const handlePageChange = vi.fn();
        render(
            <Pagination
                currentPage={1}
                totalPages={3}
                onPageChange={handlePageChange}
                pageSize={10}
            />
        );

        const nextButton = screen.getByRole('button', { name: /next/i });
        await user.click(nextButton);

        expect(handlePageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageChange when a page number button is clicked', async () => {
        const user = userEvent.setup();
        const handlePageChange = vi.fn();
        render(
            <Pagination
                currentPage={1}
                totalPages={5}
                onPageChange={handlePageChange}
                pageSize={10}
            />
        );

        const pageButton = screen.getByRole('button', { name: '3' });
        await user.click(pageButton);

        expect(handlePageChange).toHaveBeenCalledWith(3);
    });

    it('highlights the current page button', () => {
        const handlePageChange = vi.fn();
        render(
            <Pagination
                currentPage={2}
                totalPages={5}
                onPageChange={handlePageChange}
                pageSize={10}
            />
        );

        const currentPageButton = screen.getByRole('button', {
            name: '2',
            current: 'page',
        });
        expect(currentPageButton).toBeInTheDocument();
        expect(currentPageButton).toHaveClass('btn-active');
    });

    it('renders page size selector with correct value', () => {
        const handlePageChange = vi.fn();
        render(
            <Pagination
                currentPage={1}
                totalPages={3}
                onPageChange={handlePageChange}
                pageSize={20}
            />
        );

        const select = screen.getByLabelText(/per page/i);
        expect(select).toHaveValue('20');
    });

    it('calls onPageSizeChange when page size is changed', async () => {
        const user = userEvent.setup();
        const handlePageChange = vi.fn();
        const handlePageSizeChange = vi.fn();
        render(
            <Pagination
                currentPage={1}
                totalPages={3}
                onPageChange={handlePageChange}
                pageSize={10}
                onPageSizeChange={handlePageSizeChange}
            />
        );

        const select = screen.getByLabelText(/per page/i);
        await user.selectOptions(select, '50');

        expect(handlePageSizeChange).toHaveBeenCalledWith(50);
    });

    it('does not call onPageSizeChange when prop is not provided', async () => {
        const user = userEvent.setup();
        const handlePageChange = vi.fn();
        render(
            <Pagination
                currentPage={1}
                totalPages={3}
                onPageChange={handlePageChange}
                pageSize={10}
            />
        );

        const select = screen.getByLabelText(/per page/i);
        await user.selectOptions(select, '20');

        // Should not throw error
        expect(handlePageChange).not.toHaveBeenCalled();
    });

    it('renders all page size options', () => {
        const handlePageChange = vi.fn();
        render(
            <Pagination
                currentPage={1}
                totalPages={3}
                onPageChange={handlePageChange}
                pageSize={10}
            />
        );

        const select = screen.getByLabelText(/per page/i);
        const options = Array.from(select.querySelectorAll('option')).map(
            (opt) => opt.value
        );

        expect(options).toEqual(['5', '10', '20', '50']);
    });

    it('handles single page correctly', () => {
        const handlePageChange = vi.fn();
        render(
            <Pagination
                currentPage={1}
                totalPages={1}
                onPageChange={handlePageChange}
                pageSize={10}
            />
        );

        expect(screen.getByRole('button', { name: /prev/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    });

    it('limits page buttons when many pages exist', () => {
        const handlePageChange = vi.fn();
        render(
            <Pagination
                currentPage={5}
                totalPages={20}
                onPageChange={handlePageChange}
                pageSize={10}
            />
        );

        const pageButtons = screen
            .getAllByRole('button')
            .filter((btn) => /^\d+$/.test(btn.textContent || ''));

        // Should show max 7 page buttons
        expect(pageButtons.length).toBeLessThanOrEqual(7);
    });

    it('shows correct page range for middle pages', () => {
        const handlePageChange = vi.fn();
        render(
            <Pagination
                currentPage={10}
                totalPages={20}
                onPageChange={handlePageChange}
                pageSize={10}
            />
        );

        // Should show pages around current page
        expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '7' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '13' })).toBeInTheDocument();
    });

    it('shows correct page range when near the start', () => {
        const handlePageChange = vi.fn();
        render(
            <Pagination
                currentPage={2}
                totalPages={20}
                onPageChange={handlePageChange}
                pageSize={10}
            />
        );

        // Should show pages 1-7
        expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '7' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: '8' })).not.toBeInTheDocument();
    });

    it('shows correct page range when near the end', () => {
        const handlePageChange = vi.fn();
        render(
            <Pagination
                currentPage={19}
                totalPages={20}
                onPageChange={handlePageChange}
                pageSize={10}
            />
        );

        // Should show pages 14-20
        expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '14' })).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: '13' })
        ).not.toBeInTheDocument();
    });

    it('does not break with zero pages', () => {
        const handlePageChange = vi.fn();
        render(
            <Pagination
                currentPage={1}
                totalPages={0}
                onPageChange={handlePageChange}
                pageSize={10}
            />
        );

        // Should still render controls
        expect(screen.getByRole('button', { name: /prev/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });
});
