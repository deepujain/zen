import DatabaseService from '../src/lib/database/database';
import { v4 as uuidv4 } from 'uuid';
import type { Staff } from '../src/lib/types';

async function ensureStaff(names: string[]) {
  const db = DatabaseService.getInstance();
  const existing = await db.getAllStaff();
  const existingLower = new Map(existing.map(s => [s.fullName.toLowerCase(), s]));

  for (const name of names) {
    if (!existingLower.has(name.toLowerCase())) {
      const staff: Staff = {
        id: `staff-${uuidv4()}`,
        fullName: name,
        role: 'Therapist',
        experienceYears: 0,
        phoneNumber: '',
        gender: 'Female',
      };
      await db.addStaff(staff);
      console.log(`✓ Added staff: ${name}`);
    } else {
      console.log(`• Staff already exists: ${name}`);
    }
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    // Add all missing staff from the CSV
    const missingStaff = ['Riya', 'Aliya', 'Bella', 'Nora', 'Kriti', 'Muskan', 'Maya', 'Honey', 'Maria', 'Priya'];
    ensureStaff(missingStaff).catch(err => {
      console.error(err);
      process.exit(1);
    });
  } else {
    ensureStaff(args).catch(err => {
      console.error(err);
      process.exit(1);
    });
  }
}


