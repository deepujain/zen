import { readFileSync } from 'fs';
import { parse as parseCsv } from 'csv-parse/sync';
import DatabaseService from '../src/lib/database/database';
import type { Expense } from '../src/lib/types';

type CsvRow = {
  Date: string; // YYYY-MM-DD
  Category: Expense['category'] | string;
  Description: string;
  Amount: string | number;
};

function normalizeCategory(c: string): Expense['category'] {
  const v = (c || '').trim();
  // Use the category directly from CSV without mapping
  return v as Expense['category'];
}

async function ingestExpensesCsv(csvPath: string, opts: { clear?: boolean } = {}) {
  const db = DatabaseService.getInstance();
  const content = readFileSync(csvPath, 'utf8');
  const records = parseCsv(content, { columns: true, skip_empty_lines: true, trim: true }) as CsvRow[];

  if (opts.clear) {
    await db.deleteAllExpenses();
    console.log('Cleared existing expenses');
  }

  console.log(`Processing ${records.length} expenses`);
  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    try {
      const expense: Expense = {
        id: `exp-${Date.now()}-${i + 1}`,
        date: row.Date,
        category: normalizeCategory(String(row.Category)),
        description: row.Description?.trim() || '',
        amount: typeof row.Amount === 'number' ? row.Amount : Number(String(row.Amount).replace(/,/g, '')),
      };
      await db.addExpense(expense);
      console.log(`✓ Added expense ${i + 1}: ${expense.description}`);
    } catch (err) {
      console.error(`✗ Error on row ${i + 1}:`, err);
    }
  }
  console.log('Expense CSV ingestion completed');
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const csvArg = args.find(a => !a.startsWith('--'));
  const clear = args.includes('--clear');
  if (!csvArg) {
    console.log('Usage: tsx scripts/ingest-expenses-csv.ts <path-to-expenses-csv> [--clear]');
    process.exit(1);
  }
  ingestExpensesCsv(csvArg, { clear }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}


