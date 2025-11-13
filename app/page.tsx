'use client';

import { useEffect, useState, useRef } from "react";
import usePagination from './hooks/usePagination';
import Pagination from './components/Pagination';

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
  const [darkMode, setDarkMode] = useState<boolean | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const topCheckboxRef = useRef<HTMLInputElement | null>(null);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    const isDark = stored === 'true' || (stored === null && globalThis.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
  }, []);

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

  // Pagination (FE) for filtered items
  const {
    paginatedItems,
    currentPage,
    totalPages,
    setPage,
    pageSize,
    setPageSize,
  } = usePagination(filteredItems, 1, 10);

  // Checkbox selection helpers
  const allChecked = filteredItems.length > 0 && filteredItems.every((i) => i.completed === true);
  const someChecked = filteredItems.some((i) => i.completed === true) && !allChecked;

  // Keep the top checkbox indeterminate when partially selected
  useEffect(() => {
    if (topCheckboxRef.current) {
      topCheckboxRef.current.indeterminate = someChecked;
    }
  }, [someChecked]);

  // Apply dark mode class to document root and save to localStorage
  useEffect(() => {
    if (darkMode === null) return;
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const handleToggleTheme = () => {
    setDarkMode((prev) => (prev === null ? true : !prev));
  };

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
    <div className="p-8 app-bg min-h-screen">
      {/* Header with theme toggle */}
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Todos</h1>
        <button
          onClick={handleToggleTheme}
          className="px-4 py-2 rounded-lg btn hover:opacity-80 transition"
          aria-label="Toggle dark mode"
        >
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search todos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 input-css"
        />
      </div>

      {/* Top check/uncheck all - always show so user can check/uncheck all items */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            id="top-toggle-checkbox"
            ref={topCheckboxRef}
            type="checkbox"
            checked={allChecked}
            onChange={(e) => handleToggleAll(e.target.checked)}
            className="h-4 w-4"
            aria-label="Select all todos"
          />
          <label htmlFor="top-toggle-checkbox" className="text-sm muted">Toggle all</label>
        </div>
        {state.status === 'success' && (
          <span className="text-sm muted">
            {filteredItems.filter((i) => i.completed).length} of {filteredItems.length} selected
          </span>
        )}
      </div>

      <ul className="space-y-2">
        {state.status === 'idle' && <li>Idle: Waiting to start fetching data.</li>}
        {state.status === 'loading' && <li>Loading: Fetching data...</li>}
        {state.status === 'error' && <li>Error: There was a problem fetching data.</li>}
        {state.status === 'success' && paginatedItems.map((item) => (
          <li key={item.id} className="p-3 card rounded flex items-center justify-between">
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
      {/* Pagination controls */}
      {state.status === 'success' && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
          pageSize={pageSize}
          onPageSizeChange={(s) => setPageSize(s)}
        />
      )}
    </div>
  );
}
