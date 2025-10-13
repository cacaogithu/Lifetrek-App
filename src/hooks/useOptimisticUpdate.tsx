import { useState, useCallback } from 'react';

export function useOptimisticUpdate<T>(initialData: T[]) {
  const [data, setData] = useState<T[]>(initialData);
  const [optimisticData, setOptimisticData] = useState<T[]>(initialData);

  const addOptimistic = useCallback((item: T) => {
    setOptimisticData(prev => [...prev, item]);
  }, []);

  const removeOptimistic = useCallback((predicate: (item: T) => boolean) => {
    setOptimisticData(prev => prev.filter(item => !predicate(item)));
  }, []);

  const commit = useCallback((newData: T[]) => {
    setData(newData);
    setOptimisticData(newData);
  }, []);

  const rollback = useCallback(() => {
    setOptimisticData(data);
  }, [data]);

  return {
    data: optimisticData,
    addOptimistic,
    removeOptimistic,
    commit,
    rollback,
  };
}