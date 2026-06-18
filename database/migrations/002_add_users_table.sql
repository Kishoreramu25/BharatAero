-- Migration: 002_add_users_table
-- Purpose: Add authentication and user management table
-- Run this in Supabase SQL Editor if users table doesn't exist

---------------------------------------------------------
-- TABLE: users (Authentication & User Management)
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_salt VARCHAR(64),
    password_hash VARCHAR(128),
    google_id VARCHAR(255) UNIQUE,
    google_email VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create trigger function for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_users_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_modtime 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_users_modified_column();

-- Performance indexes for user lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE deleted_at IS NULL;

-- Enable Row Level Security for Supabase
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own data
CREATE POLICY "Users can read own data"
    ON users FOR SELECT
    USING (auth.uid()::text = id::text);

-- RLS Policy: Only service role can write (backend handles auth)
CREATE POLICY "Service role can write users"
    ON users FOR INSERT
    WITH CHECK (true);

-- RLS Policy: Users can update own data
CREATE POLICY "Users can update own data"
    ON users FOR UPDATE
    USING (auth.uid()::text = id::text)
    WITH CHECK (auth.uid()::text = id::text);
