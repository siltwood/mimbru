-- Migration: Add Enhanced Tamagotchi Fields to Creatures Table
-- Description: Adds poop timing, petting, and health decay tracking fields
-- Date: ${new Date().toISOString().split('T')[0]}

-- Add the new columns to the creatures table
ALTER TABLE creatures 
ADD COLUMN IF NOT EXISTS last_poop_time timestamptz,
ADD COLUMN IF NOT EXISTS last_pet_time timestamptz,
ADD COLUMN IF NOT EXISTS last_health_decay timestamptz;

-- Set default values for existing records
UPDATE creatures 
SET 
    last_poop_time = created_at,
    last_health_decay = created_at
WHERE last_poop_time IS NULL 
   OR last_health_decay IS NULL;

-- Create an index for efficient queries on the new timing fields
CREATE INDEX IF NOT EXISTS idx_creatures_last_poop_time ON creatures(last_poop_time);
CREATE INDEX IF NOT EXISTS idx_creatures_last_health_decay ON creatures(last_health_decay);

-- Add comment for documentation
COMMENT ON COLUMN creatures.last_poop_time IS 'Timestamp of when the creature last pooped (automatic daily)';
COMMENT ON COLUMN creatures.last_pet_time IS 'Timestamp of when the creature was last petted by user';
COMMENT ON COLUMN creatures.last_health_decay IS 'Timestamp of last health decay check (every 12 hours)';

-- Update the pet_actions table to support the new action types if not exists
INSERT INTO pet_actions (user_id, action_type, happiness_effect, health_effect, created_at, updated_at)
SELECT 
    '00000000-0000-0000-0000-000000000000'::uuid, 
    'pet', 
    0, 
    0, 
    now(), 
    now()
WHERE NOT EXISTS (SELECT 1 FROM pet_actions WHERE action_type = 'pet')
LIMIT 1;

-- Show confirmation
SELECT 'Migration completed successfully! Added enhanced Tamagotchi fields to creatures table.' as status; 