# MVP Implementation Plan

## Goal

Prove the complete focus loop on a physical iPhone before expanding product scope.

```text
Create focus
   ↓
Choose allowed apps
   ↓
Start session
   ↓
Restrict distracting apps
   ↓
Show timer/tasks on Lock Screen
   ↓
Complete timer/tasks
   ↓
Remove restrictions
```

---

## Phase 0 — Project foundation

### Deliverables
- Initialize React Native + TypeScript project
- Configure iOS workspace
- Add Jest
- Add React Native Testing Library
- Establish ESLint / Prettier
- Add feature-based folder structure
- Add theme provider and semantic tokens
- Define domain interfaces and enums
- Define `FocusPlatform`

### Tests
- Domain model / helper unit tests
- Theme resolver tests
- Platform adapter mock tests

### Exit criteria
The app launches with a placeholder Home screen and all tests pass.

---

## Phase 1 — Focus domain + local UI state

### Deliverables
- `FocusSession`
- `FocusTask`
- `FocusTimer`
- `FocusMode`
- `FocusSessionStatus`
- Draft session state
- Create/edit/delete task logic
- Timer configuration logic
- Completion policy

### Rules
- No Apple framework logic inside React components
- No raw status strings
- No hard-coded theme colours

### Tests
Jest unit tests for:
- all tasks complete
- task incomplete
- timer session creation
- session transitions
- invalid session state
- completion policy

### Exit criteria
A session can be constructed and completed entirely using mocked platform services.

---

## Phase 2 — Native iOS bridge

### Deliverables
- Swift Turbo Native Module
- `NativeFocusPlatform`
- authorization bridge
- start/end session bridge
- active session read bridge
- error mapping from Swift to TypeScript

### Tests
- Jest tests against mocked native module
- Swift unit tests for coordinator behaviour

### Exit criteria
React Native can call a Swift method on a physical iPhone and receive a typed result.

---

## Phase 3 — Screen Time technical spike

This is the first major product-risk milestone.

### Deliverables
- Family Controls authorization
- App selection
- ManagedSettings store
- Shield one selected test app
- Remove shield
- Shared App Group configuration

### Technical spike flow
```text
Press Start Focus
   ↓
Shield one app
   ↓
Press End Focus
   ↓
Shield removed
```

### Exit criteria
Works reliably on a physical iPhone.

Do not build the full UI before this milestone succeeds.

---

## Phase 4 — Shared active-session storage

### Deliverables
- `SharedFocusStore`
- Store active session in App Group
- Main app can read/write session
- Native extensions can read session
- session recovery after app relaunch

### Tests
Swift tests for:
- save
- load
- mutate task
- clear session
- corrupted/missing state handling

### Exit criteria
Force-closing or suspending the React Native app does not lose the active focus session.

---

## Phase 5 — Timer focus

### Deliverables
- Start timer session
- Store absolute `endsAt`
- Apply app restrictions
- native scheduling / DeviceActivity integration
- automatically release restrictions at completion

### Tests
- end-time calculation
- expired session handling
- duplicate end call
- restart/recovery behaviour

### Exit criteria
Start a 1-minute test session, lock the phone, and verify apps become available when it finishes without the RN app remaining foregrounded.

---

## Phase 6 — Lock Screen Live Activity

### Deliverables
- ActivityKit attributes/state
- SwiftUI Live Activity
- timer presentation
- task presentation
- progress state
- completion state
- Dynamic Island support where applicable

### MVP UI
Show at most a small number of focus tasks directly.

```text
FOCUS

24:18

○ Finish ticket
✓ Reply to email
○ Laundry

1 / 3
```

### Exit criteria
The active session remains visible while the phone is locked.

---

## Phase 7 — Interactive Lock Screen tasks

### Deliverables
- `CompleteTaskIntent`
- Update shared focus state from Lock Screen
- refresh Live Activity
- verify completion of the final task can trigger the appropriate focus-ending path

### Critical technical validation
Prove on-device:

```text
Check final task on Lock Screen
   ↓
session completes
   ↓
restrictions are removed
```

If Apple execution/entitlement boundaries prevent direct removal from the intent context, route completion through the safest supported native mechanism.

### Exit criteria
Task completion works reliably from the Lock Screen.

---

## Phase 8 — MVP React Native UI

Only after the native vertical slice works.

### Screens
1. Home / focus setup
2. Allowed-app selection entry
3. Active focus
4. Completion state
5. Minimal settings

### Home
- Timer / Tasks mode
- timer duration
- up to a small number of tasks
- allowed apps summary
- Start Focus

### Active focus
- countdown OR task progress
- allowed apps
- emergency/end-session flow if product rules permit

### Design
- simple
- minimal navigation
- dark theme first
- semantic theme tokens only
- future light/system/custom modes supported structurally

---

## Phase 9 — Test coverage

### TypeScript
Jest:
- domain logic
- application services
- platform adapter
- state transitions

React Native Testing Library:
- focus form
- task row interactions
- timer controls
- Start Focus button
- active state rendering
- completion rendering

### Swift
Swift Testing / XCTest:
- coordinator
- shared store
- completion rules
- Screen Time service wrappers where mockable

### Physical iPhone validation
Required for:
- authorization
- shielding
- DeviceActivity
- Live Activity
- Lock Screen interaction
- app suspension/termination behaviour

---

## Phase 10 — MVP hardening

### Deliverables
- graceful permission denial
- session recovery
- native error handling
- app restart handling
- invalid shared-state recovery
- accessibility labels
- basic telemetry hooks kept abstract, without requiring a backend
- App Store entitlement preparation

---

# Not in MVP

- Backend
- Login
- Cloud sync
- Social features
- Leaderboards
- AI tasks
- Complex analytics
- Multiple concurrent focus sessions
- Custom theme editor
- Android implementation

The architecture should allow these later without making them part of V1.

---

# Recommended implementation order

```text
1. RN foundation
2. Domain + Jest
3. TurboModule bridge
4. Shield technical spike
5. Shared App Group state
6. Timer completion
7. Live Activity
8. Lock Screen task interaction
9. Final RN UI
10. Hardening + E2E device validation
```

The key principle is to prove the highest-risk iOS system integrations before spending significant time polishing the UI.

---

# Security rules

- `.env` and `.env.*` are local-only and must never be staged or committed.
- Only `.env.example` may be versioned, and it must contain no real credentials.
- Signing keys, certificates, provisioning profiles, API keys, and tokens must never enter Git.
- Before every publish/PR flow, inspect `git status` and the staged diff.
- If secrets are ever introduced later, access them through configuration boundaries rather than hard-coding them in React Native or Swift source.
