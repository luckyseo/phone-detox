import React from 'react';

import {HomeScreen} from './src/features/focus/screens/HomeScreen';
import {ThemeProvider} from './src/theme/ThemeProvider';

export default function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <HomeScreen />
    </ThemeProvider>
  );
}
