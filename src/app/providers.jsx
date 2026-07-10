import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const client = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export function Providers({ children }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
