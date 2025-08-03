import React, { createContext, useContext, useEffect } from 'react';

// Simplified theme interface - professional light theme only
interface ThemeContextType {
  theme: 'light';
  actualTheme: 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Apply professional light theme styling
function applyLightTheme() {
  const root = document.documentElement;
  
  // Remove any existing theme classes
  root.classList.remove('light', 'dark');
  
  // Apply light theme class
  root.classList.add('light');
  
  // Set professional light theme color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', '#ffffff');
  }
  
  // Ensure favicon is set for light theme
  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (favicon && !favicon.href.includes('light')) {
    favicon.href = '/favicon-light.svg';
  }
  
  // Set color scheme for consistent browser styling
  root.style.colorScheme = 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize professional light theme on mount
  useEffect(() => {
    applyLightTheme();
  }, []);

  const value: ThemeContextType = {
    theme: 'light',
    actualTheme: 'light',
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

// Simplified hook for light theme - always returns 'light'
export function useThemeEffect(callback: (theme: 'light') => void, deps: React.DependencyList = []) {
  useEffect(() => {
    callback('light');
  }, [callback, ...deps]);
}