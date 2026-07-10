import { useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api.js';

export function useGenerate() {
  return useMutation({
    mutationFn: body => api('/api/generate', { method: 'POST', body }),
  });
}
