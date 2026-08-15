# Phone Detox Development Instructions

## Read first

Before implementing features, read:

- `docs/architecture.md`
- `docs/implementation-plan.md`
- `SECURITY.md`

## Architecture

- React Native + TypeScript owns presentation and application logic.
- Native Swift owns iOS Screen Time, ActivityKit and App Group functionality.
- React Native must access native functionality only through `FocusPlatform`.
- Do not call Apple native APIs directly from React components.

## TypeScript conventions

Use interfaces for object shapes.

Use enums for fixed domain values.

Good:

FocusSessionStatus.DRAFT
FocusMode.TIMER
ThemeMode.SYSTEM

Do not use raw values such as:

'draft'
'timer'
'dark'

## Testing

For TypeScript:

- Jest
- React Native Testing Library

Before completing TypeScript work, run:

npm run typecheck
npm run lint
npm test

Native Swift functionality must have Swift tests where practical.

## Security

Never stage or commit:

- `.env`
- `.env.*`
- API keys
- tokens
- certificates
- provisioning profiles
- private keys

Only `.env.example` may be committed.

Always inspect:

git status
git diff --cached

before committing.

## MVP constraints

Do not introduce:

- backend
- login
- cloud sync
- social features
- analytics services

unless specifically requested.

Follow `docs/implementation-plan.md` for implementation order.
