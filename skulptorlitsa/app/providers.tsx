'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import ToastProvider from '@/components/ui/Toast';

function AuthInit() {
  const initFromStorage = useAuthStore(s => s.initFromStorage);
  useEffect(() => { initFromStorage(); }, [initFromStorage]);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 5 * 60 * 1000, retry: 1 },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInit />
      {children}
      <ToastProvider />
    </QueryClientProvider>
  );
}
