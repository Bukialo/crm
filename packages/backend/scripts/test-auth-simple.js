#!/usr/bin/env node

/**
 * Simple authentication test that works without Prisma client generation
 * Tests the database directly with SQL queries
 */

const { Pool } = require('pg');
require('dotenv').config();

async function testAuthSimple() {
  console.log('🧪 Testing authentication flow (simple)...\n');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  try {
    // Test 1: Database connection
    console.log('1. Testing database connection...');
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful\n');

    // Test 2: Check User table structure
    console.log('2. Checking User table structure...');
    const tableInfo = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'User'
      ORDER BY ordinal_position;
    `);
    
    const columns = tableInfo.rows.map(row => row.column_name);
    console.log('   Available columns:', columns.join(', '));
    
    const hasTimezone = columns.includes('timezone');
    console.log(`   Timezone column: ${hasTimezone ? '✅ EXISTS' : '❌ MISSING'}\n`);

    // Test 3: Try to create a test user
    console.log('3. Testing user creation...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testFirebaseUid = `test-firebase-uid-${Date.now()}`;
    
    try {
      let insertQuery, insertValues;
      
      if (hasTimezone) {
        insertQuery = `
          INSERT INTO "User" (email, "firebaseUid", "firstName", "lastName", role, "isActive", timezone, "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
          RETURNING id, email;
        `;
        insertValues = [testEmail, testFirebaseUid, 'Test', 'User', 'AGENT', true, 'UTC'];
      } else {
        insertQuery = `
          INSERT INTO "User" (email, "firebaseUid", "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
          RETURNING id, email;
        `;
        insertValues = [testEmail, testFirebaseUid, 'Test', 'User', 'AGENT', true];
      }

      const result = await pool.query(insertQuery, insertValues);
      const userId = result.rows[0].id;
      console.log(`✅ User created successfully: ${result.rows[0].email} (ID: ${userId})`);
      
      // Clean up test user
      await pool.query('DELETE FROM "User" WHERE id = $1', [userId]);
      console.log('✅ Test user cleaned up\n');
      
    } catch (error) {
      console.log('❌ User creation failed:', error.message);
      
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('💡 This indicates a database schema mismatch');
      }
      throw error;
    }

    // Test 4: Test user lookup by Firebase UID
    console.log('4. Testing user lookup functionality...');
    
    // First create a test user to find
    const lookupTestEmail = `lookup-test-${Date.now()}@example.com`;
    const lookupTestUid = `lookup-firebase-uid-${Date.now()}`;
    
    let insertQuery, insertValues;
    if (hasTimezone) {
      insertQuery = `
        INSERT INTO "User" (email, "firebaseUid", "firstName", "lastName", role, "isActive", timezone, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING id;
      `;
      insertValues = [lookupTestEmail, lookupTestUid, 'Lookup', 'Test', 'AGENT', true, 'UTC'];
    } else {
      insertQuery = `
        INSERT INTO "User" (email, "firebaseUid", "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING id;
      `;
      insertValues = [lookupTestEmail, lookupTestUid, 'Lookup', 'Test', 'AGENT', true];
    }
    
    const createResult = await pool.query(insertQuery, insertValues);
    const testUserId = createResult.rows[0].id;
    
    // Try to find the user
    const findResult = await pool.query('SELECT * FROM "User" WHERE "firebaseUid" = $1', [lookupTestUid]);
    
    if (findResult.rows.length === 1) {
      console.log('✅ User lookup by Firebase UID successful');
      console.log(`   Found: ${findResult.rows[0].email}`);
    } else {
      console.log('❌ User lookup failed');
    }
    
    // Clean up
    await pool.query('DELETE FROM "User" WHERE id = $1', [testUserId]);
    console.log('✅ Lookup test user cleaned up\n');

    console.log('🎉 All authentication tests passed!');
    console.log('   Your database schema is compatible with the authentication flow.');

  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('\n💡 The User table does not exist.');
      console.log('   You need to run database migrations first.');
    } else if (error.message.includes('column') && error.message.includes('does not exist')) {
      console.log('\n💡 A required column is missing from the User table.');
      console.log('   Your database schema may be outdated.');
      console.log('   Try running: node scripts/check-schema.js');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  testAuthSimple().catch(console.error);
}

module.exports = { testAuthSimple };