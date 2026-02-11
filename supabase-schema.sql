-- SQL Schema for Supabase
-- Run this in Supabase SQL Editor to create tables

-- Table for app state (current step, last saved)
CREATE TABLE IF NOT EXISTS app_state (
  user_id TEXT PRIMARY KEY,
  current_step INTEGER NOT NULL DEFAULT 1,
  last_saved TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table for step mapping (which packages belong to which step)
CREATE TABLE IF NOT EXISTS step_mapping (
  user_id TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  packages JSONB NOT NULL,
  PRIMARY KEY (user_id, step_number)
);

-- Table for currently selected packages
CREATE TABLE IF NOT EXISTS selected_packages (
  user_id TEXT NOT NULL,
  package_number INTEGER NOT NULL,
  PRIMARY KEY (user_id, package_number)
);

-- Enable Row Level Security (RLS)
ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE selected_packages ENABLE ROW LEVEL SECURITY;

-- Policies - allow all operations for now (you can restrict it later based on auth)
CREATE POLICY "Allow all operations on app_state" ON app_state
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on step_mapping" ON step_mapping
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on selected_packages" ON selected_packages
  FOR ALL USING (true) WITH CHECK (true);

-- Insert default state for default_user
INSERT INTO app_state (user_id, current_step, last_saved)
VALUES ('default_user', 1, NOW())
ON CONFLICT (user_id) DO NOTHING;
