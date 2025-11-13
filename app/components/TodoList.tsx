'use client';

import TodoItem from './TodoItem';
import type { Todo, ToggleHandler, DeleteHandler, VoidFunction } from '@/app/types';
import { FC, ReactElement } from 'react';

interface TodoListProps {
    items: Todo[];
    onToggle?: ToggleHandler;
    onDelete?: DeleteHandler;
    isLoading?: boolean;
    error?: string;
    onRetry?: VoidFunction;
}

const TodoList: FC<TodoListProps> = ({
    items,
    onToggle,
    onDelete,
    isLoading = false,
    error,
    onRetry,
}): ReactElement => {
    if (isLoading) {
        return (
            <ul className="space-y-2">
                <div className="space-y-2">
                    {['a', 'b', 'c', 'd', 'e'].map((key) => (
                        <li
                            key={key}
                            className="card rounded p-3 h-12 bg-linear-to-r from-current via-gray-100 to-current dark:via-slate-800 bg-size-[200%_100%] animate-shimmer"
                        />
                    ))}
                </div>
            </ul>
        );
    }

    if (error) {
        return (
            <ul className="space-y-2">
                <li className="card rounded p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700">
                    <div className="text-red-800 dark:text-red-100">
                        <h3 className="font-bold mb-2">❌ Failed to Load Todos</h3>
                        <p className="text-sm">
                            Unable to fetch the todo list. Please check your connection and try again.
                        </p>
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="mt-3 px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
                                type="button"
                            >
                                Retry
                            </button>
                        )}
                    </div>
                </li>
            </ul>
        );
    }

    if (items.length === 0) {
        return (
            <ul className="space-y-2">
                <li className="p-4 text-center muted">No todos found</li>
            </ul>
        );
    }

    const handleToggle: ToggleHandler = (id, checked) => {
        onToggle?.(id, checked);
    };

    const handleDelete: DeleteHandler = (id) => {
        onDelete?.(id);
    };

    return (
        <ul className="space-y-2">
            {items.map((item) => (
                <TodoItem
                    key={item.id}
                    item={item}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                />
            ))}
        </ul>
    );
};

export default TodoList;
