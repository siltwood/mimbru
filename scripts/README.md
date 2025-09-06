# 🚀 Mimbru Database Migration

This directory contains the database migration scripts to add enhanced Tamagotchi features to your Mimbru app.

## 🎯 What This Adds

The migration adds three new columns to your `creatures` table:

- `last_poop_time` - Tracks when the pet last pooped (automatic daily)
- `last_pet_time` - Tracks when the user last petted the creature
- `last_health_decay` - Tracks the last health decay check (every 12 hours)

## 🏃‍♂️ Quick Setup

### Option 1: Automatic Migration (Recommended)

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Make sure your `.env` file has these variables:**
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Run the migration:**
   ```bash
   yarn migrate
   ```

### Option 2: Manual Migration

If the automatic migration doesn't work:

1. **Get manual instructions:**
   ```bash
   yarn migrate:manual
   ```

2. **Or directly copy the SQL:**
   - Go to your [Supabase Dashboard](https://supabase.com/dashboard)
   - Open the SQL Editor
   - Copy the contents of `scripts/migrate-creature-fields.sql`
   - Paste and execute

## 🔍 What Gets Added

```sql
-- New columns
ALTER TABLE creatures 
ADD COLUMN IF NOT EXISTS last_poop_time timestamptz,
ADD COLUMN IF NOT EXISTS last_pet_time timestamptz,
ADD COLUMN IF NOT EXISTS last_health_decay timestamptz;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_creatures_last_poop_time ON creatures(last_poop_time);
CREATE INDEX IF NOT EXISTS idx_creatures_last_health_decay ON creatures(last_health_decay);
```

## 🎮 New Features After Migration

- **💩 Daily Poop System**: Pet poops every 24 hours automatically
- **😍 Petting**: Users can pet their creature once per hour for bonding
- **⚰️ Health Decay**: Health drops every 12 hours without habit completion  
- **🌟 Smart Revival**: Resurrection requires recent habit completion
- **⚠️ Smart Warnings**: Visual alerts for urgent pet needs

## 🐛 Troubleshooting

### Migration Fails?
- Check your `.env` file has the correct Supabase credentials
- Make sure your `SUPABASE_SERVICE_ROLE_KEY` is set (not just the anon key)
- Try the manual migration approach

### App Crashes After Migration?
- Clear your app cache: `npx expo start --clear`
- Check that all new fields are properly added in Supabase dashboard

### Missing Features?
- Verify the migration completed successfully
- Check the app console for any error messages
- Ensure you're using the latest code with the enhanced creature features

## 🎊 Success!

After a successful migration, your Mimbru app will have hardcore Tamagotchi features that make habit tracking way more engaging! Your pet will literally depend on your good habits to survive. 💪 