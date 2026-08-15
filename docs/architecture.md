# Architecture

## High-level architecture

```text
                     PHONE DETOX
                         │
        ┌────────────────┴─────────────────┐
        │                                  │
 React Native                         Native iOS
        │                                  │
 Presentation                        Focus Engine
        │                                  │
 Domain Models                 ┌───────────┼───────────┐
        │                      │           │           │
 Application Logic        ScreenTime   LiveActivity  Storage
        │                      │           │           │
 FocusPlatform ──TurboModule──►│           │           │
                               │           │           │
                         ManagedSettings ActivityKit App Group
                               │           │           │
                               ▼           ▼           ▼
                            Shields    Lock Screen   Shared State
```

## Architectural rules

1. React components do not call Apple APIs directly.
2. All iOS platform behaviour is behind `FocusPlatform`.
3. The active focus session is not owned only by React Native state.
4. Native/shared state becomes authoritative after a focus session starts.
5. Business/domain logic should remain unit-testable without iOS APIs.
6. UI colours and spacing must come from semantic theme tokens.
7. MVP is backend-free.

## React Native structure

```text
src/
  features/
    focus/
      components/
      hooks/
      models/
      services/
      screens/
      __tests__/

  platform/
    FocusPlatform.ts
    NativeFocusPlatform.ts

  theme/
    ThemeProvider.tsx
    tokens.ts
    themes/

  shared/
    components/
    utils/
```

## Native iOS structure

```text
ios/
  FocusCore/
    FocusNativeModule.swift
    FocusSessionCoordinator.swift

    ScreenTime/
      ScreenTimeAuthorizationService.swift
      AppSelectionService.swift
      ShieldService.swift
      FocusScheduleService.swift

    LiveActivity/
      LiveActivityService.swift

    Storage/
      SharedFocusStore.swift

  Extensions/
    DeviceActivityMonitor/
    ShieldConfiguration/
    ShieldAction/
    FocusLiveActivity/
```

## Core TypeScript contracts

Use interfaces for data shapes and enums for fixed values.

```ts
export enum FocusSessionStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum FocusMode {
  TIMER = 'TIMER',
  TASKS = 'TASKS',
  TIMER_AND_TASKS = 'TIMER_AND_TASKS',
}

export interface FocusTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface FocusTimer {
  durationSeconds: number;
  endsAt?: string;
}

export interface FocusSession {
  id: string;
  mode: FocusMode;
  status: FocusSessionStatus;
  startedAt?: string;
  timer?: FocusTimer;
  tasks: FocusTask[];
  allowedApps: AppSelection;
}
```

## Platform boundary

```ts
export interface FocusPlatform {
  requestAuthorization(): Promise<boolean>;
  selectAllowedApps(): Promise<AppSelection>;
  startSession(session: FocusSession): Promise<void>;
  endSession(): Promise<void>;
  getActiveSession(): Promise<FocusSession | null>;
  completeTask(taskId: string): Promise<void>;
}
```

## Theme strategy

Screens must use semantic tokens rather than hard-coded colours.

```ts
export enum ThemeMode {
  SYSTEM = 'SYSTEM',
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  CUSTOM = 'CUSTOM',
}
```

Future themes can be added without rewriting components.
