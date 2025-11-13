'use client';

import { useRef, useEffect } from 'react';

interface SelectionInfoProps {
    checked: boolean;
    indeterminate: boolean;
    onChange: (checked: boolean) => void;
    selectedCount: number;
    totalCount: number;
}

export default function SelectionInfo({
    checked,
    indeterminate,
    onChange,
    selectedCount,
    totalCount,
}: SelectionInfoProps) {
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
}
