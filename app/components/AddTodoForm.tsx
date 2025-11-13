'use client';

import type { ChangeHandler, SubmitHandler } from '@/app/types';
import { FC } from 'react';

interface AddTodoFormProps {
    value: string;
    onChange: ChangeHandler<string>;
    onSubmit: SubmitHandler;
    placeholder?: string;
    buttonText?: string;
}

const AddTodoForm: FC<AddTodoFormProps> = ({
    value,
    onChange,
    onSubmit,
    placeholder = 'Add a new todo...',
    buttonText = 'Add',
}) => {
    return (
        <form onSubmit={onSubmit} className="flex gap-2 flex-1">
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 input-css"
            />
            <button
                type="submit"
                className="px-6 py-2 rounded-lg btn hover:opacity-80 transition font-medium"
            >
                {buttonText}
            </button>
        </form>
    );
};

export default AddTodoForm;
