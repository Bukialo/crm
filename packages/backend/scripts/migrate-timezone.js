#!/usr/bin/env node

/**
 * Manual migration script to add timezone field to User table
 * Run this if Prisma db push fails due to firewall restrictions
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('Starting manual migration to add timezone field...');

  // Get database URL from environment
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  try {
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, 'add-timezone-field.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing migration SQL...');
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('The timezone field has been added to the User table.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runMigration().catch(console.error);
}

module.exports = { runMigration };