import DatabaseService from '../src/lib/database/database';
import { readFileSync } from 'fs';

async function runMigration() {
  const db = DatabaseService.getInstance();
  const migration = readFileSync('./src/lib/database/migrations/004_add_expense_categories.sql', 'utf8');
  await db.runMigration(migration);
  console.log('Migration applied successfully');
}

runMigration().catch(console.error);
