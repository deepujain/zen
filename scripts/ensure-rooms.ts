import DatabaseService from '../src/lib/database/database';
import { v4 as uuidv4 } from 'uuid';

async function ensureRooms(roomNames: string[]) {
  const db = DatabaseService.getInstance();
  const existing = await db.getAllRooms();
  const existingLower = new Set(existing.map(r => r.name.toLowerCase()));

  for (const name of roomNames) {
    if (!existingLower.has(name.toLowerCase())) {
      await db.addRoom({ id: `room-${uuidv4()}`, name });
      console.log(`✓ Added room: ${name}`);
    } else {
      console.log(`• Room already exists: ${name}`);
    }
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    // Add all missing rooms from the CSV
    const missingRooms = ['Japanese', 'VIP', 'Vip Royal', 'VVIP', 'Couple', 'Family', 'Semi-VIP', 'Thai', 'Classic', 'Thaira', 'Chill', 'Captain', 'Cholea', 'Temp/Cln', 'Chair'];
    ensureRooms(missingRooms).catch(err => {
      console.error(err);
      process.exit(1);
    });
  } else {
    ensureRooms(args).catch(err => {
      console.error(err);
      process.exit(1);
    });
  }
}


