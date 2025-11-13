/**
 * Todo item type representing a single todo in the application
 */
export interface Todo {
    id: number;
    title: string;
    completed: boolean;
    userId: number;
}

/**
 * Union type for async state management
 * Represents different states: idle, loading, error, or success with data
 */
export type AsyncState<T> =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'error' }
    | { status: 'success'; data: T };

/**
 * Pagination hook return type
 */
export interface PaginationState<T> {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    paginatedItems: T[];
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    next: () => void;
    prev: () => void;
    canNext: boolean;
    canPrev: boolean;
}

/**
 * Event handler types for common callbacks
 */
export type ToggleHandler = (id: number, checked: boolean) => void;
export type DeleteHandler = (id: number) => void;
export type SubmitHandler = (e: React.FormEvent<HTMLFormElement>) => void;
export type ChangeHandler<T = string> = (value: T) => void;
export type VoidFunction = () => void;
