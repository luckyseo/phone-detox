import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {Screen} from '../../../shared/components/Screen';
import {useTheme} from '../../../theme/ThemeProvider';

export function HomeScreen(): React.JSX.Element {
  const theme = useTheme();

  return (
    <Screen>
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.medium,
            padding: theme.spacing.lg,
          },
        ]}>
        <Text style={[styles.kicker, {color: theme.colors.accent}]}>
          Phone Detox
        </Text>
        <Text style={[styles.title, {color: theme.colors.textPrimary}]}>
          Build a focus session
        </Text>
        <Text style={[styles.body, {color: theme.colors.textSecondary}]}>
          Phase 0 is ready for the timer, task, and native Screen Time slices.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  header: {
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  kicker: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
});
