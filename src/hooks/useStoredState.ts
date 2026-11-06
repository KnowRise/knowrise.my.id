'use client';

import { useCallback, useEffect, useState } from 'react';

export function useStoredState<T extends string>(
  key: string,
  fallback: T,
  allowed?: readonly T[],
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null && (!allowed || allowed.includes(stored as T))) {
        setValue(stored as T);
      }
    } catch {
      // localStorage may be unavailable in private mode.
    }
  }, [key, allowed]);

  const update = useCallback((next: T) => {
    setValue(next);
    try {
      window.localStorage.setItem(key, next);
    } catch {
      // localStorage may be unavailable in private mode.
    }
  }, [key]);

  return [value, update];
}
