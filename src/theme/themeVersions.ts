export enum ThemeVersion {
  SYSTEM = 'SYSTEM',
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  SIMPLE_MODE = 'SIMPLE_MODE',
  PIXEL_MODE = 'PIXEL_MODE',
}

export interface ThemeVersionOption {
  id: ThemeVersion;
  name: string;
  sample: string;
}

export const themeVersionOptions: ThemeVersionOption[] = [
  {id: ThemeVersion.SYSTEM, name: 'System', sample: '- . - .'},
  {id: ThemeVersion.LIGHT, name: 'Light', sample: '. . .'},
  {id: ThemeVersion.DARK, name: 'Dark', sample: '- - -'},
  {
    id: ThemeVersion.SIMPLE_MODE,
    name: 'Simple Mode',
    sample: '-.-. .. --',
  },
  {
    id: ThemeVersion.PIXEL_MODE,
    name: 'Pixel Mode',
    sample: '▣ ▤ ▦',
  },
];
