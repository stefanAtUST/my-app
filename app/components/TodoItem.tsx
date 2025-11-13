'use client';

interface Item {
    id: number;
    title: string;
    completed: boolean;
    userId: number;
}

interface TodoItemProps {
    item: Item;
    onToggle: (id: number, checked: boolean) => void;
    onDelete: (id: number) => void;
}

export default function TodoItem({ item, onToggle, onDelete }: TodoItemProps) {
    return (
        <li className="p-3 card rounded flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
                <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={(e) => onToggle(item.id, e.target.checked)}
                    className="h-4 w-4"
                    aria-label={`Toggle ${item.title}`}
                />
                <span className={item.completed ? 'line-through muted' : ''}>{item.title}</span>
            </div>
            <button
                onClick={() => onDelete(item.id)}
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70 transition text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                aria-label={`Delete ${item.title}`}
                title="Delete todo"
            >
                ✕
            </button>
        </li>
    );
}
