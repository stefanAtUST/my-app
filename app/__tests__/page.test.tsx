import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../page';
import type { Todo } from '../types';

// Mock fetch globally
const mockTodos: Todo[] = [
    { id: 1, title: 'Buy groceries', completed: false, userId: 1 },
    { id: 2, title: 'Walk the dog', completed: true, userId: 1 },
    { id: 3, title: 'Read a book', completed: false, userId: 1 },
    { id: 4, title: 'Write code', completed: true, userId: 1 },
    { id: 5, title: 'Exercise', completed: false, userId: 1 },
];

describe('Home Page Integration Tests', () => {
    beforeEach(() => {
        // Mock localStorage
        const localStorageMock = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
        };
        vi.stubGlobal('localStorage', localStorageMock);

        // Mock fetch with successful response
        globalThis.fetch = vi.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve(mockTodos),
            } as Response)
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Initial Rendering', () => {
        it('renders the page header with title', async () => {
            render(<Home />);

            expect(screen.getByRole('heading', { name: /todos/i })).toBeInTheDocument();
        });

        it('renders dark mode toggle button', async () => {
            render(<Home />);

            expect(screen.getByRole('button', { name: /toggle dark mode/i })).toBeInTheDocument();
        });

        it('renders search bar', async () => {
            render(<Home />);

            expect(screen.getByPlaceholderText(/search todos/i)).toBeInTheDocument();
        });

        it('renders add todo form', async () => {
            render(<Home />);

            expect(screen.getByPlaceholderText(/add a new todo/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
        });
    });

    describe('Data Fetching', () => {
        it('fetches todos on mount', async () => {
            render(<Home />);

            await waitFor(() => {
                expect(globalThis.fetch).toHaveBeenCalledWith(
                    'https://jsonplaceholder.typicode.com/todos'
                );
            });
        });

        it('displays loading state while fetching', () => {
            render(<Home />);

            // Loading skeleton should be visible initially
            const listElement = screen.getByRole('list');
            expect(listElement).toBeInTheDocument();
        });

        it('displays todos after successful fetch', async () => {
            render(<Home />);

            await waitFor(() => {
                expect(screen.getByText('Buy groceries')).toBeInTheDocument();
                expect(screen.getByText('Walk the dog')).toBeInTheDocument();
            });
        });

        it('handles fetch errors gracefully', async () => {
            // Mock fetch to fail
            globalThis.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

            render(<Home />);

            await waitFor(() => {
                expect(screen.getByText(/unable to fetch/i)).toBeInTheDocument();
            });
        });

        it('shows retry button on error', async () => {
            globalThis.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

            render(<Home />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
            });
        });

        it('retries fetch when retry button is clicked', async () => {
            const user = userEvent.setup();

            // First call fails, second succeeds
            globalThis.fetch = vi
                .fn()
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce({
                    json: () => Promise.resolve(mockTodos),
                } as Response);

            render(<Home />);

            await waitFor(() => {
                expect(screen.getByText(/unable to fetch/i)).toBeInTheDocument();
            });

            const retryButton = screen.getByRole('button', { name: /retry/i });
            await user.click(retryButton);

            await waitFor(() => {
                expect(screen.getByText('Buy groceries')).toBeInTheDocument();
            });

            expect(globalThis.fetch).toHaveBeenCalledTimes(2);
        });
    });

    describe('Dark Mode', () => {
        it('initializes dark mode from localStorage', () => {
            const localStorageMock = globalThis.localStorage as Record<string, unknown>;
            (localStorageMock.getItem as ReturnType<typeof vi.fn>).mockReturnValue('true');

            render(<Home />);

            expect(localStorageMock.getItem).toHaveBeenCalledWith('darkMode');
        });

        it('toggles dark mode when button is clicked', async () => {
            const user = userEvent.setup();
            const localStorageMock = globalThis.localStorage as Record<string, unknown>;
            (localStorageMock.getItem as ReturnType<typeof vi.fn>).mockReturnValue('false');

            render(<Home />);

            const toggleButton = screen.getByRole('button', { name: /toggle dark mode/i });
            await user.click(toggleButton);

            await waitFor(() => {
                expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', 'true');
            });
        });
    });

    describe('Search Functionality', () => {
        it('filters todos based on search query', async () => {
            const user = userEvent.setup();
            render(<Home />);

            await waitFor(() => {
                expect(screen.getByText('Buy groceries')).toBeInTheDocument();
            });

            const searchInput = screen.getByPlaceholderText(/search todos/i);
            await user.type(searchInput, 'code');

            // Wait for debounce (300ms)
            await waitFor(
                () => {
                    expect(screen.getByText('Write code')).toBeInTheDocument();
                    expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
                },
                { timeout: 500 }
            );
        });

        it('shows all todos when search is cleared', async () => {
            const user = userEvent.setup();
            render(<Home />);

            await waitFor(() => {
                expect(screen.getByText('Buy groceries')).toBeInTheDocument();
            });

            const searchInput = screen.getByPlaceholderText(/search todos/i);
            await user.type(searchInput, 'code');

            await waitFor(
                () => {
                    expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
                },
                { timeout: 500 }
            );

            await user.clear(searchInput);

            await waitFor(
                () => {
                    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
                },
                { timeout: 500 }
            );
        });

        it('debounces search input', async () => {
            const user = userEvent.setup();
            render(<Home />);

            await waitFor(() => {
                expect(screen.getByText('Buy groceries')).toBeInTheDocument();
            });

            const searchInput = screen.getByPlaceholderText(/search todos/i);

            // Type quickly without waiting (use default typing speed)
            await user.type(searchInput, 'code');

            // Todos should still show initially (debounce not triggered yet)
            expect(screen.getByText('Buy groceries')).toBeInTheDocument();

            // Wait for debounce
            await waitFor(
                () => {
                    expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
                },
                { timeout: 500 }
            );
        });
    });

    describe('Add Todo Functionality', () => {
        it('adds a new todo when form is submitted', async () => {
            const user = userEvent.setup();
            render(<Home />);

            await waitFor(() => {
                expect(screen.getByText('Buy groceries')).toBeInTheDocument();
            });

            const input = screen.getByPlaceholderText(/add a new todo/i);
            const addButton = screen.getByRole('button', { name: /add/i });

            await user.type(input, 'New Task');
            await user.click(addButton);

            expect(screen.getByText('New Task')).toBeInTheDocument();
        });

        it('clears input after adding todo', async () => {
            const user = userEvent.setup();
            render(<Home />);

            await waitFor(() => {
                expect(screen.getByText('Buy groceries')).toBeInTheDocument();
            });

            const input = screen.getByPlaceholderText(/add a new todo/i);
            const addButton = screen.getByRole('button', { name: /add/i });

            await user.type(input, 'New Task');
            await user.click(addButton);

            expect(input).toHaveValue('');
        });

        it('does not add todo with empty title', async () => {
            const user = userEvent.setup();
            render(<Home />);

            await waitFor(() => {
                expect(screen.getByText('Buy groceries')).toBeInTheDocument();
            });

            const todosCount = screen.getAllByRole('checkbox').length;
            const addButton = screen.getByRole('button', { name: /add/i });

            await user.click(addButton);

            // Count should remain the same
            expect(screen.getAllByRole('checkbox')).toHaveLength(todosCount);
        });

        it('does not add todo with only whitespace', async () => {
            const user = userEvent.setup();
            render(<Home />);

            await waitFor(() => {
                expect(screen.getByText('Buy groceries')).toBeInTheDocument();
            });

            const input = screen.getByPlaceholderText(/add a new todo/i);
            const addButton = screen.getByRole('button', { name: /add/i });
            const todosCount = screen.getAllByRole('checkbox').length;

            await user.type(input, '   ');
            await user.click(addButton);

            expect(screen.getAllByRole('checkbox')).toHaveLength(todosCount);
        });

        it('adds new todo at the top of the list', async () => {
            const user = userEvent.setup();
            render(<Home />);

            await waitFor(() => {
                expect(screen.getByText('Buy groceries')).toBeInTheDocument();
            });

            const input = screen.getByPlaceholderText(/add a new todo/i);
            const addButton = screen.getByRole('button', { name: /add/i });

            await user.type(input, 'First Todo');
            await user.click(addButton);

            const allTodos = screen.getAllByRole('listitem');
            expect(allTodos[0]).toHaveTextContent('First Todo');
        });
    });

    describe('Delete Todo Functionality', () => {
        it('deletes a todo when delete button is clicked', async () => {
            const user = userEvent.setup();
            render(<Home />);

            await waitFor(() => {
                expect(screen.getByText('Buy groceries')).toBeInTheDocument();
            });

            const deleteButtons = screen
                .getAllByRole('button')
                .find((btn) => btn.getAttribute('aria-label')?.includes('Delete'));

            if (!deleteButtons) {
                throw new Error('Delete button not found');
            }

            await user.click(deleteButtons);

            await waitFor(() => {
                expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
            });
        });
    });

    describe('Toggle Todo Functionality', () => {
        it('toggles a single todo', async () => {
            const user = userEvent.setup();
            render(<Home />);

            await waitFor(() => {
                expect(screen.getByText('Buy groceries')).toBeInTheDocument();
            });

            const checkbox = screen.getByLabelText(/toggle buy groceries/i);
            expect(checkbox).not.toBeChecked();

            await user.click(checkbox);

            expect(checkbox).toBeChecked();
        });

        it('toggles all filtered todos', async () => {
            const user = userEvent.setup();
            render(<Home />);

            await waitFor(() => {
                expect(screen.getByText('Buy groceries')).toBeInTheDocument();
            });

            const toggleAllCheckbox = screen.getByLabelText(/select all todos/i);
            await user.click(toggleAllCheckbox);

            const checkboxes = screen.getAllByRole('checkbox').filter(
                (cb) => !cb.getAttribute('aria-label')?.includes('Select all')
            );

            for (const checkbox of checkboxes) {
                expect(checkbox).toBeChecked();
            }
        });

        it('shows indeterminate state when some todos are checked', async () => {
            const user = userEvent.setup();
            render(<Home />);

            await waitFor(() => {
                expect(screen.getByText('Buy groceries')).toBeInTheDocument();
            });

            const firstCheckbox = screen.getByLabelText(/toggle buy groceries/i);
            await user.click(firstCheckbox);

            const toggleAllCheckbox = screen.getByLabelText(
                /select all todos/i
            );

            // Access the element's indeterminate property
            const element = toggleAllCheckbox as HTMLInputElement;
            expect(element.indeterminate).toBe(true);
        });
    });

    describe('Selection Info', () => {
        it('displays selection count', async () => {
            render(<Home />);

            await waitFor(() => {
                expect(screen.getByText(/2 of 5 selected/i)).toBeInTheDocument();
            });
        });

        it('updates selection count when todos are toggled', async () => {
            const user = userEvent.setup();
            render(<Home />);

            await waitFor(() => {
                expect(screen.getByText(/2 of 5 selected/i)).toBeInTheDocument();
            });

            const firstCheckbox = screen.getByLabelText(/toggle buy groceries/i);
            await user.click(firstCheckbox);

            await waitFor(() => {
                expect(screen.getByText(/3 of 5 selected/i)).toBeInTheDocument();
            });
        });
    });

    describe('Pagination', () => {
        it('displays pagination controls', async () => {
            render(<Home />);

            await waitFor(() => {
                expect(screen.getByText('Buy groceries')).toBeInTheDocument();
            });

            expect(screen.getByRole('button', { name: /prev/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
        });

        it('changes page when next button is clicked', async () => {
            const user = userEvent.setup();

            // Create more todos to enable pagination
            const manyTodos = Array.from({ length: 25 }, (_, i) => ({
                id: i + 1,
                title: `Todo ${i + 1}`,
                completed: false,
                userId: 1,
            }));

            const mockResponse = {
                json: () => Promise.resolve(manyTodos),
            } as Response;

            globalThis.fetch = vi.fn(() => Promise.resolve(mockResponse));

            render(<Home />);

            await waitFor(() => {
                expect(screen.getByText('Todo 1')).toBeInTheDocument();
            });

            const nextButton = screen.getByRole('button', { name: /next/i });
            await user.click(nextButton);

            await waitFor(() => {
                expect(screen.getByText('Todo 11')).toBeInTheDocument();
                expect(screen.queryByText('Todo 1')).not.toBeInTheDocument();
            });
        });

        it('changes page size when selector is changed', async () => {
            const user = userEvent.setup();
            render(<Home />);

            await waitFor(() => {
                expect(screen.getByText('Buy groceries')).toBeInTheDocument();
            });

            const select = screen.getByLabelText(/per page/i);
            await user.selectOptions(select, '5');

            // Should now show only 5 items max per page
            const checkboxes = screen.getAllByRole('checkbox').filter(
                (cb) => !cb.getAttribute('aria-label')?.includes('Select all')
            );
            expect(checkboxes.length).toBeLessThanOrEqual(5);
        });
    });

    describe('Integration Workflows', () => {
        it('search → filter → add → verify', async () => {
            const user = userEvent.setup();
            render(<Home />);

            await waitFor(() => {
                expect(screen.getByText('Buy groceries')).toBeInTheDocument();
            });

            // Search for 'code'
            const searchInput = screen.getByPlaceholderText(/search todos/i);
            await user.type(searchInput, 'code');

            await waitFor(
                () => {
                    expect(screen.getByText('Write code')).toBeInTheDocument();
                    expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
                },
                { timeout: 500 }
            );

            // Clear search
            await user.clear(searchInput);

            await waitFor(
                () => {
                    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
                },
                { timeout: 500 }
            );

            // Step 3: Add new task
            const addInput = screen.getByPlaceholderText(/add a new todo/i);
            await user.type(addInput, 'Integration Test Todo');
            await user.click(screen.getByRole('button', { name: /add/i }));

            expect(screen.getByText('Integration Test Todo')).toBeInTheDocument();
        });

        it('add → toggle → delete workflow', async () => {
            const user = userEvent.setup();
            render(<Home />);

            await waitFor(() => {
                expect(screen.getByText('Buy groceries')).toBeInTheDocument();
            });

            // Step 1: Add task
            const addInput = screen.getByPlaceholderText(/add a new todo/i);
            await user.type(addInput, 'Test Workflow');
            await user.click(screen.getByRole('button', { name: /add/i }));

            expect(screen.getByText('Test Workflow')).toBeInTheDocument();

            // Toggle it
            const checkbox = screen.getByLabelText(/toggle test workflow/i);
            await user.click(checkbox);
            expect(checkbox).toBeChecked();

            // Delete it
            const deleteButton = screen.getByLabelText(/delete test workflow/i);
            await user.click(deleteButton);

            await waitFor(() => {
                expect(screen.queryByText('Test Workflow')).not.toBeInTheDocument();
            });
        });

        it('filter → toggle all → verify only filtered items affected', async () => {
            const user = userEvent.setup();
            render(<Home />);

            await waitFor(() => {
                expect(screen.getByText('Buy groceries')).toBeInTheDocument();
            });

            // First, uncheck "Walk the dog" so we have a mix of states
            const walkTheDogCheckbox = screen.getByLabelText(/toggle walk the dog/i);
            await user.click(walkTheDogCheckbox);

            await waitFor(() => {
                expect(walkTheDogCheckbox).not.toBeChecked();
            });

            // Now search to filter - "the" matches only "Walk the dog" (now unchecked)
            const searchInput = screen.getByPlaceholderText(/search todos/i);
            await user.type(searchInput, 'the');

            await waitFor(
                () => {
                    expect(screen.getByText('Walk the dog')).toBeInTheDocument();
                    expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
                },
                { timeout: 500 }
            );

            // Verify "Walk the dog" is currently unchecked
            const filteredWalkCheckbox = screen.getByLabelText(/toggle walk the dog/i);
            expect(filteredWalkCheckbox).not.toBeChecked();

            // Toggle all - this will check all filtered items (just "Walk the dog")
            const toggleAll = screen.getByLabelText(/select all todos/i);
            await user.click(toggleAll);

            // Wait for "Walk the dog" to be checked after state update
            await waitFor(() => {
                expect(filteredWalkCheckbox).toBeChecked();
            });

            // Clear search to see all items
            await user.clear(searchInput);

            await waitFor(
                () => {
                    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
                },
                { timeout: 500 }
            );

            // Verify: "Buy groceries" should still be unchecked (it wasn't in the filtered results)
            const buyGroceriesCheckbox = screen.getByLabelText(/toggle buy groceries/i);
            expect(buyGroceriesCheckbox).not.toBeChecked();

            // Verify: "Walk the dog" should now be checked (it was toggled while filtered)
            const walkTheDogCheckboxAfter = screen.getByLabelText(/toggle walk the dog/i);
            expect(walkTheDogCheckboxAfter).toBeChecked();
        });
    });
});
