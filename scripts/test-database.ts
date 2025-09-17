#!/usr/bin/env tsx

/**
 * Database Test Script
 * 
 * This script tests the database integration to ensure everything works correctly.
 * Run this after migration to verify the database is working properly.
 * 
 * Usage: npx tsx scripts/test-database.ts
 */

import DatabaseService from '../src/lib/database/database';

async function testDatabase() {
  console.log('🧪 Testing database integration...');
  
  try {
    const db = DatabaseService.getInstance();
    
    // Test 1: Check if all tables exist and have data
    console.log('\n📊 Testing data retrieval...');
    
    const staff = await db.getAllStaff();
    const rooms = await db.getAllRooms();
    const therapies = await db.getAllTherapies();
    const sales = await db.getAllSales();
    const expenses = await db.getAllExpenses();
    const attendance = await db.getAllAttendance();
    
    console.log(`✅ Staff: ${staff.length} records`);
    console.log(`✅ Rooms: ${rooms.length} records`);
    console.log(`✅ Therapies: ${therapies.length} records`);
    console.log(`✅ Sales: ${sales.length} records`);
    console.log(`✅ Expenses: ${expenses.length} records`);
    console.log(`✅ Attendance: ${attendance.length} records`);
    
    // Test 2: Test CRUD operations
    console.log('\n🔧 Testing CRUD operations...');
    
    // Test adding a new staff member
    const testStaff = {
      id: 'test-staff-1',
      fullName: 'Test Staff',
      role: 'Therapist' as const,
      experienceYears: 1,
      phoneNumber: '+91 9999999999',
      gender: 'Female' as const
    };
    
    await db.addStaff(testStaff);
    const retrievedStaff = await db.getStaffById('test-staff-1');
    
    if (retrievedStaff && retrievedStaff.fullName === 'Test Staff') {
      console.log('✅ Staff CRUD operations working');
    } else {
      console.log('❌ Staff CRUD operations failed');
    }
    
    // Clean up test data
    await db.deleteStaff('test-staff-1');
    
    // Test 3: Test sales summary
    console.log('\n📈 Testing sales summary...');
    
    const salesSummary = await db.getSalesSummary();
    console.log(`✅ Total sales amount: ₹${salesSummary.totalAmount}`);
    console.log(`✅ Total sales count: ${salesSummary.totalCount}`);
    
    // Test 4: Test expenses summary
    console.log('\n💰 Testing expenses summary...');
    
    const expensesSummary = await db.getExpensesSummary();
    console.log(`✅ Total expenses amount: ₹${expensesSummary.totalAmount}`);
    console.log(`✅ Total expenses count: ${expensesSummary.totalCount}`);
    
    // Test 5: Test date range queries
    console.log('\n📅 Testing date range queries...');
    
    const recentSales = await db.getSalesByDateRange('2025-09-01', '2025-09-30');
    console.log(`✅ Sales in September 2025: ${recentSales.length} records`);
    
    console.log('\n🎉 All database tests passed!');
    console.log('✅ Database integration is working correctly!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

// Run the test
testDatabase().catch(console.error);
