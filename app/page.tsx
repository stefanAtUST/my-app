'use client';

import { useEffect, useState } from "react";

type Status = 'idle' | 'loading' | 'error' | 'success';

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
    <ul>
      {state.status === 'idle' && <li>Idle: Waiting to start fetching data.</li>}
      {state.status === 'loading' && <li>Loading: Fetching data...</li>}
      {state.status === 'error' && <li>Error: There was a problem fetching data.</li>}
      {state.status === 'success' && state.data?.map((item) => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  );
}
