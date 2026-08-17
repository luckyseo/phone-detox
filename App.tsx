import React, {useState} from 'react';

import {HomeScreen} from './src/features/focus/screens/HomeScreen';
import {ThemeProvider} from './src/theme/ThemeProvider';
import {
  ThemeVersion,
  themeVersionOptions,
} from './src/theme/themeVersions';
import {ThemeMode} from './src/theme/tokens';

export default function App(): React.JSX.Element {
  const [themeVersion, setThemeVersion] = useState(ThemeVersion.SYSTEM);
  const themeMode = getThemeMode(themeVersion);

  return (
    <ThemeProvider mode={themeMode}>
      <HomeScreen
        onThemeVersionChange={setThemeVersion}
        selectedThemeVersion={themeVersion}
        themeVersionOptions={themeVersionOptions}
      />
    </ThemeProvider>
  );
}

function getThemeMode(themeVersion: ThemeVersion): ThemeMode {
  if (themeVersion === ThemeVersion.LIGHT) {
    return ThemeMode.LIGHT;
  }

  if (themeVersion === ThemeVersion.DARK) {
    return ThemeMode.DARK;
  }

  if (themeVersion === ThemeVersion.SIMPLE_MODE) {
    return ThemeMode.SIMPLE_MODE;
  }

  if (themeVersion === ThemeVersion.PIXEL_MODE) {
    return ThemeMode.PIXEL_MODE;
  }

  return ThemeMode.SYSTEM;
}
