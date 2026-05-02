import { useState, useCallback } from "react";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAsync<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
): AsyncState<T> & { execute: (...args: Args) => Promise<T | null> } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });
      try {
        const result = await fn(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setState({ data: null, loading: false, error: msg });
        return null;
      }
    },

    [fn],
  );

  return { ...state, execute };
}
