import React, {createContext, useContext, useMemo} from 'react';
import {useColorScheme} from 'react-native';

import {resolveTheme} from './resolveTheme';
import {type AppTheme, ThemeMode} from './tokens';

const ThemeContext = createContext<AppTheme | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
  mode?: ThemeMode;
  customTheme?: AppTheme;
}

export function ThemeProvider({
  children,
  mode = ThemeMode.SYSTEM,
  customTheme,
}: ThemeProviderProps): React.JSX.Element {
  const systemScheme = useColorScheme();
  const theme = useMemo(
    () => resolveTheme(mode, systemScheme, customTheme),
    [customTheme, mode, systemScheme],
  );

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): AppTheme {
  const theme = useContext(ThemeContext);

  if (!theme) {
    throw new Error('useTheme must be used within ThemeProvider.');
  }

  return theme;
}
