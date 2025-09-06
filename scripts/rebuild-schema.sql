-- Complete database schema rebuild for Mimbru Tamagotchi App
-- This recreates all tables with enhanced Tamagotchi features

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create habits table
CREATE TABLE habits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    frequency TEXT NOT NULL DEFAULT 'daily', -- daily, weekly, custom
    target_count INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_completed TIMESTAMP WITH TIME ZONE
);

-- Create creatures table with all Tamagotchi features
CREATE TABLE creatures (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Habito',
    
    -- Core stats (0-100)
    health INTEGER DEFAULT 100 CHECK (health >= 0 AND health <= 100),
    happiness INTEGER DEFAULT 100 CHECK (happiness >= 0 AND happiness <= 100),
    cleanliness INTEGER DEFAULT 100 CHECK (cleanliness >= 0 AND cleanliness <= 100),
    hunger INTEGER DEFAULT 100 CHECK (hunger >= 0 AND hunger <= 100),
    
    -- Progression
    level INTEGER DEFAULT 1 CHECK (level > 0),
    experience INTEGER DEFAULT 0 CHECK (experience >= 0),
    
    -- State
    is_dead BOOLEAN DEFAULT false,
    current_animation TEXT DEFAULT 'idle',
    
    -- Care tracking
    last_fed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_cleaned TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    poop_count INTEGER DEFAULT 0 CHECK (poop_count >= 0 AND poop_count <= 5),
    
    -- Enhanced Tamagotchi features
    last_poop_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_pet_time TIMESTAMP WITH TIME ZONE,
    last_health_decay TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pet_actions table for logging interactions
CREATE TABLE pet_actions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    creature_id UUID REFERENCES creatures(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- feed, clean, pet, play, etc.
    
    -- Effect tracking
    health_effect INTEGER DEFAULT 0,
    happiness_effect INTEGER DEFAULT 0,
    cleanliness_effect INTEGER DEFAULT 0,
    hunger_effect INTEGER DEFAULT 0,
    
    -- Context
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint: one creature per user (core Tamagotchi principle)
ALTER TABLE creatures ADD CONSTRAINT creatures_user_id_unique UNIQUE (user_id);

-- Create indexes for performance
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_active ON habits(user_id, is_active);
CREATE INDEX idx_creatures_user_id ON creatures(user_id);
CREATE INDEX idx_pet_actions_user_id ON pet_actions(user_id);
CREATE INDEX idx_pet_actions_creature_id ON pet_actions(creature_id);
CREATE INDEX idx_pet_actions_created_at ON pet_actions(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_actions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for habits
CREATE POLICY "Users can view their own habits" ON habits
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own habits" ON habits
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own habits" ON habits
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habits" ON habits
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for creatures
CREATE POLICY "Users can view their own creature" ON creatures
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own creature" ON creatures
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own creature" ON creatures
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own creature" ON creatures
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for pet_actions
CREATE POLICY "Users can view their own pet actions" ON pet_actions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own pet actions" ON pet_actions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_creatures_updated_at BEFORE UPDATE ON creatures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE habits IS 'User habits that affect creature wellbeing';
COMMENT ON TABLE creatures IS 'Tamagotchi creatures - one per user';
COMMENT ON TABLE pet_actions IS 'Log of all interactions with creatures';
COMMENT ON CONSTRAINT creatures_user_id_unique ON creatures IS 'Ensures each user has exactly one creature';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database schema rebuilt successfully!';
    RAISE NOTICE '🎮 Ready for Tamagotchi features:';
    RAISE NOTICE '   • One creature per user (enforced)';
    RAISE NOTICE '   • Daily poop generation';
    RAISE NOTICE '   • Health decay system';
    RAISE NOTICE '   • Petting with cooldowns';
    RAISE NOTICE '   • Enhanced cleaning mechanics';
    RAISE NOTICE '   • Complete action logging';
END $$; 