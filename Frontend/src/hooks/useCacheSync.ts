import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getCache, setCache } from '../cache/indexeddb';

interface SyncParams<T> {
  queryKey: string[];
  fetchUpdateDate: () => Promise<{ updated_at: string }>;
  fetchData: () => Promise<T>;
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>;
}

export function useCacheSync<T>({ queryKey, fetchUpdateDate, fetchData, options }: SyncParams<T>) {
  return useQuery<T, Error>({
    queryKey,
    queryFn: async () => {
      const cacheKey = queryKey.join('-');
      
      const cachedRecord = await getCache<T>(cacheKey);

      try {
        const { updated_at: serverVersion } = await fetchUpdateDate();

        if (cachedRecord && cachedRecord.updated_at === serverVersion) {
          return cachedRecord.data;
        }

        const newData = await fetchData();
        
        await setCache(cacheKey, newData, serverVersion);
        
        return newData;
      } catch (error) {
        if (cachedRecord) {
          console.warn(`Network failed, serving offline cache for ${cacheKey}`);
          return cachedRecord.data;
        }
        throw error;
      }
    },
    ...options,
  });
}