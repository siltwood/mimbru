# Code Structure

## Core Files

### Screens
```
app/(protected)/(tabs)/
├── creature.tsx    # Main pet screen - displays pet, stats, actions
└── habits.tsx      # Habit list - create, complete, delete habits
```

### Pet Components
```
components/creature/
├── PetDisplay.tsx      # Animated pet area with floating text
├── StatBars.tsx        # Health/happiness/cleanliness/hunger bars
├── ActionButtons.tsx   # Feed/clean/pet buttons
├── WarningBanner.tsx   # Urgent warning messages
└── DevControls.tsx     # Testing controls (__DEV__ only)

components/
└── sprite-pet.tsx      # Sprite animation engine (walking, states)
```

### Business Logic
```
lib/
├── hooks/
│   ├── useCreature.ts        # Fetch/create pet data
│   ├── useCreatureActions.ts # Feed, clean, pet logic
│   └── useCreatureHelpers.ts # Animation state, warnings
├── constants/
│   └── pet-constants.ts      # All game balance values
├── types/
│   └── creature.ts           # Shared TypeScript types
└── creature-degradation.ts   # Background stat decay
```

## Data Flow

```
User taps "Feed"
    ↓
ActionButtons.tsx (UI)
    ↓
useCreatureActions.feedCreature() (logic)
    ↓
Supabase update (database)
    ↓
setCreature() (local state)
    ↓
StatBars re-renders (UI update)
```

## Key Constants

All game balance in `lib/constants/pet-constants.ts`:

```typescript
FEED_EFFECTS.HUNGER_BOOST      // How much hunger increases
CLEAN_EFFECTS.CLEANLINESS_BOOST // How much cleanliness increases
TIME_INTERVALS.POOP_GENERATION  // Hours between poops
HEALTH_DECAY.BASE_HEALTH_LOSS   // Health lost when neglected
```

## Database Tables

### creatures
One per user. Stores all pet stats, timestamps, food count.

### habits
User's habits with streak tracking.

### pet_actions
Log of all actions (feed, clean, pet, degradation) for analytics.

## Animation System

`sprite-pet.tsx` handles:
- Loading sprite frames from `assets/sprites/pet/walking/`
- Frame cycling at configured frameRate
- Random movement within bounds
- Direction detection (which way pet faces)
- State-based animation switching

Sprites needed:
```
assets/sprites/pet/walking/
├── up1.png, up2.png      # Walking up
├── down1.png, down2.png  # Walking down
├── left1.png, left2.png  # Walking left
└── right1.png, right2.png # Walking right
```

## Dev Controls

Only visible when `__DEV__ === true`:
- Force poop
- Force pass out
- Adjust any stat +/- 10/20
- Add/remove food
- Reset all stats to 100
- Run movement test (cycles all directions/states)
