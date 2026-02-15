"use client";

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // This effect runs once on the client after mounting to read from localStorage.
  // This avoids a hydration mismatch because the first render on the client will use
  // the same `initialValue` as the server render.
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      } else {
        // If the item doesn't exist, initialize it in localStorage.
        window.localStorage.setItem(key, JSON.stringify(initialValue));
      }
    } catch (error) {
      console.log(`Error reading localStorage key "${key}":`, error);
    }
  // We only want this to run once on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue: Dispatch<SetStateAction<T>> = useCallback((value) => {
      try {
        // The `setStoredValue` function from `useState` can take a function,
        // which gives us the previous value. This is important to avoid stale state.
        setStoredValue((currentValue) => {
            const valueToStore = value instanceof Function ? value(currentValue) : value;
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
            return valueToStore;
        });
      } catch (error) {
        console.log(`Error setting localStorage key "${key}":`, error);
      }
    }, [key]);

  return [storedValue, setValue];
}
