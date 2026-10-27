import React, { createContext, useContext, ReactNode } from 'react';
import { Theme } from '../models/theme.model';
import { useThemePresenter } from '../presenters/useThemePresenter';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const themePresenter = useThemePresenter();

  return (
    <ThemeContext.Provider value={themePresenter}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
