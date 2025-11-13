import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SelectionInfo from '../SelectionInfo';

describe('SelectionInfo Component', () => {
    it('renders checkbox for toggle all', () => {
        render(
            <SelectionInfo
                checked={false}
                indeterminate={false}
                selectedCount={0}
                totalCount={5}
                onChange={vi.fn()}
            />
        );

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
    });

    it('displays selection count', () => {
        render(
            <SelectionInfo
                checked={false}
                indeterminate={false}
                selectedCount={3}
                totalCount={5}
                onChange={vi.fn()}
            />
        );

        expect(screen.getByText(/3 of 5 selected/i)).toBeInTheDocument();
    });

    it('shows checkbox as checked when all items are selected', () => {
        render(
            <SelectionInfo
                checked={true}
                indeterminate={false}
                selectedCount={5}
                totalCount={5}
                onChange={vi.fn()}
            />
        );

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeChecked();
    });

    it('shows checkbox as unchecked when no items are selected', () => {
        render(
            <SelectionInfo
                checked={false}
                indeterminate={false}
                selectedCount={0}
                totalCount={5}
                onChange={vi.fn()}
            />
        );

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();
    });

    it('shows indeterminate state when some items are selected', () => {
        const { container } = render(
            <SelectionInfo
                checked={false}
                indeterminate={true}
                selectedCount={2}
                totalCount={5}
                onChange={vi.fn()}
            />
        );

        const checkbox = container.querySelector('input[type="checkbox"]');
        expect((checkbox as HTMLInputElement)?.indeterminate).toBe(true);
    });

    it('calls onToggleAll when checkbox is clicked', async () => {
        const user = userEvent.setup();
        const handleToggleAll = vi.fn();
        render(
            <SelectionInfo
                checked={false}
                indeterminate={false}
                selectedCount={0}
                totalCount={5}
                onChange={handleToggleAll}
            />
        );

        const checkbox = screen.getByRole('checkbox');
        await user.click(checkbox);

        expect(handleToggleAll).toHaveBeenCalledTimes(1);
    });

    it('displays correct text when all selected', () => {
        render(
            <SelectionInfo
                checked={true}
                indeterminate={false}
                selectedCount={5}
                totalCount={5}
                onChange={vi.fn()}
            />
        );

        expect(screen.getByText(/5 of 5 selected/i)).toBeInTheDocument();
    });

    it('displays correct text when none selected', () => {
        render(
            <SelectionInfo
                checked={false}
                indeterminate={false}
                selectedCount={0}
                totalCount={5}
                onChange={vi.fn()}
            />
        );

        expect(screen.getByText(/0 of 5 selected/i)).toBeInTheDocument();
    });

    it('handles single item selection correctly', () => {
        render(
            <SelectionInfo
                checked={false}
                indeterminate={true}
                selectedCount={1}
                totalCount={1}
                onChange={vi.fn()}
            />
        );

        expect(screen.getByText(/1 of 1 selected/i)).toBeInTheDocument();
    });

    it('updates when props change', () => {
        const { rerender } = render(
            <SelectionInfo
                checked={false}
                indeterminate={false}
                selectedCount={0}
                totalCount={5}
                onChange={vi.fn()}
            />
        );

        expect(screen.getByText(/0 of 5 selected/i)).toBeInTheDocument();

        rerender(
            <SelectionInfo
                checked={false}
                indeterminate={true}
                selectedCount={3}
                totalCount={5}
                onChange={vi.fn()}
            />
        );

        expect(screen.getByText(/3 of 5 selected/i)).toBeInTheDocument();
    });
});
