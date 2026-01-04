# Mimbru - Virtual Pet Habit Tracker

Tamagotchi-style habit app. Complete habits to keep your pet alive.

## Quick Start

```bash
npm install
cp .env.example .env  # Add your Supabase credentials
npm run web
```

Run `scripts/rebuild-schema.sql` in Supabase SQL Editor to set up the database.

## Structure

```
app/(protected)/(tabs)/
  creature.tsx     # Pet screen
  habits.tsx       # Habit tracking

components/
  creature/        # Pet UI components
  sprite-pet.tsx   # Animation engine

lib/
  hooks/           # useCreature, useCreatureActions
  constants/       # Game balance values
  types/           # Shared TypeScript types
```

## Game Mechanics

- **Stats**: Health, Happiness, Cleanliness, Hunger (0-100)
- **Food**: Earn by completing habits (streak bonuses)
- **Poop**: Pet poops daily, needs cleaning
- **Death**: Health hits 0 = passed out. Feed or complete habits to revive.

All values configurable in `lib/constants/pet-constants.ts`.

## Dev Mode

Dev controls appear automatically in `__DEV__` mode for testing stats/states.

## Production

See `STATUS.md` for what to enable before deploying.
