#!/usr/bin/env node

/**
 * Simple script to check database schema and fix issues
 * This doesn't require Prisma binaries to work
 */

const { Pool } = require('pg');
require('dotenv').config();

async function checkAndFixSchema() {
  console.log('🔍 Checking database schema...\n');

  // Get database URL from environment
  const databaseUrl = process.env.DATABASE_URL || (process.env.NODE_ENV === 'test' ? "postgresql://bukialo_user:bukialo_pass@localhost:5432/bukialo_crm_test" : "postgresql://bukialo_user:bukialo_pass@localhost:5432/bukialo_crm");
  console.log(`🔑 Using DATABASE_URL: ${databaseUrl}\n`);
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  try {
    // Test connection
    console.log('1. Testing database connection...');
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful\n');

    // Check if User table exists
    console.log('2. Checking if User table exists...');
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'User'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ User table does not exist');
      console.log('💡 You need to run database migrations first');
      process.exit(1);
    }
    console.log('✅ User table exists\n');

    // Check User table columns
    console.log('3. Checking User table columns...');
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'User'
      ORDER BY ordinal_position;
    `);

    console.log('   Current User table columns:');
    const columnNames = [];
    for (const col of columns.rows) {
      columnNames.push(col.column_name);
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    }
    console.log('');

    // Check if timezone column exists
    const hasTimezone = columnNames.includes('timezone');
    if (!hasTimezone) {
      console.log('⚠️  Missing timezone column - this will cause authentication errors');
      console.log('   Adding timezone column...');
      
      try {
        await pool.query(`
          ALTER TABLE "User" 
          ADD COLUMN timezone TEXT DEFAULT 'UTC';
        `);
        console.log('✅ Successfully added timezone column\n');
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('✅ Timezone column already exists\n');
        } else {
          throw error;
        }
      }
    } else {
      console.log('✅ Timezone column exists\n');
    }

    // Check for required columns
    const requiredColumns = ['id', 'email', 'firebaseUid', 'firstName', 'lastName', 'role', 'isActive'];
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('❌ Missing required columns:', missingColumns.join(', '));
      console.log('💡 Your database schema may be outdated');
    } else {
      console.log('✅ All required columns are present\n');
    }

    // Test a simple user query to ensure the schema works
    console.log('4. Testing user query...');
    try {
      const testQuery = await pool.query('SELECT COUNT(*) as count FROM "User"');
      console.log(`✅ User query successful - found ${testQuery.rows[0].count} users\n`);
    } catch (error) {
      console.log('❌ User query failed:', error.message);
      throw error;
    }

    console.log('🎉 Database schema check completed successfully!');
    console.log('   Your authentication should now work properly.');

  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
    
    if (error.message.includes('does not exist')) {
      console.log('\n💡 It looks like your database is not set up yet.');
      console.log('   You need to run database migrations first.');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  checkAndFixSchema().catch(console.error);
}

module.exports = { checkAndFixSchema };