import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'enterprise-docs-theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as Theme;
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
  }
  
  return 'system';
}

function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove('light', 'dark');
  
  // Add new theme class
  root.classList.add(theme);
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      'content', 
      theme === 'dark' ? '#0f172a' : '#ffffff'
    );
  }
  
  // Update favicon based on theme
  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (favicon) {
    favicon.href = theme === 'dark' ? '/favicon-dark.svg' : '/favicon-light.svg';
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => getSystemTheme());

  // Calculate the actual theme being used
  const actualTheme = theme === 'system' ? systemTheme : theme;

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    if (theme === 'system') {
      // If using system theme, toggle to the opposite of current system theme
      setTheme(systemTheme === 'dark' ? 'light' : 'dark');
    } else {
      // If using explicit theme, toggle to the opposite
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  }, [theme, systemTheme, setTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Apply theme changes
  useEffect(() => {
    applyTheme(actualTheme);
  }, [actualTheme]);

  // Initialize theme on mount
  useEffect(() => {
    // Set initial theme class
    applyTheme(actualTheme);
    
    // Prevent flash of unstyled content
    document.documentElement.style.colorScheme = actualTheme;
  }, []);

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook for components that need to react to theme changes
export function useThemeEffect(callback: (theme: 'light' | 'dark') => void, deps: React.DependencyList = []) {
  const { actualTheme } = useTheme();
  
  useEffect(() => {
    callback(actualTheme);
  }, [actualTheme, ...deps]);
}