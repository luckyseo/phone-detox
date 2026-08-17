import React, {useEffect, useMemo, useState} from 'react';
import {
  Pressable,
  ScrollView,
  type StyleProp,
  Text,
  TextInput,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';

import {Screen} from '../../../shared/components/Screen';
import {useTheme} from '../../../theme/ThemeProvider';
import {
  ThemeVersion,
  type ThemeVersionOption,
} from '../../../theme/themeVersions';
import {styles} from './HomeScreen.styles';

type Mode = 'timer' | 'tasks';
type ViewName = 'setup' | 'apps' | 'themes' | 'active' | 'done' | 'blocked';
type DurationPart = 'hours' | 'minutes';
type PixelIconKind =
  | 'clock'
  | 'task'
  | 'phone'
  | 'message'
  | 'music'
  | 'plus'
  | 'minus'
  | 'settings'
  | 'sparkle';

interface AllowedApp {
  id: string;
  name: string;
  color: string;
  label: string;
  essential?: boolean;
}

interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
}

const availableApps: AllowedApp[] = [
  {id: 'phone', name: 'Phone', color: '#34C759', label: 'P', essential: true},
  {id: 'messages', name: 'Messages', color: '#30D158', label: 'M', essential: true},
  {id: 'facetime', name: 'FaceTime', color: '#32D74B', label: 'F', essential: true},
  {id: 'spotify', name: 'Spotify', color: '#1DB954', label: 'S'},
  {id: 'whatsapp', name: 'WhatsApp', color: '#25D366', label: 'W'},
  {id: 'instagram', name: 'Instagram', color: '#E4405F', label: 'I'},
  {id: 'youtube', name: 'YouTube', color: '#FF0033', label: 'Y'},
  {id: 'reddit', name: 'Reddit', color: '#FF4500', label: 'R'},
  {id: 'safari', name: 'Safari', color: '#0A84FF', label: 'S'},
];

const initialAllowedAppIds = ['phone', 'messages', 'spotify'];

const initialTasks: TaskItem[] = [
  {id: 'stripe', title: 'Finish Stripe ticket', completed: false},
  {id: 'email', title: 'Reply to email', completed: false},
  {id: 'laundry', title: 'Wash clothes', completed: false},
];

const pixelBurnSegmentCount = 56;
const pixelTimerBoxSize = 294;
const pixelBurnCellSize = 6;

function pressedStyle(
  baseStyle: StyleProp<ViewStyle>,
): ({pressed}: {pressed: boolean}) => StyleProp<ViewStyle> {
  return ({pressed}) => [
    baseStyle,
    styles.buttonRaised,
    pressed ? styles.buttonPressed : null,
  ];
}

export interface HomeScreenProps {
  onThemeVersionChange: (themeVersion: ThemeVersion) => void;
  selectedThemeVersion: ThemeVersion;
  themeVersionOptions: ThemeVersionOption[];
}

export function HomeScreen({
  onThemeVersionChange,
  selectedThemeVersion,
  themeVersionOptions,
}: HomeScreenProps): React.JSX.Element {
  const theme = useTheme();
  const [mode, setMode] = useState<Mode>('timer');
  const [view, setView] = useState<ViewName>('setup');
  const [minutes, setMinutes] = useState(30);
  const [editingDurationPart, setEditingDurationPart] =
    useState<DurationPart | null>(null);
  const [durationDraft, setDurationDraft] = useState('');
  const [allowedAppIds, setAllowedAppIds] = useState(initialAllowedAppIds);
  const [tasks, setTasks] = useState(initialTasks);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskDraftTitle, setTaskDraftTitle] = useState('');
  const [taskCompletionBannerVisible, setTaskCompletionBannerVisible] =
    useState(false);
  const [taskCompletionSecondsRemaining, setTaskCompletionSecondsRemaining] =
    useState(3);
  const [endFocusConfirmVisible, setEndFocusConfirmVisible] = useState(false);

  const allowedApps = useMemo(
    () => availableApps.filter(app => allowedAppIds.includes(app.id)),
    [allowedAppIds],
  );
  const durationParts = getDurationParts(minutes);
  const allTasksCompleted =
    tasks.length > 0 && tasks.every(task => task.completed);
  const isPixelTheme = selectedThemeVersion === ThemeVersion.PIXEL_MODE;
  const pixelLineStyle = isPixelTheme ? styles.pixelLine : null;
  const pixelTextStyle = isPixelTheme ? styles.pixelText : null;

  useEffect(() => {
    if (view !== 'active' || mode !== 'tasks' || !allTasksCompleted) {
      setTaskCompletionBannerVisible(false);
      setTaskCompletionSecondsRemaining(3);
      return;
    }

    setTaskCompletionBannerVisible(true);
    setTaskCompletionSecondsRemaining(3);

    const intervalId = setInterval(() => {
      setTaskCompletionSecondsRemaining(current => Math.max(1, current - 1));
    }, 1000);

    const timeoutId = setTimeout(() => {
      setTaskCompletionBannerVisible(false);
      setTaskCompletionSecondsRemaining(3);
      setView('setup');
    }, 3000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [allTasksCompleted, mode, view]);

  const startEditingTask = (task: TaskItem): void => {
    setEditingTaskId(task.id);
    setTaskDraftTitle(task.title);
  };

  const saveTaskDraft = (): void => {
    if (!editingTaskId) {
      return;
    }

    const trimmedTitle = taskDraftTitle.trim();

    if (!trimmedTitle) {
      return;
    }

    setTasks(current =>
      current.map(task =>
        task.id === editingTaskId ? {...task, title: trimmedTitle} : task,
      ),
    );

    setEditingTaskId(null);
    setTaskDraftTitle('');
  };

  const addTask = (): void => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: 'New task',
      completed: false,
    };

    setTasks(current => [...current, newTask]);
    setEditingTaskId(newTask.id);
    setTaskDraftTitle(newTask.title);
  };

  const deleteTask = (taskId: string): void => {
    setTasks(current => current.filter(task => task.id !== taskId));

    if (editingTaskId === taskId) {
      setEditingTaskId(null);
      setTaskDraftTitle('');
    }
  };

  const startEditingDurationPart = (part: DurationPart): void => {
    setDurationDraft(String(getDurationParts(minutes)[part]));
    setEditingDurationPart(part);
  };

  const saveDurationDraft = (): void => {
    if (!editingDurationPart) {
      return;
    }

    const parsedValue = Number.parseInt(durationDraft, 10);

    if (Number.isNaN(parsedValue)) {
      setEditingDurationPart(null);
      setDurationDraft('');
      return;
    }

    const currentParts = getDurationParts(minutes);
    const nextHours =
      editingDurationPart === 'hours' ? parsedValue : currentParts.hours;
    const nextMinutePart =
      editingDurationPart === 'minutes' ? parsedValue : currentParts.minutes;
    const nextTotalMinutes = Math.min(
      180,
      Math.max(5, nextHours * 60 + Math.min(59, nextMinutePart)),
    );

    setMinutes(nextTotalMinutes);
    setEditingDurationPart(null);
    setDurationDraft('');
  };

  const startFocus = (): void => {
    setTaskCompletionBannerVisible(false);
    setEndFocusConfirmVisible(false);

    if (mode === 'tasks') {
      setTasks(current =>
        current.map(task => ({
          ...task,
          completed: false,
        })),
      );
    }

    setView('active');
  };

  const requestEndFocus = (): void => {
    if (mode === 'tasks' && allTasksCompleted) {
      setView('done');
      return;
    }

    setEndFocusConfirmVisible(true);
  };

  const confirmEndFocus = (): void => {
    setEndFocusConfirmVisible(false);
    setView('done');
  };

  if (view === 'apps') {
    return (
      <Screen>
        <ScrollView
          contentContainerStyle={[
            styles.page,
            {paddingBottom: theme.spacing.xl},
          ]}
          showsVerticalScrollIndicator={false}>
          <TopBar title="Choose allowed apps" onBack={() => setView('setup')} />
          <View
            style={[
              styles.searchBox,
              pixelLineStyle,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderRadius: theme.radius.medium,
              },
            ]}>
            <Text style={[styles.searchText, {color: theme.colors.textSecondary}]}>
              Search apps
            </Text>
          </View>
          <AppSection
            title="Essential"
            apps={availableApps.filter(app => app.essential)}
            selectedIds={allowedAppIds}
            onToggle={appId =>
              setAllowedAppIds(current => toggleApp(current, appId))
            }
          />
          <AppSection
            title="Other"
            apps={availableApps.filter(app => !app.essential)}
            selectedIds={allowedAppIds}
            onToggle={appId =>
              setAllowedAppIds(current => toggleApp(current, appId))
            }
          />
          <PrimaryButton label="Done" onPress={() => setView('setup')} />
        </ScrollView>
      </Screen>
    );
  }

  if (view === 'themes') {
    return (
      <Screen>
        <ScrollView
          contentContainerStyle={[
            styles.page,
            {paddingBottom: theme.spacing.xl},
          ]}
          showsVerticalScrollIndicator={false}>
          <TopBar title="Theme versions" onBack={() => setView('setup')} />
          <View style={styles.themeList}>
            {themeVersionOptions.map(option => (
              <ThemeVersionRow
                key={option.id}
                option={option}
                selected={option.id === selectedThemeVersion}
                onPress={() => {
                  onThemeVersionChange(option.id);
                  setView('setup');
                }}
              />
            ))}
          </View>
        </ScrollView>
      </Screen>
    );
  }

  if (view === 'active') {
    return (
      <DarkPhoneSurface
        pixelMode={isPixelTheme}
        onBack={() => {
          setEndFocusConfirmVisible(false);
          setView('setup');
        }}>
        {mode === 'timer' ? (
          <TimerActive
            minutes={minutes}
            allowedApps={allowedApps}
            pixelMode={isPixelTheme}
            onComplete={() => setView('done')}
            onEnd={requestEndFocus}
          />
        ) : (
          <TasksActive
            tasks={tasks}
            allowedApps={allowedApps}
            completionBannerVisible={taskCompletionBannerVisible}
            completionSecondsRemaining={taskCompletionSecondsRemaining}
            pixelMode={isPixelTheme}
            onToggleTask={taskId =>
              setTasks(current =>
                current.map(task =>
                  task.id === taskId
                    ? {...task, completed: !task.completed}
                    : task,
                ),
              )
            }
            onEnd={requestEndFocus}
          />
        )}
        {endFocusConfirmVisible ? (
          <EndFocusConfirm
            pixelMode={isPixelTheme}
            onCancel={() => setEndFocusConfirmVisible(false)}
            onConfirm={confirmEndFocus}
          />
        ) : null}
      </DarkPhoneSurface>
    );
  }

  if (view === 'done') {
    return (
      <DarkPhoneSurface pixelMode={isPixelTheme} onBack={() => setView('setup')}>
        <View style={styles.doneWrap}>
          <View
            style={[
              styles.doneBadge,
              {backgroundColor: theme.colors.success},
            ]}>
            <Text style={[styles.doneCheck, {color: theme.colors.background}]}>
              ✓
            </Text>
          </View>
          <Text style={[styles.darkTitle, {color: theme.colors.textPrimary}]}>
            All done!
          </Text>
          <Text style={[styles.darkSubtitle, {color: theme.colors.textSecondary}]}>
            Your focus session is complete.{'\n'}Your apps are available again.
          </Text>
        </View>
        <Pressable
          style={pressedStyle([
            styles.lightDoneButton,
            {
              backgroundColor: theme.colors.textPrimary,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.medium,
            },
          ])}
          onPress={() => {
            setTasks(initialTasks);
            setView('setup');
          }}>
          <Text
            style={[
              styles.lightDoneButtonText,
              {color: theme.colors.background},
            ]}>
            Done
          </Text>
        </Pressable>
      </DarkPhoneSurface>
    );
  }

  if (view === 'blocked') {
    return (
      <DarkPhoneSurface pixelMode={isPixelTheme} onBack={() => setView('setup')}>
        <View style={styles.blockedWrap}>
          <View
            style={[
              styles.hourglass,
              {backgroundColor: theme.colors.surfaceElevated},
            ]}>
            <Text style={[styles.hourglassText, {color: theme.colors.textPrimary}]}>
              ⌛
            </Text>
          </View>
          <Text style={[styles.darkTitle, {color: theme.colors.textPrimary}]}>
            Focus in progress
          </Text>
          <Text style={[styles.darkSubtitle, {color: theme.colors.textSecondary}]}>
            You chose to stay away from Instagram.{'\n\n'}
            Finish your focus session to unlock this app.
          </Text>
        </View>
        <Pressable
          style={pressedStyle([
            styles.secondaryDarkButton,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.medium,
            },
          ])}
          onPress={() => setView('active')}>
          <Text
            style={[
              styles.secondaryDarkButtonText,
              {color: theme.colors.textPrimary},
            ]}>
            Go Back
          </Text>
        </Pressable>
      </DarkPhoneSurface>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[
          styles.page,
          isPixelTheme ? styles.pixelScreenFrame : null,
          {paddingBottom: theme.spacing.xl},
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.statusSpacer} />
        <View style={styles.setupTopBar}>
          {mode === 'tasks' ? (
            <Pressable
              accessibilityLabel="Back to timer focus"
              hitSlop={12}
              onPress={() => {
                setEditingTaskId(null);
                setTaskDraftTitle('');
                setMode('timer');
              }}
              style={styles.setupBackButton}>
              <Text style={[styles.backText, {color: theme.colors.textPrimary}]}>
                ‹
              </Text>
            </Pressable>
          ) : (
            <View style={styles.setupBackButton} />
          )}
          <Pressable
            accessibilityLabel="Open theme settings"
            onPress={() => setView('themes')}
            style={styles.settingsButton}>
            {isPixelTheme ? (
              <PixelIcon
                color={theme.colors.textPrimary}
                kind="settings"
                size={24}
              />
            ) : (
              <Text style={[styles.settingsText, {color: theme.colors.textSecondary}]}>
                ⚙
              </Text>
            )}
          </Pressable>
        </View>
        <Text
          style={[
            styles.setupTitle,
            pixelTextStyle,
            {color: theme.colors.textPrimary},
          ]}>
          {mode === 'timer'
            ? `${isPixelTheme ? '* ' : ''}What do you want\nto focus on?${
                isPixelTheme ? ' *' : ''
              }`
            : `${isPixelTheme ? '* ' : ''}What do you need\nto get done?${
                isPixelTheme ? ' *' : ''
              }`}
        </Text>

        {mode === 'timer' ? (
          <>
            <View style={styles.modeGrid}>
              <ModeTile
                active={mode === 'timer'}
                iconKind="clock"
                label="Timer"
                mark="◷"
                pixelMode={isPixelTheme}
                lineStyle={pixelLineStyle}
                onPress={() => setMode('timer')}
              />
              <ModeTile
                active={false}
                iconKind="task"
                label="Tasks"
                mark={isPixelTheme ? '✓' : '□'}
                pixelMode={isPixelTheme}
                lineStyle={pixelLineStyle}
                onPress={() => setMode('tasks')}
              />
            </View>
            <Text
              style={[
                styles.caption,
                pixelTextStyle,
                {color: theme.colors.textSecondary},
              ]}>
              {isPixelTheme ? '* Focus for *' : 'Focus for'}
            </Text>
            <View style={styles.durationPartsRow}>
              <DurationPartInput
                editing={editingDurationPart === 'hours'}
                label="H"
                onChangeDraft={setDurationDraft}
                onEdit={() => startEditingDurationPart('hours')}
                onSave={saveDurationDraft}
                themeColor={theme.colors.textPrimary}
                value={durationParts.hours}
                draftValue={durationDraft}
              />
              <DurationPartInput
                editing={editingDurationPart === 'minutes'}
                label="M"
                onChangeDraft={setDurationDraft}
                onEdit={() => startEditingDurationPart('minutes')}
                onSave={saveDurationDraft}
                themeColor={theme.colors.textPrimary}
                value={durationParts.minutes}
                draftValue={durationDraft}
              />
            </View>
            <View style={styles.durationControls}>
              <RoundControl
                label="-"
                pixelMode={isPixelTheme}
                onPress={() => {
                  setEditingDurationPart(null);
                  setDurationDraft('');
                  setMinutes(current => Math.max(5, current - 5));
                }}
              />
              <Text
                style={[
                  styles.durationLabel,
                  pixelTextStyle,
                  {color: theme.colors.textPrimary},
                ]}>
                {minutes} {isPixelTheme ? 'MIN' : 'min'}
              </Text>
              <RoundControl
                label="+"
                pixelMode={isPixelTheme}
                onPress={() => {
                  setEditingDurationPart(null);
                  setDurationDraft('');
                  setMinutes(current => Math.min(180, current + 5));
                }}
              />
            </View>
          </>
        ) : (
          <View style={styles.taskSetupList}>
            {tasks.map(task => (
              <TaskSetupRow
                key={task.id}
                draftTitle={taskDraftTitle}
                isEditing={editingTaskId === task.id}
                onChangeDraftTitle={setTaskDraftTitle}
                onDelete={() => deleteTask(task.id)}
                onEdit={() => startEditingTask(task)}
                onSave={saveTaskDraft}
                lineStyle={pixelLineStyle}
                task={task}
              />
            ))}
            <Pressable
              onPress={addTask}
              style={pressedStyle([
                styles.addTaskRow,
                pixelLineStyle,
                {backgroundColor: theme.colors.surfaceElevated},
              ])}>
              <Text style={[styles.plus, {color: theme.colors.textPrimary}]}>+</Text>
              <Text style={[styles.taskSetupText, {color: theme.colors.textPrimary}]}>
                Add task
              </Text>
            </Pressable>
          </View>
        )}

        <AllowedAppsStrip
          apps={allowedApps}
          pixelMode={isPixelTheme}
          lineStyle={pixelLineStyle}
          textStyle={pixelTextStyle}
          onAdd={() => setView('apps')}
        />

        <PrimaryButton
          label="Start Focus"
          lineStyle={pixelLineStyle}
          textStyle={pixelTextStyle}
          pixelMode={isPixelTheme}
          onPress={startFocus}
        />
        <Pressable
          style={styles.previewBlocked}
          onPress={() => setView('blocked')}>
          <Text
            style={[
              styles.previewBlockedText,
              pixelTextStyle,
              {color: theme.colors.textSecondary},
            ]}>
            Preview blocked app screen
          </Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function TopBar({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={styles.topBar}>
      <Pressable
        onPress={onBack}
        hitSlop={12}
        style={styles.setupBackButton}>
        <Text style={[styles.backText, {color: theme.colors.textPrimary}]}>‹</Text>
      </Pressable>
      <Text style={[styles.topTitle, {color: theme.colors.textPrimary}]}>
        {title}
      </Text>
      <View style={styles.topBarEnd} />
    </View>
  );
}

function ThemeVersionRow({
  option,
  selected,
  onPress,
}: {
  option: ThemeVersionOption;
  selected: boolean;
  onPress: () => void;
}): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={pressedStyle([
        styles.themeRow,
        {
          backgroundColor: selected
            ? theme.colors.surfaceElevated
            : theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ])}>
      <View style={styles.themePreview}>
        <Text style={[styles.themePreviewText, {color: theme.colors.textPrimary}]}>
          {option.sample}
        </Text>
      </View>
      <View style={styles.themeCopy}>
        <Text style={[styles.themeName, {color: theme.colors.textPrimary}]}>
          {option.name}
        </Text>
        <Text style={[styles.themeSample, {color: theme.colors.textSecondary}]}>
          1-bit dots and dashes
        </Text>
      </View>
      <Text
        style={[
          styles.themeSelectedMark,
          {color: selected ? theme.colors.accent : 'transparent'},
        ]}>
        ✓
      </Text>
    </Pressable>
  );
}

const pixelIconPatterns: Record<PixelIconKind, string[]> = {
  clock: [
    '0011100',
    '0100010',
    '1001001',
    '1001011',
    '1001111',
    '0100010',
    '0011100',
  ],
  task: [
    '0000000',
    '0000001',
    '0000011',
    '1000110',
    '1101100',
    '0111000',
    '0010000',
  ],
  phone: ['01100', '10010', '10000', '10010', '01100'],
  message: ['11110', '10010', '11110', '01000', '00100'],
  music: ['00111', '00101', '00101', '11101', '11100'],
  plus: ['00100', '00100', '11111', '00100', '00100'],
  minus: ['00000', '00000', '11111', '00000', '00000'],
  settings: ['10101', '01110', '11111', '01110', '10101'],
  sparkle: ['00100', '00100', '11111', '00100', '00100'],
};

function PixelIcon({
  color,
  kind,
  size,
}: {
  color: string;
  kind: PixelIconKind;
  size: number;
}): React.JSX.Element {
  const pattern = pixelIconPatterns[kind];
  const cellSize = size / pattern[0].length;

  return (
    <View style={[styles.pixelIcon, {height: size, width: size}]}>
      {pattern.map((row, rowIndex) => (
        <View key={`${kind}-${rowIndex}`} style={styles.pixelIconRow}>
          {row.split('').map((cell, columnIndex) => (
            <View
              key={`${kind}-${rowIndex}-${columnIndex}`}
              style={[
                styles.pixelIconCell,
                {
                  backgroundColor: cell === '1' ? color : 'transparent',
                  height: cellSize,
                  width: cellSize,
                },
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function ModeTile({
  active,
  iconKind,
  label,
  lineStyle,
  mark,
  pixelMode = false,
  onPress,
}: {
  active: boolean;
  iconKind: PixelIconKind;
  label: string;
  lineStyle?: StyleProp<ViewStyle>;
  mark: string;
  pixelMode?: boolean;
  onPress: () => void;
}): React.JSX.Element {
  const theme = useTheme();
  const modeIconColor = active
    ? theme.colors.background
    : theme.colors.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      style={pressedStyle([
        styles.modeTile,
        {
          backgroundColor: active
            ? theme.colors.textPrimary
            : theme.colors.surfaceElevated,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.large,
        },
        lineStyle,
      ])}>
      <View
        style={[
          styles.modeIcon,
          pixelMode ? styles.pixelModeIconBare : null,
          {
            borderColor: active ? theme.colors.textSecondary : theme.colors.border,
          },
        ]}>
        {pixelMode ? (
          <PixelIcon color={modeIconColor} kind={iconKind} size={40} />
        ) : (
          <Text
            style={[
              styles.modeIconText,
              {color: active ? theme.colors.background : theme.colors.textPrimary},
            ]}>
            {mark}
          </Text>
        )}
      </View>
      <Text
        style={[
          styles.modeLabel,
          pixelMode ? styles.pixelText : null,
          {color: active ? theme.colors.background : theme.colors.textPrimary},
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

function RoundControl({
  label,
  pixelMode = false,
  onPress,
}: {
  label: string;
  pixelMode?: boolean;
  onPress: () => void;
}): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.roundControl,
        pixelMode ? styles.pixelOctagonButton : null,
        {
          backgroundColor: theme.colors.surfaceElevated,
          borderColor: theme.colors.border,
        },
      ]}>
      {pixelMode ? (
        <PixelIcon
          color={theme.colors.textPrimary}
          kind={label === '+' ? 'plus' : 'minus'}
          size={24}
        />
      ) : (
        <Text style={[styles.roundControlText, {color: theme.colors.textPrimary}]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

function DurationPartInput({
  draftValue,
  editing,
  label,
  onChangeDraft,
  onEdit,
  onSave,
  themeColor,
  value,
}: {
  draftValue: string;
  editing: boolean;
  label: 'H' | 'M';
  onChangeDraft: (value: string) => void;
  onEdit: () => void;
  onSave: () => void;
  themeColor: string;
  value: number;
}): React.JSX.Element {
  if (editing) {
    return (
      <View style={styles.durationPart}>
        <TextInput
          autoFocus
          inputMode="numeric"
          keyboardType="number-pad"
          onBlur={onSave}
          onChangeText={nextValue =>
            onChangeDraft(nextValue.replace(/[^0-9]/g, '').slice(0, 2))
          }
          onSubmitEditing={onSave}
          returnKeyType="done"
          selectTextOnFocus
          style={[styles.durationPartInput, {color: themeColor}]}
          value={draftValue}
        />
        <Text style={[styles.durationPartSuffix, {color: themeColor}]}>
          {label}
        </Text>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel={`Edit focus duration ${label}`}
      onPress={onEdit}
      style={styles.durationPart}>
      <Text style={[styles.durationPartText, {color: themeColor}]}>
        {formatDurationPart(value)}
      </Text>
      <Text style={[styles.durationPartSuffix, {color: themeColor}]}>
        {label}
      </Text>
    </Pressable>
  );
}

function AllowedAppsStrip({
  apps,
  lineStyle,
  pixelMode = false,
  textStyle,
  onAdd,
}: {
  apps: AllowedApp[];
  lineStyle?: StyleProp<ViewStyle>;
  pixelMode?: boolean;
  textStyle?: StyleProp<TextStyle>;
  onAdd: () => void;
}): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={styles.allowedBlock}>
      <Text
        style={[
          styles.sectionTitle,
          textStyle,
          {color: theme.colors.textSecondary},
        ]}>
        Allowed apps during focus
      </Text>
      <View
        style={[
          styles.divider,
          lineStyle ? styles.pixelDivider : null,
          {backgroundColor: theme.colors.border},
        ]}
      />
      <View style={styles.allowedRow}>
        {apps.slice(0, 3).map(app => (
          <View key={app.id} style={styles.allowedItem}>
            <AppIcon app={app} lineStyle={lineStyle} pixelMode={pixelMode} />
            <Text
              numberOfLines={1}
              style={[
                styles.allowedLabel,
                textStyle,
                {color: theme.colors.textSecondary},
              ]}>
              {app.name}
            </Text>
          </View>
        ))}
        <Pressable style={styles.allowedItem} onPress={onAdd}>
          <View
            style={[
              styles.addAppIcon,
              lineStyle,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
              },
            ]}>
            {pixelMode ? (
              <PixelIcon color={theme.colors.textPrimary} kind="plus" size={28} />
            ) : (
              <Text style={[styles.addAppText, {color: theme.colors.textPrimary}]}>
                +
              </Text>
            )}
          </View>
          <Text
            style={[
              styles.allowedLabel,
              textStyle,
              {color: theme.colors.textSecondary},
            ]}>
            Add
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function AppSection({
  title,
  apps,
  selectedIds,
  onToggle,
}: {
  title: string;
  apps: AllowedApp[];
  selectedIds: string[];
  onToggle: (appId: string) => void;
}): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={styles.appSection}>
      <Text style={[styles.appSectionTitle, {color: theme.colors.textSecondary}]}>
        {title}
      </Text>
      {apps.map(app => {
        const selected = selectedIds.includes(app.id);

        return (
          <Pressable
            key={app.id}
            style={pressedStyle(styles.appRow)}
            onPress={() => onToggle(app.id)}>
            <AppIcon app={app} />
            <Text style={[styles.appName, {color: theme.colors.textPrimary}]}>
              {app.name}
            </Text>
            <View
              style={[
                styles.checkCircle,
                {
                  backgroundColor: selected
                    ? theme.colors.textPrimary
                    : theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <Text
                style={[
                  styles.checkMark,
                  {color: selected ? theme.colors.background : 'transparent'},
                ]}>
                ✓
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function TaskSetupRow({
  draftTitle,
  isEditing,
  lineStyle,
  onChangeDraftTitle,
  onDelete,
  onEdit,
  onSave,
  task,
}: {
  draftTitle: string;
  isEditing: boolean;
  lineStyle?: StyleProp<ViewStyle>;
  onChangeDraftTitle: (title: string) => void;
  onDelete: () => void;
  onEdit: () => void;
  onSave: () => void;
  task: TaskItem;
}): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.taskSetupRow,
        lineStyle,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
      ]}>
      <View style={[styles.emptyTaskDot, {borderColor: theme.colors.border}]} />
      {isEditing ? (
        <>
          <TextInput
            autoFocus
            onChangeText={onChangeDraftTitle}
            onSubmitEditing={onSave}
            placeholder="Task name"
            placeholderTextColor={theme.colors.textSecondary}
            returnKeyType="done"
            selectTextOnFocus
            style={[
              styles.inlineTaskInput,
              {color: theme.colors.textPrimary},
            ]}
            value={draftTitle}
          />
          <Pressable
            accessibilityLabel="Save task"
            hitSlop={8}
            onPress={onSave}
            style={styles.taskIconButton}>
            <Text style={[styles.taskActionText, {color: theme.colors.accent}]}>
              ✓
            </Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={[styles.taskSetupText, {color: theme.colors.textPrimary}]}>
            {task.title}
          </Text>
          <View style={styles.taskActions}>
            <Pressable
              accessibilityLabel={`Edit ${task.title}`}
              hitSlop={8}
              onPress={onEdit}
              style={styles.taskIconButton}>
              <Text
                style={[
                  styles.taskActionText,
                  {color: theme.colors.textSecondary},
                ]}>
                ✎
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel={`Delete ${task.title}`}
              hitSlop={8}
              onPress={onDelete}
              style={styles.taskIconButton}>
              <Text style={[styles.taskActionText, {color: theme.colors.danger}]}>
                ⌫
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

function TimerActive({
  minutes,
  allowedApps,
  pixelMode = false,
  onComplete,
  onEnd,
}: {
  minutes: number;
  allowedApps: AllowedApp[];
  pixelMode?: boolean;
  onComplete: () => void;
  onEnd: () => void;
}): React.JSX.Element {
  const theme = useTheme();
  const totalSeconds = Math.max(1, minutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);

  useEffect(() => {
    setRemainingSeconds(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRemainingSeconds(current => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (remainingSeconds === 0) {
      onComplete();
    }
  }, [onComplete, remainingSeconds]);

  const remainingRatio = remainingSeconds / totalSeconds;

  return (
    <>
      <View style={styles.activeHeader}>
        <Text
          style={[
            styles.darkTitle,
            pixelMode ? styles.pixelText : null,
            {color: theme.colors.textPrimary},
          ]}>
          {pixelMode ? 'FOCUS START' : 'Focus'}
        </Text>
        <Text
          style={[
            styles.darkSubtitle,
            pixelMode ? styles.pixelText : null,
            {color: theme.colors.textSecondary},
          ]}>
          {pixelMode ? 'STAY FOCUSED' : 'Stay focused. You got this.'}
        </Text>
      </View>
      <View
        style={[
          styles.timerRing,
          pixelMode ? styles.pixelTimerRing : null,
          {borderColor: theme.colors.border},
        ]}>
        {pixelMode ? (
          <PixelTimerBurnFrame
            color={theme.colors.textPrimary}
            remainingRatio={remainingRatio}
          />
        ) : null}
        <Text
          style={[
            styles.timerText,
            pixelMode ? styles.pixelText : null,
            {color: theme.colors.textPrimary},
          ]}>
          {formatActiveTimer(remainingSeconds)}
        </Text>
        <View
          style={[
            styles.pauseButton,
            pixelMode ? styles.pixelLine : null,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
              borderRadius: pixelMode ? 0 : theme.radius.pill,
            },
          ]}>
          <Text
            style={[
              styles.pauseText,
              {color: theme.colors.textPrimary},
            ]}>
            Ⅱ
          </Text>
        </View>
      </View>
      <DarkAllowedApps apps={allowedApps} pixelMode={pixelMode} />
      <EndButton onPress={onEnd} pixelMode={pixelMode} />
    </>
  );
}

function PixelTimerBurnFrame({
  color,
  remainingRatio,
}: {
  color: string;
  remainingRatio: number;
}): React.JSX.Element {
  const clampedRemainingRatio = Math.max(0, Math.min(1, remainingRatio));
  const litSegmentCount = Math.ceil(
    pixelBurnSegmentCount * clampedRemainingRatio,
  );
  const fireIndex = Math.min(
    pixelBurnSegmentCount - 1,
    Math.max(
      0,
      Math.floor(pixelBurnSegmentCount * (1 - clampedRemainingRatio)),
    ),
  );

  return (
    <View pointerEvents="none" style={styles.pixelBurnFrame}>
      {Array.from({length: pixelBurnSegmentCount}).map((_, index) => {
        const point = getPixelBurnPoint(index);
        const isRemaining = index >= fireIndex && index < fireIndex + litSegmentCount;

        return (
          <View
            key={`burn-${index}`}
            style={[
              styles.pixelBurnSegment,
              {
                backgroundColor: isRemaining ? color : 'transparent',
                borderColor: color,
                left: point.left,
                opacity: isRemaining ? 1 : 0.18,
                top: point.top,
              },
            ]}
          />
        );
      })}
      <View
        style={[
          styles.pixelBurnSpark,
          {
            backgroundColor: color,
            left: getPixelBurnPoint(fireIndex).left - 3,
            top: getPixelBurnPoint(fireIndex).top - 3,
          },
        ]}>
        <View style={[styles.pixelBurnSparkCell, styles.pixelBurnSparkTop]} />
        <View style={[styles.pixelBurnSparkCell, styles.pixelBurnSparkLeft]} />
        <View style={[styles.pixelBurnSparkCell, styles.pixelBurnSparkRight]} />
        <View style={[styles.pixelBurnSparkCell, styles.pixelBurnSparkBottom]} />
      </View>
    </View>
  );
}

function TasksActive({
  tasks,
  allowedApps,
  completionBannerVisible,
  completionSecondsRemaining,
  pixelMode = false,
  onToggleTask,
  onEnd,
}: {
  tasks: TaskItem[];
  allowedApps: AllowedApp[];
  completionBannerVisible: boolean;
  completionSecondsRemaining: number;
  pixelMode?: boolean;
  onToggleTask: (taskId: string) => void;
  onEnd: () => void;
}): React.JSX.Element {
  const theme = useTheme();
  const completed = tasks.filter(task => task.completed).length;

  return (
    <>
      <View style={styles.activeHeader}>
        <Text
          style={[
            styles.darkTitle,
            pixelMode ? styles.pixelText : null,
            {color: theme.colors.textPrimary},
          ]}>
          {pixelMode ? 'FOCUSING...' : 'Focus'}
        </Text>
        <Text
          style={[
            styles.darkSubtitle,
            pixelMode ? styles.pixelText : null,
            {color: theme.colors.textSecondary},
          ]}>
          {pixelMode ? 'COMPLETE TASKS TO UNLOCK' : 'Finish your tasks to unlock.'}
        </Text>
      </View>
      <View style={styles.taskProgressRow}>
        <Text
          style={[
            styles.progressDone,
            {color: theme.colors.success},
          ]}>
          {completed}
        </Text>
        <Text
          style={[
            styles.progressTotal,
            {color: theme.colors.textPrimary},
          ]}>
          {' '}
          / {tasks.length}
        </Text>
      </View>
      <View
        style={[
          styles.progressTrack,
          pixelMode ? styles.pixelLine : null,
          {
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.border,
          },
        ]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: pixelMode
                ? theme.colors.textPrimary
                : theme.colors.success,
            },
            {width: `${Math.max(8, (completed / tasks.length) * 100)}%`},
          ]}
        />
      </View>
      {completionBannerVisible ? (
        <View
          style={[
            styles.taskCompleteBanner,
            pixelMode ? styles.pixelLine : null,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
              borderRadius: pixelMode ? 0 : theme.radius.large,
            },
          ]}>
          <Text
            style={[
              styles.taskCompleteBannerText,
              pixelMode ? styles.pixelText : null,
              {color: theme.colors.textPrimary},
            ]}>
            {pixelMode
              ? '★ COMPLETE! ★'
              : 'Well done! All the tasks are completed:)'}
          </Text>
          <Text
            style={[
              styles.taskCompleteCountdown,
              pixelMode ? styles.pixelText : null,
              {color: theme.colors.textSecondary},
            ]}>
            {completionSecondsRemaining}
          </Text>
        </View>
      ) : null}
      <View style={styles.darkTaskList}>
        {tasks.map(task => (
          <Pressable
            key={task.id}
            style={pressedStyle([
              styles.darkTaskRow,
              pixelMode ? styles.pixelLine : null,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: pixelMode ? 0 : theme.radius.medium,
              },
            ])}
            onPress={() => onToggleTask(task.id)}>
            <View
              style={[
                styles.darkTaskDot,
                pixelMode ? styles.pixelTaskDot : null,
                {borderColor: theme.colors.border},
                task.completed && styles.darkTaskDotComplete,
                task.completed
                  ? {
                      backgroundColor: pixelMode
                        ? theme.colors.textPrimary
                        : theme.colors.success,
                      borderColor: pixelMode
                        ? theme.colors.border
                        : theme.colors.success,
                    }
                  : null,
              ]}>
              {task.completed ? (
                <Text
                  style={[
                    styles.darkTaskCheck,
                    {color: theme.colors.background},
                  ]}>
                  ✓
                </Text>
              ) : null}
            </View>
            <Text
              style={[
                styles.darkTaskText,
                task.completed && styles.darkTaskTextComplete,
                pixelMode ? styles.pixelText : null,
                {color: theme.colors.textPrimary},
              ]}>
              {task.title}
            </Text>
            <Text
              style={[
                styles.darkChevron,
                {color: theme.colors.textSecondary},
              ]}>
              ›
            </Text>
          </Pressable>
        ))}
      </View>
      <DarkAllowedApps apps={allowedApps} pixelMode={pixelMode} />
      <EndButton onPress={onEnd} pixelMode={pixelMode} />
    </>
  );
}

function DarkAllowedApps({
  apps,
  pixelMode = false,
}: {
  apps: AllowedApp[];
  pixelMode?: boolean;
}): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.darkAllowedPanel,
        pixelMode ? styles.pixelLine : null,
        {
          backgroundColor: theme.colors.surfaceElevated,
          borderColor: theme.colors.border,
          borderRadius: pixelMode ? 0 : theme.radius.large,
        },
      ]}>
      <Text
        style={[
          styles.darkAllowedTitle,
          pixelMode ? styles.pixelText : null,
          {color: theme.colors.textPrimary},
        ]}>
        Allowed apps
      </Text>
      <View style={styles.darkAllowedAppsRow}>
        {apps.slice(0, 3).map(app => (
          <AppIcon key={app.id} app={app} pixelMode={pixelMode} />
        ))}
      </View>
    </View>
  );
}

function EndButton({
  pixelMode = false,
  onPress,
}: {
  pixelMode?: boolean;
  onPress: () => void;
}): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      style={pressedStyle([
        styles.endButton,
        pixelMode ? styles.pixelLine : null,
        {
          backgroundColor: theme.colors.surfaceElevated,
          borderColor: theme.colors.border,
          borderRadius: pixelMode ? 0 : theme.radius.medium,
        },
      ])}
      onPress={onPress}>
      <Text
        style={[
          styles.endButtonText,
          pixelMode ? styles.pixelText : null,
          {color: pixelMode ? theme.colors.textPrimary : theme.colors.danger},
        ]}>
        {pixelMode ? 'END FOCUS' : 'End Focus'}
      </Text>
    </Pressable>
  );
}

function EndFocusConfirm({
  pixelMode = false,
  onCancel,
  onConfirm,
}: {
  pixelMode?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={styles.endConfirmOverlay}>
      <View
        style={[
          styles.endConfirmCard,
          pixelMode ? styles.pixelLine : null,
          {
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.border,
            borderRadius: pixelMode ? 0 : theme.radius.large,
          },
        ]}>
        <Text
          style={[
            styles.endConfirmText,
            pixelMode ? styles.pixelText : null,
            {color: theme.colors.textPrimary},
          ]}>
          You sure wanna end focus?? 😬
        </Text>
        <View style={styles.endConfirmActions}>
          <Pressable
            onPress={onCancel}
            style={pressedStyle([
              styles.endConfirmButton,
              styles.endConfirmStayButton,
              pixelMode ? styles.pixelLine : null,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: pixelMode ? 0 : theme.radius.medium,
              },
            ])}>
            <Text
              style={[
                styles.endConfirmButtonText,
                pixelMode ? styles.pixelText : null,
                {color: theme.colors.textPrimary},
              ]}>
              Stay
            </Text>
          </Pressable>
          <Pressable
            onPress={onConfirm}
            style={pressedStyle([
              styles.endConfirmButton,
              styles.endConfirmEndButton,
              pixelMode ? styles.pixelLine : null,
              {
                backgroundColor: theme.colors.textPrimary,
                borderColor: theme.colors.border,
                borderRadius: pixelMode ? 0 : theme.radius.medium,
              },
            ])}>
            <Text
              style={[
                styles.endConfirmButtonText,
                pixelMode ? styles.pixelText : null,
                {color: theme.colors.background},
              ]}>
              End
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function AppIcon({
  app,
  lineStyle,
  pixelMode = false,
}: {
  app: AllowedApp;
  lineStyle?: StyleProp<ViewStyle>;
  pixelMode?: boolean;
}): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.appIcon,
        pixelMode ? styles.pixelLine : null,
        lineStyle,
        {
          backgroundColor: pixelMode ? theme.colors.surface : app.color,
          borderColor: theme.colors.border,
        },
      ]}>
      {pixelMode ? (
        <PixelIcon
          color={theme.colors.textPrimary}
          kind={getPixelAppIconKind(app.id)}
          size={28}
        />
      ) : (
        <Text style={styles.appIconText}>{app.label}</Text>
      )}
    </View>
  );
}

function PrimaryButton({
  label,
  lineStyle,
  pixelMode = false,
  textStyle,
  onPress,
}: {
  label: string;
  lineStyle?: StyleProp<ViewStyle>;
  pixelMode?: boolean;
  textStyle?: StyleProp<TextStyle>;
  onPress: () => void;
}): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={pressedStyle([
        styles.primaryButton,
        {
          backgroundColor: pixelMode
            ? theme.colors.surface
            : theme.colors.textPrimary,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.medium,
        },
        lineStyle,
      ])}>
      <Text
        style={[
          styles.primaryButtonText,
          textStyle,
          {
            color: pixelMode
              ? theme.colors.textPrimary
              : theme.colors.background,
          },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

function DarkPhoneSurface({
  children,
  pixelMode = false,
  onBack,
}: {
  children: React.ReactNode;
  pixelMode?: boolean;
  onBack?: () => void;
}): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.darkSurface,
        pixelMode ? styles.pixelLockFrame : null,
        {backgroundColor: theme.colors.background},
      ]}>
      {onBack ? (
        <Pressable
          accessibilityLabel="Back to focus setup"
          hitSlop={12}
          onPress={onBack}
          style={styles.darkBackButton}>
          <Text
            style={[
              styles.darkBackText,
              {color: theme.colors.textPrimary},
            ]}>
            ‹
          </Text>
        </Pressable>
      ) : null}
      <View style={styles.darkStatusBar}>
        <Text
          style={[
            styles.darkStatusText,
            pixelMode ? styles.pixelText : null,
            {color: theme.colors.textPrimary},
          ]}>
          9:41
        </Text>
        <Text
          style={[
            styles.darkStatusText,
            {color: theme.colors.textPrimary},
          ]}>
          •••
        </Text>
      </View>
      {children}
    </View>
  );
}

function toggleApp(current: string[], appId: string): string[] {
  if (current.includes(appId)) {
    return current.filter(id => id !== appId);
  }

  return [...current, appId];
}

function getPixelAppIconKind(appId: string): PixelIconKind {
  if (appId === 'phone' || appId === 'facetime' || appId === 'whatsapp') {
    return 'phone';
  }

  if (appId === 'messages' || appId === 'reddit' || appId === 'safari') {
    return 'message';
  }

  return 'music';
}

function getDurationParts(totalMinutes: number): {
  hours: number;
  minutes: number;
} {
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
}

function formatDurationPart(value: number): string {
  return String(value).padStart(2, '0');
}

function getPixelBurnPoint(index: number): {left: number; top: number} {
  const sideLength = pixelBurnSegmentCount / 4;
  const sideIndex = Math.floor(index / sideLength);
  const sideProgress = (index % sideLength) / (sideLength - 1);
  const maxPosition = pixelTimerBoxSize - pixelBurnCellSize;
  const outerOffset = -pixelBurnCellSize;

  if (sideIndex === 0) {
    return {
      left: maxPosition * sideProgress,
      top: outerOffset,
    };
  }

  if (sideIndex === 1) {
    return {
      left: pixelTimerBoxSize,
      top: maxPosition * sideProgress,
    };
  }

  if (sideIndex === 2) {
    return {
      left: maxPosition * (1 - sideProgress),
      top: pixelTimerBoxSize,
    };
  }

  return {
    left: outerOffset,
    top: maxPosition * (1 - sideProgress),
  };
}

function formatActiveTimer(totalSeconds: number): string {
  const displayMinutes = Math.floor(totalSeconds / 60);
  const displaySeconds = totalSeconds % 60;

  return `${String(displayMinutes).padStart(2, '0')}:${String(
    displaySeconds,
  ).padStart(2, '0')}`;
}
