import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { colors, ThemeColors } from '../theme';

interface ThemeContextType {
  isDark: boolean;
  theme: ThemeColors;
  toggleTheme: () => void;
  setScheme: (mode: 'light' | 'dark' | 'system') => void;
  colorSchemeMode: 'light' | 'dark' | 'system';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [colorSchemeMode, setColorSchemeMode] = useState<'light' | 'dark' | 'system'>('system');

  const isDark = colorSchemeMode === 'system' ? systemScheme === 'dark' : colorSchemeMode === 'dark';

  const theme: ThemeColors = isDark ? colors.dark : colors.light;

  const toggleTheme = () => {
    setColorSchemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setScheme = (mode: 'light' | 'dark' | 'system') => {
    setColorSchemeMode(mode);
  };

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        theme,
        toggleTheme,
        setScheme,
        colorSchemeMode,
      }}
    >
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
