#!/usr/bin/env node

/**
 * Test script to verify authentication is working
 * This simulates the authentication flow without a real Firebase token
 */

const path = require('path');
process.chdir(path.join(__dirname, '..'));

// Load environment variables
require('dotenv').config();

const { AuthService } = require('../dist/services/auth.service.js');
const { prisma } = require('../dist/lib/prisma.js');

async function testAuth() {
  console.log('🧪 Testing authentication flow...\n');

  const authService = new AuthService();

  try {
    // Test 1: Check if we can connect to the database
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // Test 2: Try to create a user (this will reveal if timezone field exists)
    console.log('2. Testing user creation...');
    const testUser = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      firebaseUid: 'test-firebase-uid-' + Date.now(),
      role: 'AGENT'
    };

    try {
      const user = await authService.createUser(testUser);
      console.log('✅ User creation successful');
      console.log(`   Created user: ${user.email} (ID: ${user.id})`);
      
      // Clean up test user
      await prisma.user.delete({ where: { id: user.id } });
      console.log('✅ Test user cleaned up\n');
      
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  Test user already exists, cleaning up...');
        const existingUser = await prisma.user.findUnique({ where: { email: testUser.email } });
        if (existingUser) {
          await prisma.user.delete({ where: { id: existingUser.id } });
          console.log('✅ Existing test user cleaned up\n');
        }
      } else {
        throw error;
      }
    }

    // Test 3: Test findOrCreateUser function
    console.log('3. Testing findOrCreateUser function...');
    const firebaseUser = {
      uid: 'firebase-test-uid-' + Date.now(),
      email: 'firebase-test@example.com',
      displayName: 'Firebase Test User'
    };

    const foundOrCreatedUser = await authService.findOrCreateUser(firebaseUser);
    console.log('✅ findOrCreateUser successful');
    console.log(`   User: ${foundOrCreatedUser.email} (ID: ${foundOrCreatedUser.id})`);
    
    // Clean up
    await prisma.user.delete({ where: { id: foundOrCreatedUser.id } });
    console.log('✅ Test user cleaned up\n');

    console.log('🎉 All tests passed! Authentication should be working properly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('timezone')) {
      console.log('\n💡 It looks like the timezone field is missing from the database.');
      console.log('   Run the migration script to fix this:');
      console.log('   node scripts/migrate-timezone.js');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testAuth().catch(console.error);
}

module.exports = { testAuth };