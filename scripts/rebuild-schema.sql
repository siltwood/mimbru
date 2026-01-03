-- Mimbru Database Schema (RLS DISABLED for development)
-- Run this in Supabase SQL Editor

-- Nuke everything
DROP TABLE IF EXISTS pet_actions CASCADE;
DROP TABLE IF EXISTS creatures CASCADE;
DROP TABLE IF EXISTS habits CASCADE;

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habits table
CREATE TABLE habits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    frequency TEXT NOT NULL DEFAULT 'daily',
    target_count INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_completed TIMESTAMPTZ
);

-- Creatures table
CREATE TABLE creatures (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    name TEXT NOT NULL DEFAULT 'Habito',
    health INTEGER DEFAULT 100,
    happiness INTEGER DEFAULT 100,
    cleanliness INTEGER DEFAULT 100,
    hunger INTEGER DEFAULT 100,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    is_dead BOOLEAN DEFAULT false,
    current_animation TEXT DEFAULT 'idle',
    last_fed TIMESTAMPTZ DEFAULT NOW(),
    last_cleaned TIMESTAMPTZ DEFAULT NOW(),
    poop_count INTEGER DEFAULT 0,
    food_count INTEGER DEFAULT 10,
    last_poop_time TIMESTAMPTZ DEFAULT NOW(),
    last_pet_time TIMESTAMPTZ,
    last_health_decay TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pet actions log
CREATE TABLE pet_actions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    creature_id UUID REFERENCES creatures(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    health_effect INTEGER DEFAULT 0,
    happiness_effect INTEGER DEFAULT 0,
    cleanliness_effect INTEGER DEFAULT 0,
    hunger_effect INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_creatures_user_id ON creatures(user_id);
CREATE INDEX idx_pet_actions_user_id ON pet_actions(user_id);
CREATE INDEX idx_pet_actions_creature_id ON pet_actions(creature_id);

-- NO RLS - open for development
-- Enable these for production with proper policies
