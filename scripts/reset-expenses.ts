import sqlite3 from 'sqlite3';
import { join } from 'path';

function resetExpenses() {
  // Create database connection
  const dbPath = join(process.cwd(), 'wavesflow.db');
  const db = new sqlite3.Database(dbPath);

  try {
    const sql = `
      -- Drop existing expenses table
      DROP TABLE IF EXISTS expenses;

      -- Create fresh expenses table with new categories
      CREATE TABLE expenses (
        id TEXT PRIMARY KEY NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL CHECK (
          category IN (
            'Supplies',
            'Rent',
            'Salary',
            'Housekeeping',
            'Security',
            'Refreshments',
            'Water',
            'Snacks',
            'Marketing',
            'Phone Recharge',
            'Diesel',
            'Other'
          )
        ),
        amount REAL NOT NULL CHECK (amount > 0),
        date TEXT NOT NULL
      );

      -- Create index for date-based queries
      CREATE INDEX idx_expenses_date ON expenses(date);
    `;

    db.exec(sql, (err) => {
      if (err) {
        console.error('Error resetting expenses table:', err);
      } else {
        console.log('Successfully reset expenses table');
      }
      // Close the database connection
      db.close();
    });
  } catch (error) {
    console.error('Error resetting expenses table:', error);
    db.close();
  }
}

resetExpenses();