'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  resolvedTheme: 'dark',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  const applyTheme = useCallback((mode: ThemeMode) => {
    if (typeof window === 'undefined') return;

    let effectiveTheme: 'light' | 'dark' = 'dark';
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = prefersDark ? 'dark' : 'light';
    } else {
      effectiveTheme = mode;
    }

    setResolvedTheme(effectiveTheme);

    const root = document.documentElement;
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, []);

  const setTheme = useCallback(
    (newTheme: ThemeMode) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem('budgeti_theme', newTheme);
      } catch {
        // localStorage not available
      }
      applyTheme(newTheme);
    },
    [applyTheme]
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem('budgeti_theme') as ThemeMode | null;
      const initialTheme: ThemeMode = saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'dark';
      setThemeState(initialTheme);
      applyTheme(initialTheme);
    } catch {
      applyTheme('dark');
    }

    // Media query listener for system preference change
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const currentSaved = (localStorage.getItem('budgeti_theme') as ThemeMode) || 'dark';
      if (currentSaved === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
