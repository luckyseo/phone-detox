import type {ColorSchemeName} from 'react-native';

import {ThemeMode, type AppTheme} from './tokens';
import {darkTheme} from './themes/dark';
import {lightTheme} from './themes/light';

export function resolveTheme(
  mode: ThemeMode,
  systemScheme: ColorSchemeName | null,
  customTheme?: AppTheme,
): AppTheme {
  if (mode === ThemeMode.CUSTOM) {
    return customTheme ?? darkTheme;
  }

  if (mode === ThemeMode.LIGHT) {
    return lightTheme;
  }

  if (mode === ThemeMode.DARK) {
    return darkTheme;
  }

  return systemScheme === 'light' ? lightTheme : darkTheme;
}
