// Tiny framework-agnostic toast store so any code (including api.js and the
// query client, which live outside React) can raise a top-right toast.
let toasts = [];
let listeners = [];
let seq = 1;

function emit() { listeners.forEach(l => l(toasts)); }

export function subscribe(l) {
  listeners.push(l);
  l(toasts);
  return () => { listeners = listeners.filter(x => x !== l); };
}

export function dismiss(id) {
  toasts = toasts.filter(t => t.id !== id);
  emit();
}

function push(kind, message, ttl = 4500) {
  const id = seq++;
  toasts = [...toasts, { id, kind, message: String(message || '') }];
  emit();
  if (ttl) setTimeout(() => dismiss(id), ttl);
  return id;
}

export const toast = {
  error: m => push('error', m),
  success: m => push('success', m),
  info: m => push('info', m),
};
