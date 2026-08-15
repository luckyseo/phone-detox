import React from 'react';
import {SafeAreaView, StyleSheet, View, type ViewProps} from 'react-native';

import {useTheme} from '../../theme/ThemeProvider';

export function Screen({
  children,
  style,
  ...props
}: ViewProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, {backgroundColor: theme.colors.background}]}>
      <View
        {...props}
        style={[
          styles.content,
          {backgroundColor: theme.colors.background, padding: theme.spacing.lg},
          style,
        ]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
