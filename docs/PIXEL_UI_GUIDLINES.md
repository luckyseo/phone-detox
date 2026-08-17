# Pixel UI Design Guidelines

## 1. Purpose

This document defines the UI design system for the application.

The visual direction is inspired by:

- 1-bit pixel interfaces
- monochrome handheld games
- classic virtual-pet devices
- retro LCD / dot-matrix displays

The application must feel playful and nostalgic while still behaving like a modern mobile application.

The UI should **not** look like a modern rounded iOS interface with a pixel font placed on top.

Pixel styling must be applied consistently across:

- Typography
- Buttons
- Cards
- Icons
- Borders
- Selection states
- Progress indicators
- Empty states
- Focus states
- Pet animations
- Feedback messages

---

# 2. Core Visual Direction

Use a strict monochrome palette.

```ts
BLACK = "#000000";
WHITE = "#FFFFFF";
```

Default:

```text
Background: WHITE
Foreground: BLACK
Border: BLACK
```

Selected / active elements use inversion:

```text
Background: BLACK
Foreground: WHITE
```

Do not introduce decorative colors unless a future theme explicitly defines them.

---

# 3. Design Philosophy

The interface should resemble a modern productivity application rendered through a retro handheld game system.

Think:

```text
Modern UX
    +
1-bit pixel graphics
    +
Tamagotchi-like interaction
    +
Minimal monochrome design
```

The application must remain:

- Simple
- Functional
- Easy to scan
- Accessible
- Touch-friendly
- Consistent

Retro styling must never reduce usability.

---

# 4. Pixel Grid

All UI elements should follow a consistent pixel grid.

Preferred base grid:

```ts
const PIXEL_GRID = 4;
```

Prefer measurements divisible by `4`.

Examples:

```text
4
8
12
16
20
24
32
40
48
```

Avoid arbitrary spacing such as:

```text
13
17
23
29
```

unless required by platform layout constraints.

---

# 5. Typography

Use a pixel-style font consistently.

Recommended style:

- Pixelify Sans
- Silkscreen
- Another readable bitmap/pixel font

Avoid mixing modern sans-serif typography with pixel typography unnecessarily.

Example:

```ts
interface TypographyTheme {
  heading: string;
  body: string;
  pixel: string;
}
```

Example usage:

```ts
title: {
  fontFamily: 'PixelFont-Bold',
  fontSize: 32,
  color: '#000000',
}
```

## Typography hierarchy

Suggested sizes:

```text
Hero title        28–36
Screen title      24–30
Section title     16–20
Button            18–24
Body              14–18
Small label       10–14
Timer number      52–72
```

Use uppercase where it supports the retro UI.

Example:

```text
START FOCUS

FOCUS FOR

ALLOWED APPS

COMPLETE!
```

Do not uppercase long explanatory text.

---

# 6. Border Style

Borders are a core visual element.

Prefer:

```ts
borderWidth: 2;
```

or:

```ts
borderWidth: 4;
```

Avoid thin anti-aliased visual decoration.

Avoid excessive modern rounded corners.

Prefer:

```text
┌──────────────┐
│              │
│              │
└──────────────┘
```

over highly rounded cards.

Pixel-cut corners are encouraged when practical.

---

# 7. Selection State

Selected items should normally use black/white inversion.

Unselected:

```text
┌──────────────┐
│              │
│      □       │
│              │
│    TASKS     │
└──────────────┘
```

Selected:

```text
████████████████
██            ██
██     ◷      ██
██            ██
██   TIMER    ██
████████████████
```

Implementation:

```ts
selected
  ? {
      backgroundColor: theme.colors.foreground,
      color: theme.colors.background,
    }
  : {
      backgroundColor: theme.colors.background,
      color: theme.colors.foreground,
    };
```

Do not use blue, green, gradients, or shadows to communicate selection in the monochrome theme.

---

# 8. Buttons

Buttons must look tactile and game-like.

Preferred:

```tsx
<PixelButton>START FOCUS</PixelButton>
```

Avoid default platform buttons.

Avoid:

```text
Large border radius
Gradient backgrounds
Blur effects
Glassmorphism
Soft modern shadows
```

## Button interaction

Pressed states may:

- Invert black and white
- Move down by 2–4 px
- Slightly change border position

Example:

```ts
pressed && {
  transform: [{ translateY: 2 }],
};
```

This should create a physical handheld-game-button feeling.

---

# 9. Icons

Do not mix smooth modern icons with pixel UI.

Avoid using normal SF Symbols or smooth vector icons directly when they visually conflict with the theme.

Preferred icon styles:

```text
8 × 8
16 × 16
24 × 24
32 × 32
```

Assets may use:

```text
PNG
SVG
Pixel sprite
```

Example directory:

```text
assets/
  icons/
    pixel/
      timer.png
      tasks.png
      phone.png
      messages.png
      music.png
      settings.png
      plus.png
      minus.png
```

Icons should use:

```text
BLACK
WHITE
```

only.

---

# 10. Theme Architecture

Do not hardcode the pixel theme directly into screens.

All visual values must come from the theme system whenever practical.

```ts
export interface AppTheme {
  colors: {
    background: string;
    foreground: string;
    invertedBackground: string;
    invertedForeground: string;
    border: string;
  };

  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };

  border: {
    thin: number;
    thick: number;
  };

  typography: {
    heading: string;
    body: string;
    pixel: string;
  };
}
```

Example:

```ts
export const PIXEL_THEME: AppTheme = {
  colors: {
    background: "#FFFFFF",
    foreground: "#000000",
    invertedBackground: "#000000",
    invertedForeground: "#FFFFFF",
    border: "#000000",
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  border: {
    thin: 2,
    thick: 4,
  },

  typography: {
    heading: "PixelFont-Bold",
    body: "PixelFont-Regular",
    pixel: "PixelFont-Regular",
  },
};
```

The architecture must allow future themes such as:

```text
SYSTEM_THEME
LIGHT_THEME
DARK_THEME
PIXEL_THEME
CUSTOM_THEME
```

---

# 11. Component System

Do not repeatedly implement pixel styling inside screens.

Create reusable primitives.

Recommended components:

```text
PixelButton
PixelCard
PixelIcon
PixelIconButton
PixelDivider
PixelAppIcon
PixelTimeDisplay
PixelProgressBar
PixelStatusMessage
PixelPet
PixelModal
```

Screens should compose these primitives.

Example:

```text
FocusScreen

├── PixelIconButton
├── PixelHeading
├── FocusModeSelector
│   ├── PixelCard
│   └── PixelCard
├── DurationPicker
│   ├── PixelControlButton
│   ├── PixelTimeDisplay
│   └── PixelControlButton
├── AllowedApps
│   └── PixelAppIcon[]
├── PixelButton
└── PixelPetPreview
```

---

# 12. Pixel Cards

Use reusable cards for selectable content.

Example API:

```ts
interface PixelCardProps {
  selected: boolean;
  title: string;
  children: React.ReactNode;
  onPress: () => void;
}
```

Do not allow individual screens to invent their own selected-card style.

---

# 13. Timer UI

Timer displays should resemble digital handheld displays.

Example:

```text
       FOCUS FOR

      00 H    30 M

     (-)  30 MIN  (+)
```

Large numbers should be visually dominant.

Example styling:

```ts
timeValue: {
  fontFamily: 'PixelFont-Regular',
  fontSize: 64,
}

timeUnit: {
  fontFamily: 'PixelFont-Bold',
  fontSize: 20,
}
```

---

# 14. Progress Indicators

Do not default to modern circular loading indicators when a pixel equivalent can be used.

Example:

```text
████████████░░░░░░░░
```

Example:

```text
FOCUSING...

██████████████░░░░░░

18 / 30 MIN
```

Use discrete pixel blocks.

---

# 15. Feedback Language

System feedback should feel like part of the game-like design language.

Instead of:

```text
Success
```

Prefer:

```text
★ COMPLETE! ★
```

Instead of a modern loading spinner:

```text
· · · ·
```

or:

```text
LOADING...
```

Error:

```text
!! ERROR !!
```

Focus started:

```text
FOCUS START!
```

Focus completed:

```text
★ FOCUS COMPLETE! ★
```

Keep feedback concise.

---

# 16. Pixel Pet

The pet is a core personality element of the product.

The pet should communicate application state visually.

Possible states:

```ts
export enum PetState {
  IDLE = "IDLE",
  FOCUSING = "FOCUSING",
  HAPPY = "HAPPY",
  SLEEPING = "SLEEPING",
  COMPLETE = "COMPLETE",
}
```

Possible assets:

```text
assets/
  pet/
    idle.png
    focusing.png
    sleeping.png
    happy.png
    complete.png
```

Example state mapping:

```text
IDLE

  ^_^
```

```text
FOCUSING

  -_-
```

```text
COMPLETE

 \(^o^)/
```

The pet should react to meaningful user actions, not random decorative events.

---

# 17. Animation

Animations should mimic old game systems.

Prefer:

- Frame-by-frame sprite animation
- Simple position changes
- Blinking
- Small bounce
- Pixel transitions
- Black/white inversion

Avoid:

- Heavy blur
- Large smooth gradients
- Excessive spring animation
- Floating glass UI
- Complex 3D effects

Animation should normally be subtle.

---

# 18. Domain State

Never use UI strings as application state.

Do not use:

```ts
status === "active";
```

Prefer enums.

```ts
export enum FocusStatus {
  IDLE = "IDLE",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}
```

Similarly:

```ts
export enum FocusMode {
  TIMER = "TIMER",
  TASKS = "TASKS",
}
```

UI should render based on domain state.

---

# 19. Architecture Boundary

Pixel styling belongs only to the Presentation layer.

Do not introduce pixel-specific concerns into:

```text
Domain
Application
Infrastructure
Native Focus Engine
Storage
```

Recommended architecture:

```text
src/

├── presentation/
│   ├── screens/
│   ├── components/
│   │   └── pixel/
│   └── theme/
│
├── domain/
│
├── application/
│
└── infrastructure/
```

Example:

```text
presentation/
  components/
    pixel/
      PixelButton.tsx
      PixelCard.tsx
      PixelIcon.tsx
      PixelPet.tsx
      PixelDivider.tsx
      PixelProgressBar.tsx

  theme/
      AppTheme.ts
      PixelTheme.ts
      LightTheme.ts
      ThemeProvider.tsx
```

---

# 20. Focus Screen Reference

The Focus Setup screen should approximately follow this hierarchy:

```text
                         ⚙

           WHAT DO YOU WANT
             TO FOCUS ON?

        ┌────────┐ ┌────────┐
        │ TIMER  │ │ TASKS  │
        └────────┘ └────────┘

              FOCUS FOR

             00H   30M

          (-) 30 MIN (+)

       ALLOWED APPS DURING FOCUS
       ─────────────────────────

       PHONE  MESSAGE  MUSIC  +

       ┌─────────────────────┐
       │     START FOCUS     │
       └─────────────────────┘

       PREVIEW BLOCKED SCREEN

             ✦     ✦

               PET
```

Maintain generous spacing.

Do not fill every empty area with decorations.

---

# 21. Accessibility

Retro visual style must not compromise accessibility.

Touch targets should remain approximately:

```text
44 × 44 pt
```

minimum when possible.

Ensure:

- Strong contrast
- Readable font sizes
- Clear selected states
- Appropriate accessibility labels
- Screen-reader support
- Non-color-dependent status communication

Pixel-art visual size and actual touch area may differ.

Example:

```tsx
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Increase focus duration"
>
```

---

# 22. Do

Do:

- Use black and white
- Use a consistent pixel grid
- Use reusable pixel components
- Use chunky borders
- Use readable pixel fonts
- Use black/white inversion for state
- Use pixel icons
- Use simple sprites
- Use the pet to communicate state
- Keep domain logic independent from UI
- Keep touch interactions modern and accessible

---

# 23. Do Not

Do not:

- Add gradients
- Add glassmorphism
- Add random shadows
- Add unnecessary colors
- Use highly rounded modern cards
- Mix multiple visual styles
- Mix smooth icons with pixel icons
- Hardcode theme values everywhere
- Put theme logic inside domain models
- Use string literals instead of defined state types
- Sacrifice usability for retro styling

---

# 24. AI Implementation Rules

When generating or modifying UI code for this project:

1. Reuse existing pixel components before creating new ones.
2. Never hardcode theme colors inside screens when a theme token exists.
3. Maintain the monochrome design system.
4. Use the existing pixel spacing/grid system.
5. Keep presentation logic separate from domain logic.
6. Prefer interfaces for structured data.
7. Prefer enums for finite application states.
8. Do not introduce dependencies solely for minor visual effects.
9. Maintain accessibility properties.
10. Preserve future theme extensibility.
11. Do not replace pixel components with platform-default UI controls.
12. Do not alter domain behavior while performing visual refactors.
13. Keep components small and reusable.
14. Follow the existing project architecture.
15. If a design requirement conflicts with usability, preserve usability first.

---

# 25. Visual Consistency Rule

Before creating any new component, ask:

> Would this component look like it belongs on the same monochrome handheld device as the rest of the application?

If the answer is no, redesign it before implementation.

The final interface should feel like **one coherent operating system**, not a collection of modern UI components with pixel decoration added afterward.
