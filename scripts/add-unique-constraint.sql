-- Add unique constraint to ensure one creature per user
-- This prevents duplicate creatures from being created

-- First, let's see if there are any remaining duplicate creatures
-- (This is just for verification - the constraint will handle prevention)

-- Add the unique constraint
ALTER TABLE creatures 
ADD CONSTRAINT creatures_user_id_unique 
UNIQUE (user_id);

-- Optional: Add a comment to document this constraint
COMMENT ON CONSTRAINT creatures_user_id_unique ON creatures 
IS 'Ensures each user can only have one creature - core Tamagotchi design principle'; 