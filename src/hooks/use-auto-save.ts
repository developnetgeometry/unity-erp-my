import { useEffect } from 'react';

export function useAutoSave<T>(data: T, key: string, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          key,
          JSON.stringify({
            data,
            timestamp: Date.now(),
          })
        );
      } catch (error) {
        console.error('Failed to save draft:', error);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [data, key, enabled]);
}

export function loadDraft<T>(key: string, maxAge = 7 * 24 * 60 * 60 * 1000): T | null {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return null;

    const { data, timestamp } = JSON.parse(saved);
    const age = Date.now() - timestamp;

    if (age > maxAge) {
      localStorage.removeItem(key);
      return null;
    }

    return data as T;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
}

export function clearDraft(key: string) {
  localStorage.removeItem(key);
}
