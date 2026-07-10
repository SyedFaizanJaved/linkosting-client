import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api.js';
import { qk } from '../../lib/queryKeys.js';

export function useAnalytics() {
  return useQuery({ queryKey: qk.analytics, queryFn: () => api('/api/analytics') });
}
