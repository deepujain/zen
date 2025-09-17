#!/usr/bin/env tsx

/**
 * Database Migration Script
 * 
 * This script migrates data from the in-memory data.ts file to the SQLite database.
 * Run this script once to initialize the database with existing data.
 * 
 * Usage: npx tsx scripts/migrate-database.ts
 */

import DataMigration from '../src/lib/database/migrate';

async function main() {
  console.log('🚀 Starting database migration...');
  
  try {
    const migration = new DataMigration();
    
    // Migrate all data
    await migration.migrateAllData();
    
    // Check data integrity
    await migration.checkDataIntegrity();
    
    console.log('✅ Database migration completed successfully!');
    console.log('🎉 Your app is now using persistent database storage!');
    
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
main().catch(console.error);
