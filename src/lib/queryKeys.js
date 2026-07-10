export const qk = {
  drafts: (filters = {}) => ['drafts', filters],
  draft: id => ['drafts', 'byId', String(id)],
  settings: ['settings'],
  analytics: ['analytics'],
  notifications: ['notifications'],
};
