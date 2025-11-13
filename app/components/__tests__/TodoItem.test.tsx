import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoItem from '../TodoItem';

describe('TodoItem Component', () => {
    const mockItem = {
        id: 1,
        title: 'Test Todo',
        completed: false,
        userId: 1,
    };

    it('renders todo title', () => {
        const handleToggle = vi.fn();
        const handleDelete = vi.fn();
        render(
            <TodoItem
                item={mockItem}
                onToggle={handleToggle}
                onDelete={handleDelete}
            />
        );

        expect(screen.getByText('Test Todo')).toBeInTheDocument();
    });

    it('renders checkbox with correct checked state', () => {
        const handleToggle = vi.fn();
        const handleDelete = vi.fn();
        const { rerender } = render(
            <TodoItem
                item={mockItem}
                onToggle={handleToggle}
                onDelete={handleDelete}
            />
        );

        let checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();

        rerender(
            <TodoItem
                item={{ ...mockItem, completed: true }}
                onToggle={handleToggle}
                onDelete={handleDelete}
            />
        );

        checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeChecked();
    });

    it('calls onToggle when checkbox is clicked', async () => {
        const user = userEvent.setup();
        const handleToggle = vi.fn();
        const handleDelete = vi.fn();
        render(
            <TodoItem
                item={mockItem}
                onToggle={handleToggle}
                onDelete={handleDelete}
            />
        );

        const checkbox = screen.getByRole('checkbox');
        await user.click(checkbox);

        expect(handleToggle).toHaveBeenCalledTimes(1);
        expect(handleToggle).toHaveBeenCalledWith(1, true);
    });

    it('renders delete button', () => {
        const handleToggle = vi.fn();
        const handleDelete = vi.fn();
        render(
            <TodoItem
                item={mockItem}
                onToggle={handleToggle}
                onDelete={handleDelete}
            />
        );

        const deleteButton = screen.getByRole('button');
        expect(deleteButton).toBeInTheDocument();
    });

    it('calls onDelete when delete button is clicked', async () => {
        const user = userEvent.setup();
        const handleToggle = vi.fn();
        const handleDelete = vi.fn();
        render(
            <TodoItem
                item={mockItem}
                onToggle={handleToggle}
                onDelete={handleDelete}
            />
        );

        const deleteButton = screen.getByRole('button');
        await user.click(deleteButton);

        expect(handleDelete).toHaveBeenCalledTimes(1);
        expect(handleDelete).toHaveBeenCalledWith(1);
    });

    it('applies strikethrough styling to completed todos', () => {
        const handleToggle = vi.fn();
        const handleDelete = vi.fn();
        render(
            <TodoItem
                item={{ ...mockItem, completed: true }}
                onToggle={handleToggle}
                onDelete={handleDelete}
            />
        );

        const text = screen.getByText('Test Todo');
        expect(text).toHaveClass('line-through');
    });

    it('does not apply strikethrough to uncompleted todos', () => {
        const handleToggle = vi.fn();
        const handleDelete = vi.fn();
        render(
            <TodoItem
                item={mockItem}
                onToggle={handleToggle}
                onDelete={handleDelete}
            />
        );

        const text = screen.getByText('Test Todo');
        expect(text).not.toHaveClass('line-through');
    });
});
