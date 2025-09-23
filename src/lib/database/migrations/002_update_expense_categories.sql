-- Drop the old check constraint
DROP TABLE IF EXISTS expenses_temp;
CREATE TABLE expenses_temp (
    id TEXT PRIMARY KEY,
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
            'Diesel'
        )
    ),
    amount REAL NOT NULL,
    date TEXT NOT NULL -- YYYY-MM-DD
);

-- Copy data from the old table
INSERT INTO expenses_temp SELECT * FROM expenses;

-- Drop the old table
DROP TABLE expenses;

-- Rename the new table
ALTER TABLE expenses_temp RENAME TO expenses;

-- Recreate the index
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
