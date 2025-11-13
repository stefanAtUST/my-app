'use client';

import { useEffect, useState, useRef } from "react";

interface Item {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

type State<T> =
  | { status: 'idle'; }
  | { status: 'loading'; }
  | { status: 'error'; }
  | { status: 'success'; data: T };

export default function Home() {
  const [state, setState] = useState<State<Item[]>>({
    status: 'idle',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const topCheckboxRef = useRef<HTMLInputElement | null>(null);

  // Debounce search query
  useEffect(() => {
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Filter items based on debounced query (only if search query is not empty)
  const itemsToDisplay = state.status === 'success' && state.data ? state.data : [];
  const filteredItems = debouncedQuery
    ? itemsToDisplay.filter((item) =>
      item.title.toLowerCase().includes(debouncedQuery.toLowerCase())
    )
    : itemsToDisplay;

  // Checkbox selection helpers
  const allChecked = filteredItems.length > 0 && filteredItems.every((i) => i.completed === true);
  const someChecked = filteredItems.some((i) => i.completed === true) && !allChecked;

  // Keep the top checkbox indeterminate when partially selected
  useEffect(() => {
    if (topCheckboxRef.current) {
      topCheckboxRef.current.indeterminate = someChecked;
    }
  }, [someChecked]);

  const handleToggleAll = (checked: boolean) => {
    setState((prev) => {
      if (prev.status !== 'success') return prev;
      const updated = prev.data.map((item) => {
        const matches = debouncedQuery
          ? item.title.toLowerCase().includes(debouncedQuery.toLowerCase())
          : true;
        return matches ? { ...item, completed: checked } : item;
      });
      return { ...prev, data: updated };
    });
  };

  const handleToggleItem = (id: number, checked: boolean) => {
    setState((prev) => {
      if (prev.status !== 'success') return prev;
      const updated = prev.data.map((it) => (it.id === id ? { ...it, completed: checked } : it));
      return { ...prev, data: updated };
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState((prevState) => ({ ...prevState, status: 'loading' }));
        const response = await fetch('https://jsonplaceholder.typicode.com/todos');
        const responseJson = await response.json();
        setState((prevState) => ({ ...prevState, data: responseJson, status: 'success' }));
      } catch (error) {
        console.error('Error fetching data:', error);
        setState((prevState) => ({ ...prevState, status: 'error' }));
      } finally {
        console.log('Fetch attempt finished.');
      }
    }

    fetchData();
  }, [])

  return (
    <div className="p-8">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search todos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Top check/uncheck all - always show so user can check/uncheck all items */}
      <div className="mb-4 flex items-center gap-2">
        <input
          id="top-toggle-checkbox"
          ref={topCheckboxRef}
          type="checkbox"
          checked={allChecked}
          onChange={(e) => handleToggleAll(e.target.checked)}
          className="h-4 w-4"
          aria-label="Select all todos"
        />
        <label htmlFor="top-toggle-checkbox" className="text-sm text-gray-700">Toggle all</label>
      </div>

      <ul className="space-y-2">
        {state.status === 'idle' && <li>Idle: Waiting to start fetching data.</li>}
        {state.status === 'loading' && <li>Loading: Fetching data...</li>}
        {state.status === 'error' && <li>Error: There was a problem fetching data.</li>}
        {state.status === 'success' && filteredItems.map((item) => (
          <li key={item.id} className="p-3 bg-gray-100 rounded text-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={(e) => handleToggleItem(item.id, e.target.checked)}
                className="h-4 w-4"
                aria-label={`Toggle ${item.title}`}
              />
              <span>{item.title}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
