# Authentication Fix - Database Migration Guide

## Problem
Users are experiencing authentication failures due to a missing `timezone` field in the User model.

## Quick Fix

### Option 1: Automatic Schema Check and Fix
Run this script to automatically check and fix your database schema:
```bash
cd packages/backend
node scripts/check-schema.js
```

This script will:
- ✅ Test database connection
- ✅ Check if User table exists
- ✅ Verify all required columns are present
- ✅ Add missing timezone column if needed
- ✅ Test basic user operations

### Option 2: Manual Migration (if Option 1 fails)
If you have access to Prisma CLI:
```bash
cd packages/backend
npm run db:push
```

If Prisma CLI is blocked by firewall:
```bash
cd packages/backend
node scripts/migrate-timezone.js
```

### Option 3: Direct SQL (database admin access)
Connect to your PostgreSQL database and run:
```sql
-- Check if timezone column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'User' AND column_name = 'timezone';

-- Add timezone column if it doesn't exist
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
```

## Verification

After running any of the above options, verify the fix worked:

```bash
cd packages/backend
node scripts/test-auth-simple.js
```

This will test:
- ✅ Database connection
- ✅ User table structure
- ✅ User creation with all fields
- ✅ User lookup by Firebase UID

## Code Changes Made

The authentication service has been enhanced with:

1. **Backward Compatibility**: Works with or without timezone field
2. **Better Error Handling**: Detailed logging and specific error messages
3. **Resilient User Creation**: Falls back to essential fields if extended fields fail
4. **Enhanced Validation**: Proper validation of Firebase user data

## Troubleshooting

### If you get "User table does not exist"
Your database hasn't been initialized. You need to run database migrations first.

### If you get "column does not exist" errors
Run `node scripts/check-schema.js` to automatically fix missing columns.

### If you get connection errors
Check your `DATABASE_URL` environment variable is set correctly.

### If authentication still fails after migration
1. Check the logs for specific error messages
2. Run `node scripts/test-auth-simple.js` to diagnose the issue
3. Ensure your Firebase configuration is correct

## Files Modified

- `src/services/auth.service.ts` - Enhanced error handling and backward compatibility
- `src/middlewares/auth.middleware.ts` - Improved error reporting
- `scripts/check-schema.js` - Automatic schema validation and fixes
- `scripts/test-auth-simple.js` - Simple authentication testing
- `scripts/migrate-timezone.js` - Manual timezone migration
- `scripts/add-timezone-field.sql` - SQL for manual migration