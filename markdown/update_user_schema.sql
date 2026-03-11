-- Query to update the users table to include the necessary columns for onboarding.
-- Run this in your database console.

-- 1. Ensure columns for professional profile exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS allowed_routes TEXT[]; -- Storing as array of routes

-- 2. Ensure role column exists (if not already there)
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- 3. The company linkage is handled via the 'companies' table 
-- (using the 'assigned_user_id' column you already have).
