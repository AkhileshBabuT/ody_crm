import { useQuery, UseQueryOptions } from '@tanstack/react-query';

type RealtimeQueryOptions<T> = UseQueryOptions<T> & {
  refetchInterval: number;
};

export function useRealtimeQuery<T>(options: RealtimeQueryOptions<T>) {
  return useQuery<T>({
    ...options,
    refetchInterval: options.refetchInterval,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });
}
