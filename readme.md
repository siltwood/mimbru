# 🐾 Mimbru - Virtual Pet Habit Tracker

A Tamagotchi-style habit tracking app built with React Native, Expo, and Supabase. Take care of your virtual pet by completing your daily habits!

## 📱 What is Mimbru?

Mimbru gamifies habit building by tying your real-world habits to a virtual pet's wellbeing. The more consistent you are with your habits, the healthier and happier your pet stays. Miss your habits, and your pet suffers the consequences!

### Features

- 🎮 **Virtual Pet System** - Feed, clean, and pet your creature
- ✅ **Habit Tracking** - Create and track daily habits
- 🔥 **Streak Rewards** - Longer streaks earn more food for your pet
- 💩 **Poop Mechanics** - Your pet poops daily and needs cleaning
- 😵 **Pass Out System** - Neglected pets pass out and need revival
- 🍎 **Food Economy** - Earn food by completing habits
- 📊 **Stats System** - Health, Happiness, Cleanliness, Hunger (0-100)
- 🎨 **Animated Sprites** - Walking animations in 4 directions

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Supabase account (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/siltwood/mimbru.git
   cd mimbru/MimbruAppExpo/expo-supabase-starter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Set up the database**

   Go to your Supabase dashboard → SQL Editor and run:
   ```bash
   # Copy the contents of scripts/rebuild-schema.sql
   # Paste and execute in Supabase SQL Editor
   ```

5. **Run the app**
   ```bash
   # For web (recommended for development)
   npm run web

   # For iOS
   npm run ios

   # For Android
   npm run android
   ```

---

## 🗄️ Database Setup

### Supabase Tables

The app uses 3 main tables:

1. **`creatures`** - One pet per user
   - Stats: health, happiness, cleanliness, hunger
   - Care tracking: last_fed, last_cleaned, poop_count
   - Food inventory: food_count

2. **`habits`** - User's habits
   - Fields: name, current_streak, longest_streak, total_completions
   - Tracks completion dates and frequency

3. **`pet_actions`** - Action logs
   - Records every feed/clean/pet/degradation event
   - Used for analytics and debugging

### Row Level Security (RLS)

⚠️ **For Testing:** RLS is currently **disabled** on all tables for easier development.

To re-enable RLS for production:
```sql
ALTER TABLE creatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_actions ENABLE ROW LEVEL SECURITY;
```

See `STATUS.md` for current security configuration.

---

## 📂 Project Structure

```
expo-supabase-starter/
├── app/                          # Expo Router screens
│   ├── (protected)/             # Auth-protected routes
│   │   └── (tabs)/              # Tab navigation
│   │       ├── creature.tsx     # Main pet screen (418 lines)
│   │       └── habits.tsx       # Habit tracking screen
│   ├── welcome.tsx              # Landing page
│   ├── sign-in.tsx              # Login modal
│   └── sign-up.tsx              # Registration modal
│
├── components/                   # Reusable components
│   ├── creature/                # Pet-specific components
│   │   ├── PetDisplay.tsx       # Animated pet area
│   │   ├── StatBars.tsx         # Health/happiness bars
│   │   ├── ActionButtons.tsx    # Feed/clean/pet buttons
│   │   ├── WarningBanner.tsx    # Urgent warnings
│   │   └── DevControls.tsx      # Testing controls (dev only)
│   ├── sprite-pet.tsx           # Sprite animation engine
│   └── ui/                      # UI component library
│
├── lib/                          # Business logic
│   ├── hooks/                   # Custom React hooks
│   │   ├── useCreature.ts       # Creature data management
│   │   ├── useCreatureActions.ts # Feed/clean/pet logic
│   │   └── useCreatureHelpers.ts # Helper functions
│   ├── constants/               # App constants
│   │   └── pet-constants.ts     # Game mechanics values
│   └── creature-degradation.ts  # Background degradation system
│
├── context/                      # React Context providers
│   └── supabase-provider.tsx    # Auth state management
│
├── config/                       # Configuration
│   └── supabase.ts              # Supabase client setup
│
├── scripts/                      # Database & build scripts
│   ├── rebuild-schema.sql       # Complete database schema
│   └── run-migration.js         # Migration runner
│
└── assets/                       # Static assets
    └── sprites/pet/walking/     # Pet animation frames
```

---

## 🛠️ Development

### Running in Development Mode

**Web (Recommended)**
```bash
npm run web
```
- Opens at `http://localhost:8081`
- Fastest hot reload
- Easy debugging with Chrome DevTools
- No simulator freezing issues

**iOS Simulator**
```bash
npm run ios
```

**Android Emulator**
```bash
npm run android
```

### Testing Controls

Dev controls are only visible in development builds (`__DEV__` mode). They allow you to:
- Force poop generation
- Force pet to pass out
- Adjust stats manually (+/- health, happiness, etc.)
- Adjust food count
- Reset all stats to 100

These controls automatically hide in production builds.

### Database Migrations

To run migrations:
```bash
npm run migrate
```

Or manually in Supabase SQL Editor:
```bash
npm run migrate:manual
```

---

## 🎮 Game Mechanics

### Pet Stats (0-100)

- **❤️ Health** - Pet passes out at 0
- **😊 Happiness** - Affects pet behavior and animations
- **🧼 Cleanliness** - Decreases when pet poops
- **🍎 Hunger** - Increases when fed

### Timers & Intervals

- **Poop Generation**: Every 24 hours
- **Health Decay Check**: Every 12 hours (if no habits completed)
- **Background Degradation**: Every 1 hour
- **Pet Cooldown**: 5 minutes between petting

### Food System

- Start with 10 food
- Earn food by completing habits:
  - 1-2 day streak: +1 food
  - 3-6 day streak: +2 food
  - 7+ day streak: +3 food

### Death & Revival

- Pet passes out when health reaches 0
- Can be revived by:
  - Feeding (costs 1 food, gives 30 health)
  - Completing any habit (gives 20+ health)

---

## 🔧 Configuration

### Game Balance

All game mechanics values are centralized in `lib/constants/pet-constants.ts`. You can easily tweak:
- Stat boost amounts (feed, clean, pet effects)
- Time intervals (poop, decay timers)
- Food rewards
- Warning thresholds
- Degradation rates

Example:
```typescript
export const FEED_EFFECTS = {
  HUNGER_BOOST: 20,    // Change this to adjust feeding power
  HAPPINESS_BOOST: 10,
  REVIVAL_HEALTH: 30,
};
```

### Environment Variables

```env
EXPO_PUBLIC_SUPABASE_URL=        # Your Supabase project URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=   # Public anon key
SUPABASE_SERVICE_ROLE_KEY=       # Service role key (for migrations)
```

---

## 📊 Code Quality

### Recent Improvements

- ✅ Reduced `creature.tsx` from 999 to 418 lines (-59%)
- ✅ Extracted 5 reusable components
- ✅ Created 3 custom hooks for business logic
- ✅ Centralized all constants (200+ values)
- ✅ Fixed database schema mismatches
- ✅ Standardized death logic
- ✅ Hidden dev controls from production

### Component Architecture

Components follow the single responsibility principle:
- Each component does ONE thing
- Business logic in hooks (testable)
- UI logic in components (reusable)
- Constants in centralized file (maintainable)

---

## 🐛 Troubleshooting

### Common Issues

**"No creature found"**
- Make sure you've run the database migration (`rebuild-schema.sql`)
- Check that RLS is disabled in Supabase (see `STATUS.md`)
- Verify your `.env` credentials are correct

**"Auth error" / Can't access database**
- Check `STATUS.md` for current auth configuration
- RLS might be blocking queries (disable for testing)
- Verify JWT token is being sent correctly

**App crashes on startup**
- Clear Metro cache: `npx expo start -c`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check iOS/Android logs for errors

**Pet animations not showing**
- Verify sprite files exist in `assets/sprites/pet/walking/`
- Check console for image loading errors
- Try clearing cache and reloading

---

## 🚢 Deployment

### Production Checklist

Before deploying to production:

1. ✅ Re-enable RLS on all tables
2. ✅ Change `TESTING_MODE = false` in `context/supabase-provider.tsx`
3. ✅ Verify dev controls are hidden (`__DEV__` check)
4. ✅ Update `.env` with production Supabase credentials
5. ✅ Test authentication flow end-to-end
6. ✅ Run production build and test thoroughly

See `STATUS.md` for current configuration status.

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🙏 Credits

- Built with [Expo](https://expo.dev/)
- Backend by [Supabase](https://supabase.com/)
- Styling with [NativeWind](https://www.nativewind.dev/)
- Form validation with [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/)

---

## 📞 Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Check `STATUS.md` for current project status
- Review `scripts/README.md` for database migration help
