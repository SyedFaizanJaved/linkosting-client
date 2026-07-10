import { useEffect, useState } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);
  return { theme, toggle: () => setTheme(t => (t === 'light' ? 'dark' : 'light')) };
}
