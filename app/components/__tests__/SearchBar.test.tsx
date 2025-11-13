import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../SearchBar';

describe('SearchBar Component', () => {
    it('renders search input with correct placeholder', () => {
        const handleChange = vi.fn();
        render(<SearchBar value="" onChange={handleChange} />);

        const input = screen.getByPlaceholderText(/search todos/i);
        expect(input).toBeInTheDocument();
    });

    it('displays the current value', () => {
        const handleChange = vi.fn();
        render(<SearchBar value="test query" onChange={handleChange} />);

        const input = screen.getByDisplayValue('test query');
        expect(input).toBeInTheDocument();
    });

    it('calls onChange when user types', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        render(<SearchBar value="" onChange={handleChange} />);

        const input = screen.getByPlaceholderText(/search todos/i);
        await user.type(input, 'hello');

        expect(handleChange).toHaveBeenCalledTimes(5);
        // userEvent.type fires onChange for each character
        expect(handleChange).toHaveBeenNthCalledWith(1, 'h');
        expect(handleChange).toHaveBeenNthCalledWith(5, 'o');
    });

    it('allows clearing the search', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        render(<SearchBar value="existing text" onChange={handleChange} />);

        const input = screen.getByDisplayValue('existing text');
        await user.clear(input);

        expect(handleChange).toHaveBeenCalledWith('');
    });

    it('handles multiple rapid input changes', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        render(<SearchBar value="" onChange={handleChange} />);

        const input = screen.getByPlaceholderText(/search todos/i);
        await user.type(input, 'abc');

        // userEvent.type fires onChange for each individual character
        expect(handleChange).toHaveBeenCalledWith('a');
        expect(handleChange).toHaveBeenCalledWith('b');
        expect(handleChange).toHaveBeenCalledWith('c');
    });

    it('renders as a text input for accessibility', () => {
        const handleChange = vi.fn();
        render(<SearchBar value="" onChange={handleChange} />);

        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('type', 'text');
    });

    it('has aria-label for accessibility', () => {
        const handleChange = vi.fn();
        render(<SearchBar value="" onChange={handleChange} />);

        const input = screen.getByPlaceholderText(/search todos/i);
        expect(input).toHaveAttribute('placeholder');
    });
});
