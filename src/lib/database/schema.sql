-- Database schema for Waves Flow Management System
-- This file contains the SQL schema for all entities

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Manager', 'Therapist', 'Receptionist')),
    experienceYears INTEGER NOT NULL,
    phoneNumber TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female'))
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

-- Therapies table
CREATE TABLE IF NOT EXISTS therapies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    price REAL NOT NULL
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    customerName TEXT NOT NULL,
    customerPhone TEXT NOT NULL,
    amount REAL NOT NULL,
    paymentMethod TEXT NOT NULL CHECK (paymentMethod IN ('UPI', 'Cash', 'Card', 'Member')),
    therapyType TEXT NOT NULL,
    therapistId TEXT NOT NULL,
    roomId TEXT NOT NULL,
    startTime TEXT NOT NULL, -- ISO 8601
    endTime TEXT NOT NULL, -- ISO 8601
    date TEXT NOT NULL, -- YYYY-MM-DD
    FOREIGN KEY (therapistId) REFERENCES staff(id),
    FOREIGN KEY (roomId) REFERENCES rooms(id)
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Supplies', 'Salary', 'Utilities', 'Rent', 'Other')),
    amount REAL NOT NULL,
    date TEXT NOT NULL -- YYYY-MM-DD
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    staffId TEXT NOT NULL,
    date TEXT NOT NULL, -- YYYY-MM-DD
    status TEXT NOT NULL CHECK (status IN ('Present', 'Late', 'Absent')),
    checkInTime TEXT, -- HH:mm
    notes TEXT,
    FOREIGN KEY (staffId) REFERENCES staff(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
CREATE INDEX IF NOT EXISTS idx_sales_therapist ON sales(therapistId);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_staff ON attendance(staffId);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
