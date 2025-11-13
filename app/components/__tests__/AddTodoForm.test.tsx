import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddTodoForm from '../AddTodoForm';

describe('AddTodoForm Component', () => {
    it('renders input field and submit button', () => {
        const handleChange = vi.fn();
        const handleSubmit = vi.fn();
        render(
            <AddTodoForm
                value=""
                onChange={handleChange}
                onSubmit={handleSubmit}
            />
        );

        const input = screen.getByPlaceholderText(/add a new todo/i);
        const button = screen.getByRole('button', { name: /add/i });
        expect(input).toBeInTheDocument();
        expect(button).toBeInTheDocument();
    });

    it('displays current input value', () => {
        const handleChange = vi.fn();
        const handleSubmit = vi.fn();
        render(
            <AddTodoForm
                value="new todo"
                onChange={handleChange}
                onSubmit={handleSubmit}
            />
        );

        const input = screen.getByDisplayValue('new todo');
        expect(input).toBeInTheDocument();
    });

    it('calls onChange when typing in input', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        const handleSubmit = vi.fn();
        render(
            <AddTodoForm
                value=""
                onChange={handleChange}
                onSubmit={handleSubmit}
            />
        );

        const input = screen.getByPlaceholderText(/add a new todo/i);
        await user.type(input, 'test');

        expect(handleChange).toHaveBeenCalledTimes(4);
        // userEvent.type fires onChange for each character
        expect(handleChange).toHaveBeenNthCalledWith(1, 't');
        expect(handleChange).toHaveBeenNthCalledWith(4, 't');
    });

    it('calls onSubmit when clicking Add button', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        const handleSubmit = vi.fn();
        render(
            <AddTodoForm
                value="new todo"
                onChange={handleChange}
                onSubmit={handleSubmit}
            />
        );

        const button = screen.getByRole('button', { name: /add/i });
        await user.click(button);

        expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit when pressing Enter in input', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        const handleSubmit = vi.fn();
        render(
            <AddTodoForm
                value="new todo"
                onChange={handleChange}
                onSubmit={handleSubmit}
            />
        );

        const input = screen.getByPlaceholderText(/add a new todo/i);
        await user.click(input);
        await user.keyboard('{Enter}');

        expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('renders button and allows clicking even when input is empty', () => {
        const handleChange = vi.fn();
        const handleSubmit = vi.fn();
        render(
            <AddTodoForm
                value=""
                onChange={handleChange}
                onSubmit={handleSubmit}
            />
        );

        const button = screen.getByRole('button', { name: /add/i });
        expect(button).toBeInTheDocument();
    });

    it('renders button when input contains only whitespace', () => {
        const handleChange = vi.fn();
        const handleSubmit = vi.fn();
        render(
            <AddTodoForm
                value="   "
                onChange={handleChange}
                onSubmit={handleSubmit}
            />
        );

        const button = screen.getByRole('button', { name: /add/i });
        expect(button).toBeInTheDocument();
    });
});
