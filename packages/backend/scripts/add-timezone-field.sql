-- Migration script to add timezone field to User table
-- This can be run manually if Prisma migration fails due to firewall restrictions

-- Add timezone column with default value
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "timezone" TEXT DEFAULT 'UTC';

-- Update existing users to have UTC timezone if they don't have one
UPDATE "User" SET "timezone" = 'UTC' WHERE "timezone" IS NULL;

-- Make timezone NOT NULL after setting default values
ALTER TABLE "User" ALTER COLUMN "timezone" SET NOT NULL;