import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, qs } from '../../lib/api.js';
import { qk } from '../../lib/queryKeys.js';

export function useDrafts(filters = {}) {
  return useQuery({ queryKey: qk.drafts(filters), queryFn: () => api(`/api/drafts${qs(filters)}`) });
}

export function useDraft(id) {
  return useQuery({
    queryKey: qk.draft(id),
    queryFn: () => (id === 'today' ? api('/api/drafts/today') : api('/api/drafts').then(list => {
      const d = list.find(x => String(x.id) === String(id));
      if (!d) throw new Error('draft not found');
      return d;
    })),
    enabled: id != null,
  });
}

function useDraftMutation(mutationFn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['drafts'] });
      qc.invalidateQueries({ queryKey: qk.analytics });
      qc.invalidateQueries({ queryKey: qk.notifications });
    },
  });
}

export const useCreateDraft = () => useDraftMutation(body => api('/api/drafts', { method: 'POST', body }));
export const useSaveDraft = () => useDraftMutation(({ id, edited_content }) => api(`/api/drafts/${id}`, { method: 'PUT', body: { edited_content } }));
export const useApproveDraft = () => useDraftMutation(id => api(`/api/drafts/${id}/approve`, { method: 'POST' }));
export const useScheduleDraft = () => useDraftMutation(({ id, scheduled_at }) => api(`/api/drafts/${id}/schedule`, { method: 'PUT', body: { scheduled_at } }));
export const usePublishDraft = () => useDraftMutation(id => api(`/api/drafts/${id}/publish`, { method: 'POST' }));
export const useRegenerateDraft = () => useDraftMutation(id => api(`/api/drafts/${id}/regenerate`, { method: 'POST' }));
export const useSaveMetrics = () => useDraftMutation(({ id, ...metrics }) => api(`/api/drafts/${id}/metrics`, { method: 'PUT', body: metrics }));
export const useDeleteDraft = () => useDraftMutation(id => api(`/api/drafts/${id}`, { method: 'DELETE' }));
export const useGenerateImage = () => useDraftMutation(id => api(`/api/drafts/${id}/image`, { method: 'POST' }));
export const useDeleteImage = () => useDraftMutation(id => api(`/api/drafts/${id}/image`, { method: 'DELETE' }));
