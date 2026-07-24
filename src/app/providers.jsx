import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import Toaster from '../components/Toaster.jsx';
import OfflineBanner from '../components/OfflineBanner.jsx';
import { toast } from '../lib/toast.js';

const client = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
  // Any failed action (mutation) also surfaces as a top-right toast.
  mutationCache: new MutationCache({
    onError: err => toast.error(err?.message || 'Something went wrong'),
  }),
});

export function Providers({ children }) {
  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster />
      <OfflineBanner />
    </QueryClientProvider>
  );
}
