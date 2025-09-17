# Database Integration Guide

This document explains how the database integration works and how to use it.

## Overview

The application has been migrated from an in-memory data store to a persistent SQLite database. All UI components and data structures remain exactly the same - only the underlying storage mechanism has changed.

## Architecture

### Database Layer
- **SQLite Database**: `wavesflow.db` (created in project root)
- **Schema**: `src/lib/database/schema.sql`
- **Service Layer**: `src/lib/database/database.ts`
- **Migration**: `src/lib/database/migrate.ts`

### React Integration
- **Database Hook**: `src/hooks/use-database.tsx` (replaces `use-data.tsx`)
- **Provider**: `DatabaseProvider` (replaces `DataProvider`)
- **Backward Compatibility**: `useData` export for existing components

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Database Migration
```bash
npm run migrate
```

This will:
- Create the SQLite database file (`wavesflow.db`)
- Initialize the database schema
- Migrate all existing data from `data.ts` to the database
- Verify data integrity

### 3. Start the Application
```bash
npm run dev
```

## Database Schema

The database contains 6 main tables:

### Staff Table
- `id` (TEXT PRIMARY KEY)
- `fullName` (TEXT NOT NULL)
- `role` (TEXT NOT NULL) - Manager, Therapist, Receptionist
- `experienceYears` (INTEGER NOT NULL)
- `phoneNumber` (TEXT NOT NULL)
- `gender` (TEXT NOT NULL) - Male, Female

### Rooms Table
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)

### Therapies Table
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `duration` (INTEGER NOT NULL) - in minutes
- `price` (REAL NOT NULL)

### Sales Table
- `id` (TEXT PRIMARY KEY)
- `customerName` (TEXT NOT NULL)
- `customerPhone` (TEXT NOT NULL)
- `amount` (REAL NOT NULL)
- `paymentMethod` (TEXT NOT NULL) - UPI, Cash, Card, Member
- `therapyType` (TEXT NOT NULL)
- `therapistId` (TEXT NOT NULL) - Foreign Key to Staff
- `roomId` (TEXT NOT NULL) - Foreign Key to Rooms
- `startTime` (TEXT NOT NULL) - ISO 8601
- `endTime` (TEXT NOT NULL) - ISO 8601
- `date` (TEXT NOT NULL) - YYYY-MM-DD

### Expenses Table
- `id` (TEXT PRIMARY KEY)
- `description` (TEXT NOT NULL)
- `category` (TEXT NOT NULL) - Supplies, Salary, Utilities, Rent, Other
- `amount` (REAL NOT NULL)
- `date` (TEXT NOT NULL) - YYYY-MM-DD

### Attendance Table
- `id` (TEXT PRIMARY KEY)
- `staffId` (TEXT NOT NULL) - Foreign Key to Staff
- `date` (TEXT NOT NULL) - YYYY-MM-DD
- `status` (TEXT NOT NULL) - Present, Late, Absent
- `checkInTime` (TEXT) - HH:mm
- `notes` (TEXT)

## Usage in Components

### Using the Database Hook

```tsx
import { useData } from '@/hooks/use-database';

function MyComponent() {
  const { 
    staff, 
    sales, 
    addStaff, 
    addSale, 
    isLoading 
  } = useData();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
}
```

### Available Methods

- `staff`, `rooms`, `therapies`, `sales`, `expenses`, `attendance` - Data arrays
- `addStaff(staff)` - Add new staff member
- `updateStaff(staff)` - Update existing staff member
- `addSale(sale)` - Add new sale
- `updateAttendance(attendance)` - Update attendance record
- `refreshData()` - Reload all data from database
- `isLoading` - Loading state

## Data Persistence

- **Automatic**: All data changes are automatically saved to the database
- **Cross-session**: Data persists across app restarts
- **Real-time**: UI updates immediately when data changes
- **ACID Compliance**: All database operations are atomic and consistent

## File Locations

- Database file: `wavesflow.db` (project root)
- Schema: `src/lib/database/schema.sql`
- Service: `src/lib/database/database.ts`
- Migration: `src/lib/database/migrate.ts`
- Hook: `src/hooks/use-database.tsx`
- Migration script: `scripts/migrate-database.ts`

## Troubleshooting

### Database Not Found
If you get database errors, run the migration:
```bash
npm run migrate
```

### Data Not Persisting
Ensure the database file (`wavesflow.db`) exists in the project root and has proper permissions.

### Migration Errors
Check that all dependencies are installed:
```bash
npm install
```

## Platform Compatibility

- ✅ **macOS**: Full support
- ✅ **Windows 11**: Full support
- ✅ **Linux**: Full support
- ✅ **Development**: Full support
- ✅ **Production**: Full support

The SQLite database works seamlessly across all platforms without any additional configuration.
