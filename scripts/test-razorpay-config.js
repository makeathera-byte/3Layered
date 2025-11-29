/**
 * Razorpay Configuration Test Script
 * 
 * This script verifies that Razorpay environment variables are properly configured.
 * Run this with: node scripts/test-razorpay-config.js
 * 
 * Note: This script reads .env.local directly. Make sure it exists in the project root.
 */

const fs = require('fs');
const path = require('path');

// Read .env.local file
let envVars = {};
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        envVars[key.trim()] = value;
      }
    }
  });
} catch (error) {
  console.error('❌ Error reading .env.local file:', error.message);
  console.log('\nMake sure .env.local exists in the project root.');
  process.exit(1);
}

console.log('🔍 Testing Razorpay Configuration...\n');

// Check environment variables
const checks = [
  {
    name: 'RAZORPAY_KEY_ID',
    value: process.env.RAZORPAY_KEY_ID,
    required: true,
  },
  {
    name: 'RAZORPAY_KEY_SECRET',
    value: process.env.RAZORPAY_KEY_SECRET,
    required: true,
  },
  {
    name: 'NEXT_PUBLIC_RAZORPAY_KEY_ID',
    value: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    required: true,
  },
];

let allPassed = true;

checks.forEach((check) => {
  const value = envVars[check.name];
  const exists = !!value;
  const isValid = exists && value.length > 0;
  
  if (check.required && !isValid) {
    console.log(`❌ ${check.name}: MISSING or EMPTY`);
    allPassed = false;
  } else if (exists) {
    // Mask the secret key for security
    const displayValue = check.name.includes('SECRET') 
      ? '*'.repeat(value.length)
      : value;
    console.log(`✅ ${check.name}: ${displayValue}`);
    
    // Validate key format
    if (check.name.includes('KEY_ID') && !value.startsWith('rzp_')) {
      console.log(`   ⚠️  Warning: Key ID should start with 'rzp_'`);
    }
  } else {
    console.log(`⚠️  ${check.name}: Not set (optional)`);
  }
});

// Check if KEY_ID values match
if (envVars.RAZORPAY_KEY_ID && envVars.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
  if (envVars.RAZORPAY_KEY_ID === envVars.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
    console.log('\n✅ KEY_ID values match correctly');
  } else {
    console.log('\n❌ KEY_ID values do NOT match!');
    console.log('   RAZORPAY_KEY_ID and NEXT_PUBLIC_RAZORPAY_KEY_ID must be the same');
    allPassed = false;
  }
}

// Check if using live or test keys
if (envVars.RAZORPAY_KEY_ID) {
  if (envVars.RAZORPAY_KEY_ID.startsWith('rzp_live_')) {
    console.log('\n🔴 Using LIVE (Production) keys');
    console.log('   Make sure you are ready for production!');
  } else if (envVars.RAZORPAY_KEY_ID.startsWith('rzp_test_')) {
    console.log('\n🟡 Using TEST keys');
    console.log('   Remember to switch to live keys for production');
  } else {
    console.log('\n⚠️  Key format not recognized');
  }
}

console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('✅ All Razorpay configuration checks passed!');
  console.log('\nNext steps:');
  console.log('1. Restart your Next.js server');
  console.log('2. Test the payment flow on the checkout page');
  console.log('3. Verify Razorpay script loads in browser console');
} else {
  console.log('❌ Some configuration issues found. Please fix them above.');
  process.exit(1);
}

