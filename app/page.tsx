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

      <ul className="space-y-2">
        {state.status === 'idle' && <li>Idle: Waiting to start fetching data.</li>}
        {state.status === 'loading' && <li>Loading: Fetching data...</li>}
        {state.status === 'error' && <li>Error: There was a problem fetching data.</li>}
        {state.status === 'success' && filteredItems.map((item) => (
          <li key={item.id} className="p-3 bg-gray-100 rounded text-gray-800">
            {item.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
