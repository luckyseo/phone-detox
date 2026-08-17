# Phone Detox

A React Native iOS-first focus app that restricts distracting apps during a focus session and surfaces the active timer / task list on the iPhone Lock Screen.

## MVP

- Create a timer-based or task-based focus session
- Choose allowed apps
- Restrict other selected apps using iOS Screen Time APIs
- Show active focus state on the Lock Screen using Live Activities
- Complete tasks from the Lock Screen where supported
- End restrictions when the completion condition is satisfied
- No backend for MVP

## Architecture

React Native owns:
- Presentation
- Domain models
- Application logic
- Theme system

Native iOS owns:
- Screen Time / ManagedSettings
- ActivityKit / Live Activities
- Shared App Group state
- iOS extensions

React Native communicates with native iOS through `FocusPlatform`.

See:
- `docs/architecture.md`
- `docs/implementation-plan.md`

## iOS local setup

The iOS workspace is generated from the React Native template and lives under
`ios/`.

Before opening the app in Xcode for the first time:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license
npm install
cd ios
pod install
open PhoneDetox.xcworkspace
```

In Xcode, select the `PhoneDetox` scheme, choose an iPhone simulator, and press
Run.
