'use client';

import { useEffect, useState, useRef } from 'react';
import type { Todo, AsyncState } from '@/app/types';
import usePagination from './hooks/usePagination';
import Pagination from './components/Pagination';
import SearchBar from './components/SearchBar';
import AddTodoForm from './components/AddTodoForm';
import TodoList from './components/TodoList';
import SelectionInfo from './components/SelectionInfo';

export default function Home() {
  const [state, setState] = useState<AsyncState<Todo[]>>({
    status: 'idle',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [darkMode, setDarkMode] = useState<boolean | null>(null);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [nextId, setNextId] = useState(201); // Start after API todos (1-200)
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

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

  const handleAddTodo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    setState((prev) => {
      if (prev.status !== 'success') return prev;
      const newTodo: Todo = {
        id: nextId,
        title: newTodoTitle.trim(),
        completed: false,
        userId: 1,
      };
      return { ...prev, data: [newTodo, ...prev.data] };
    });

    setNextId((prev) => prev + 1);
    setNewTodoTitle('');
  };

  const handleDeleteTodo = (id: number) => {
    setState((prev) => {
      if (prev.status !== 'success') return prev;
      const updated = prev.data.filter((item) => item.id !== id);
      return { ...prev, data: updated };
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState((prevState) => ({ ...prevState, status: 'loading' }));
        const response = await fetch('https://jsonplaceholder.typicode.com/todos');
        const responseJson: Todo[] = await response.json();
        setState((prevState) => ({ ...prevState, data: responseJson, status: 'success' }));
      } catch (error) {
        console.error('Error fetching data:', error);
        setState((prevState) => ({ ...prevState, status: 'error' }));
      } finally {
        console.log('Fetch attempt finished.');
      }
    };

    fetchData();
  }, []);

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

      {/* Search and Add todo form - separate left and right */}
      <div className="mb-6 flex gap-6 items-center">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <AddTodoForm value={newTodoTitle} onChange={setNewTodoTitle} onSubmit={handleAddTodo} />
      </div>

      {/* Selection info and toggle all */}
      {state.status === 'success' && (
        <SelectionInfo
          checked={allChecked}
          indeterminate={someChecked}
          onChange={handleToggleAll}
          selectedCount={filteredItems.filter((i) => i.completed).length}
          totalCount={filteredItems.length}
        />
      )}

      {/* Todo list with loading, error, and empty states */}
      {state.status === 'success' && (
        <TodoList
          items={paginatedItems}
          onToggle={handleToggleItem}
          onDelete={handleDeleteTodo}
        />
      )}
      {state.status === 'loading' && <TodoList items={[]} isLoading />}
      {state.status === 'error' && (
        <TodoList
          items={[]}
          error="Unable to fetch todos"
          onRetry={() => {
            setState({ status: 'idle' });
            const fetchData = async () => {
              try {
                setState((prevState) => ({ ...prevState, status: 'loading' }));
                const response = await fetch('https://jsonplaceholder.typicode.com/todos');
                const responseJson = await response.json();
                setState((prevState) => ({ ...prevState, data: responseJson, status: 'success' }));
              } catch (error) {
                console.error('Error fetching data:', error);
                setState((prevState) => ({ ...prevState, status: 'error' }));
              }
            };
            fetchData();
          }}
        />
      )}
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
