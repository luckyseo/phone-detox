import type {ColorSchemeName} from 'react-native';

import {ThemeMode, type AppTheme} from './tokens';
import {darkTheme} from './themes/dark';
import {lightTheme} from './themes/light';
import {pixelTheme} from './themes/pixel';
import {simpleTheme} from './themes/simple';

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

  if (mode === ThemeMode.SIMPLE_MODE) {
    return simpleTheme;
  }

  if (mode === ThemeMode.PIXEL_MODE) {
    return pixelTheme;
  }

  return systemScheme === 'light' ? lightTheme : darkTheme;
}
