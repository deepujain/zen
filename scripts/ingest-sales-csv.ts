import { readFileSync } from 'fs';
import { parse as parseCsv } from 'csv-parse/sync';
import { parse as parseDate, format as formatDate, addDays, isAfter } from 'date-fns';
import DatabaseService from '../src/lib/database/database';
import type { Sale } from '../src/lib/types';

type CsvRow = {
  'Sl No': string;
  'Sales Date': string; // e.g., "28 Sep 2025"
  'Customer': string;
  'Phone Number': string; // may be "" or "-"
  'Payment Mode': string; // UPI | Cash | Card | Member
  'Amount': string; // numeric string like "2500" or "0"
  'Therapist': string;
  'Room': string;
  'CheckIn:Checkout': string; // e.g., "12:00 PM - 1:00 AM"
  'Therapy': string;
};

type PaymentMethod = 'UPI' | 'Cash' | 'Card' | 'Member';

function normalizePhone(phone: string): string {
  const trimmed = (phone || '').trim();
  if (!trimmed || trimmed === '-') return '';
  return trimmed;
}

function normalizePayment(method: string): PaymentMethod {
  const normalized = (method || '').trim().toLowerCase();
  if (normalized === 'upi') return 'UPI';
  if (normalized === 'cash') return 'Cash';
  if (normalized === 'card') return 'Card';
  if (normalized === 'member') return 'Member';
  throw new Error(`Invalid payment method: ${method}`);
}

function parseSalesDate(dateStr: string): string {
  // Input like "28 Sep 2025" → output YYYY-MM-DD
  const parsed = parseDate(dateStr.trim(), 'd LLL yyyy', new Date());
  return formatDate(parsed, 'yyyy-MM-dd');
}

function parseAmPmTimeToDate(dateISO: string, timeStr: string): Date {
  // timeStr like "12:00 PM" or "1:00 AM"
  const cleaned = timeStr.replace(/\s+/g, ' ').trim();
  return parseDate(`${dateISO} ${cleaned}`, 'yyyy-MM-dd h:mm a', new Date());
}

function getStartEnd(dateISO: string, range: string): { startTime: string; endTime: string } {
  // range like "12:00 PM - 1:00 AM"
  const [startRaw, endRaw] = range.split('-').map(s => s.trim());
  const startDate = parseAmPmTimeToDate(dateISO, startRaw);
  let endDate = parseAmPmTimeToDate(dateISO, endRaw);
  // If end is not after start, assume overnight to next day
  if (!isAfter(endDate, startDate)) {
    endDate = addDays(endDate, 1);
  }
  return {
    startTime: formatDate(startDate, "yyyy-MM-dd'T'HH:mm:ss"),
    endTime: formatDate(endDate, "yyyy-MM-dd'T'HH:mm:ss"),
  };
}

async function ingestCsv(csvPath: string, opts: { clear?: boolean } = {}): Promise<void> {
  const db = DatabaseService.getInstance();
  const content = readFileSync(csvPath, 'utf8');

  const records = parseCsv(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CsvRow[];

  if (records.length === 0) {
    console.log('No records found in CSV');
    return;
  }

  if (opts.clear) {
    await db.deleteAllSales();
    console.log('Cleared existing sales');
  }

  console.log(`Processing ${records.length} sales`);

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    try {
      const rowDateISO = parseSalesDate(row['Sales Date']);
      const { startTime, endTime } = getStartEnd(rowDateISO, row['CheckIn:Checkout']);
      const sale: Sale = {
        id: `sale-${Date.now()}-${i + 1}`,
        customerName: row['Customer']?.trim() || 'Unknown',
        customerPhone: normalizePhone(row['Phone Number']),
        amount: Number(String(row['Amount']).replace(/,/g, '')) || 0,
        paymentMethod: normalizePayment(row['Payment Mode']),
        therapyType: row['Therapy']?.trim() || 'Unknown',
        therapistId: await getStaffId(db, row['Therapist']),
        roomId: await getRoomId(db, row['Room']),
        startTime,
        endTime,
        date: rowDateISO,
      };
      await db.addSale(sale);
      console.log(`✓ Added sale ${i + 1}: ${sale.customerName}`);
    } catch (err) {
      console.error(`✗ Error on row ${i + 1} (${row['Customer']}):`, err);
    }
  }

  console.log('CSV ingestion completed');
}

async function getStaffId(db: DatabaseService, name: string): Promise<string> {
  const staff = await db.getAllStaff();
  const match = staff.find(s => s.fullName.toLowerCase() === (name || '').toLowerCase());
  if (!match) throw new Error(`Staff member not found: ${name}`);
  return match.id;
}

async function getRoomId(db: DatabaseService, name: string): Promise<string> {
  const rooms = await db.getAllRooms();
  const match = rooms.find(r => r.name.toLowerCase() === (name || '').toLowerCase());
  if (!match) throw new Error(`Room not found: ${name}`);
  return match.id;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const csvArg = args.find(a => !a.startsWith('--'));
  const clear = args.includes('--clear');
  if (!csvArg) {
    console.log('Usage: tsx scripts/ingest-waves-csv.ts <path-to-waves-csv> [--clear]');
    process.exit(1);
  }
  ingestCsv(csvArg, { clear }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}


