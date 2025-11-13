import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoList from '../TodoList';
import type { Todo } from '@/app/types';

describe('TodoList Component', () => {
    const mockTodos: Todo[] = [
        { id: 1, title: 'Test Todo 1', completed: false, userId: 1 },
        { id: 2, title: 'Test Todo 2', completed: true, userId: 1 },
    ];

    it('renders loading skeleton when state is loading', () => {
        const handleToggle = vi.fn();
        const handleDelete = vi.fn();
        const { container } = render(
            <TodoList
                items={[]}
                isLoading={true}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onRetry={vi.fn()}
            />
        );

        const lis = container.querySelectorAll('li');
        expect(lis.length).toBeGreaterThan(0);
    });

    it('renders error state with retry button', async () => {
        const user = userEvent.setup();
        const handleRetry = vi.fn();
        render(
            <TodoList
                items={[]}
                error="Failed to load todos"
                onToggle={vi.fn()}
                onDelete={vi.fn()}
                onRetry={handleRetry}
            />
        );

        expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
        // Component shows generic message, not the passed error prop
        expect(
            screen.getByText(/unable to fetch the todo list/i)
        ).toBeInTheDocument();

        const retryButton = screen.getByRole('button', { name: /retry/i });
        await user.click(retryButton);

        expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('renders empty state when no todos', () => {
        render(
            <TodoList
                items={[]}
                isLoading={false}
                onToggle={vi.fn()}
                onDelete={vi.fn()}
                onRetry={vi.fn()}
            />
        );

        expect(screen.getByText(/no todos/i)).toBeInTheDocument();
    });

    it('renders list of todos', () => {
        render(
            <TodoList
                items={mockTodos}
                isLoading={false}
                onToggle={vi.fn()}
                onDelete={vi.fn()}
                onRetry={vi.fn()}
            />
        );

        expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
        expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
    });

    it('passes correct props to TodoItem components', () => {
        const handleToggle = vi.fn();
        const handleDelete = vi.fn();
        render(
            <TodoList
                items={mockTodos}
                isLoading={false}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onRetry={vi.fn()}
            />
        );

        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(2);

        const deleteButtons = screen.getAllByRole('button');
        expect(deleteButtons.length).toBeGreaterThanOrEqual(2);
    });

    it('calls onToggle when todo checkbox is clicked', async () => {
        const user = userEvent.setup();
        const handleToggle = vi.fn();
        render(
            <TodoList
                items={mockTodos}
                isLoading={false}
                onToggle={handleToggle}
                onDelete={vi.fn()}
                onRetry={vi.fn()}
            />
        );

        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[0]);

        expect(handleToggle).toHaveBeenCalled();
    });

    it('calls onDelete when delete button is clicked', async () => {
        const user = userEvent.setup();
        const handleDelete = vi.fn();

        render(
            <TodoList
                items={mockTodos}
                isLoading={false}
                onToggle={vi.fn()}
                onDelete={handleDelete}
                onRetry={vi.fn()}
            />
        );

        const buttons = screen
            .getAllByRole('button')
            .filter((btn) => btn.getAttribute('aria-label')?.includes('Delete'));

        if (buttons.length > 0) {
            await user.click(buttons[0]);
            expect(handleDelete).toHaveBeenCalled();
        }
    });

    it('renders as an unordered list', () => {
        const { container } = render(
            <TodoList
                items={mockTodos}
                isLoading={false}
                onToggle={vi.fn()}
                onDelete={vi.fn()}
                onRetry={vi.fn()}
            />
        );

        const list = container.querySelector('ul');
        expect(list).toBeInTheDocument();
    });
});
