import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Generic data-fetching hook with loading / error state and a refetch().
 *   const { data, loading, error, refetch } = useFetch(() => mealService.list(filters), [filters]);
 * Responses from outdated requests are ignored, so fast filter changes never
 * show stale results.
 */
export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fetcher, deps);

  const refetch = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await run();
      if (id === requestId.current) setData(result);
    } catch (err) {
      if (id === requestId.current) setError(err.message || 'Failed to load data');
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [run]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, setData, loading, error, refetch };
}
