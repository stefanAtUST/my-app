'use client';

import type { ChangeHandler } from '@/app/types';
import { FC } from 'react';

interface SearchBarProps {
    value: string;
    onChange: ChangeHandler<string>;
    placeholder?: string;
}

const SearchBar: FC<SearchBarProps> = ({ value, onChange, placeholder = 'Search todos...' }) => {
    return (
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 input-css"
        />
    );
};

export default SearchBar;
