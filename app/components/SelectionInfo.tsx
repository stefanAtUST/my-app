'use client';

import type { ChangeHandler } from '@/app/types';
import { useRef, useEffect, FC } from 'react';

interface SelectionInfoProps {
    checked: boolean;
    indeterminate: boolean;
    onChange: ChangeHandler<boolean>;
    selectedCount: number;
    totalCount: number;
}

const SelectionInfo: FC<SelectionInfoProps> = ({
    checked,
    indeterminate,
    onChange,
    selectedCount,
    totalCount,
}) => {
    const checkboxRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    return (
        <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
                <input
                    id="top-toggle-checkbox"
                    ref={checkboxRef}
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="h-4 w-4"
                    aria-label="Select all todos"
                />
                <label htmlFor="top-toggle-checkbox" className="text-sm muted">
                    Toggle all
                </label>
            </div>
            {totalCount > 0 && (
                <span className="text-sm muted">
                    {selectedCount} of {totalCount} selected
                </span>
            )}
        </div>
    );
};

export default SelectionInfo;
