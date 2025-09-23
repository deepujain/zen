-- Create a temporary table with the new constraints
CREATE TABLE expenses_temp (
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
            'Diesel'
        )
    ),
    amount REAL NOT NULL CHECK (amount > 0),
    date TEXT NOT NULL CHECK (
        date REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' AND
        date >= '2000-01-01' AND
        date <= '2100-12-31'
    )
);

-- Copy data with fixed date format
INSERT INTO expenses_temp 
SELECT 
    id,
    description,
    category,
    amount,
    CASE 
        WHEN date LIKE '%T%' THEN substr(date, 1, 10)
        ELSE date
    END as date
FROM expenses
WHERE id IS NOT NULL;

-- Drop the old table
DROP TABLE expenses;

-- Rename the new table
ALTER TABLE expenses_temp RENAME TO expenses;

-- Recreate the index
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
