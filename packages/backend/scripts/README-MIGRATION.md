# Authentication Fix - Database Migration Required

## Problem
Users are experiencing authentication failures because the database schema is missing the `timezone` field that was added to the User model.

## Error
```
AppError: Error processing user authentication
    at AuthService.findOrCreateUser (packages/backend/src/services/auth.service.ts:XXX:XX)
```

## Root Cause
The Prisma schema has been updated to include a `timezone` field in the User model, but the database hasn't been migrated to include this new column.

## Solutions

### Option 1: Use Prisma Migration (Recommended)
If you have internet access and can download Prisma binaries:

```bash
cd packages/backend
npm run db:push
```

### Option 2: Manual Database Migration
If Prisma migration fails due to firewall restrictions, use our manual migration script:

```bash
cd packages/backend
node scripts/migrate-timezone.js
```

This script will:
1. Add the `timezone` column to the User table
2. Set default values for existing users
3. Make the field NOT NULL

### Option 3: Manual SQL Migration
If you prefer to run the SQL directly:

```sql
-- Connect to your PostgreSQL database and run:
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "timezone" TEXT DEFAULT 'UTC';
UPDATE "User" SET "timezone" = 'UTC' WHERE "timezone" IS NULL;
ALTER TABLE "User" ALTER COLUMN "timezone" SET NOT NULL;
```

## Verification
After applying the migration, test that authentication is working:

```bash
cd packages/backend
npm run build
node scripts/test-auth.js
```

## Code Changes Made
The authentication service has been updated to:
1. Handle cases where the timezone field might not exist (backward compatibility)
2. Provide better error messages and logging
3. Include comprehensive validation for Firebase user data

## Environment Variables Required
Make sure your `.env` file includes:
```
DATABASE_URL=your_postgresql_connection_string
```

## Notes
- The code now gracefully handles missing timezone fields during the transition period
- Once the migration is applied, users will be created with timezone information
- Existing authentication will continue to work during and after the migration