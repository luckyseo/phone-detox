import {resolveTheme} from '../resolveTheme';
import {ThemeMode} from '../tokens';
import {darkTheme} from '../themes/dark';
import {lightTheme} from '../themes/light';

describe('resolveTheme', () => {
  it('uses explicit light and dark modes', () => {
    expect(resolveTheme(ThemeMode.LIGHT, 'dark')).toBe(lightTheme);
    expect(resolveTheme(ThemeMode.DARK, 'light')).toBe(darkTheme);
  });

  it('uses the system colour scheme for system mode', () => {
    expect(resolveTheme(ThemeMode.SYSTEM, 'light')).toBe(lightTheme);
    expect(resolveTheme(ThemeMode.SYSTEM, 'dark')).toBe(darkTheme);
    expect(resolveTheme(ThemeMode.SYSTEM, null)).toBe(darkTheme);
  });

  it('uses custom theme mode when a custom theme is provided', () => {
    expect(resolveTheme(ThemeMode.CUSTOM, 'light', lightTheme)).toBe(lightTheme);
  });
});
