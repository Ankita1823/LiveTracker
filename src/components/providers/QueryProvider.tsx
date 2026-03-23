'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
        gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
        refetchOnWindowFocus: false, // Don't refetch every time you switch tabs
        retry: 1, // Only retry once
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
