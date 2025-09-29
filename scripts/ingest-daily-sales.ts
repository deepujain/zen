import DatabaseService from '../src/lib/database/database';
import type { Sale } from '../src/lib/types';
import { format, parse } from 'date-fns';

interface SaleInput {
  customerName: string;
  mobileNo: string;
  paymentMode: string;
  amount: string | number;
  therapistName: string;
  roomNo: string;
  checkInOut: string;
  therapyType: string;
}

class SalesIngester {
  private db: DatabaseService;
  private staff: any[] = [];
  private rooms: any[] = [];
  private date: string;

  constructor(dateStr: string) {
    this.db = DatabaseService.getInstance();
    this.date = this.formatDate(dateStr);
  }

  private formatDate(dateStr: string): string {
    // Convert DD/MM/YYYY to YYYY-MM-DD
    const parts = dateStr.split('/');
    if (parts.length !== 3) throw new Error('Date must be in DD/MM/YYYY format');
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }

  private formatAmount(amount: string | number): number {
    if (typeof amount === 'number') return amount;
    // Handle "Member" case
    if (amount.toLowerCase().includes('member')) return 0;
    // Remove commas and convert to number
    return Number(amount.replace(/,/g, ''));
  }

  private formatPaymentMethod(method: string): 'UPI' | 'Cash' | 'Card' | 'Member' {
    const normalized = method.toLowerCase();
    if (normalized === 'upi') return 'UPI';
    if (normalized === 'cash') return 'Cash';
    if (normalized === 'card') return 'Card';
    if (normalized.includes('member')) return 'Member';
    throw new Error(`Invalid payment method: ${method}. Must be UPI, Cash, Card, or Member`);
  }

  private formatTime(timeStr: string): string {
    // Convert "5:40" to "05:40"
    const [hours, minutes] = timeStr.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }

  private formatCheckInOut(checkInOut: string): { startTime: string; endTime: string } {
    // Handle "5:40 / 6:40" format
    const [checkIn, checkOut] = checkInOut.split('/').map(t => this.formatTime(t.trim()));
    return {
      startTime: `${this.date}T${checkIn}:00`,
      endTime: `${this.date}T${checkOut}:00`
    };
  }

  private async getStaffId(name: string): Promise<string> {
    if (!this.staff) {
      this.staff = await this.db.getAllStaff();
    }
    const member = this.staff.find(s => s.fullName.toLowerCase() === name.toLowerCase());
    if (!member) {
      // Create new staff member
      const id = `staff-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      const newStaff = {
        id,
        fullName: name,
        role: 'Therapist' as const,
        experienceYears: 1,
        phoneNumber: '0000000000',
        gender: 'Female' as const
      };
      try {
        await this.db.addStaff(newStaff);
        this.staff.push(newStaff);
        return id;
      } catch (error: any) {
        if (error.message?.includes('UNIQUE constraint failed')) {
          // If staff exists but wasn't found earlier, refresh staff list
          this.staff = await this.db.getAllStaff();
          const existingMember = this.staff.find(s => s.fullName.toLowerCase() === name.toLowerCase());
          if (existingMember) {
            return existingMember.id;
          }
        }
        throw error;
      }
    }
    return member.id;
  }

  private async getRoomId(name: string): Promise<string> {
    if (!this.rooms) {
      this.rooms = await this.db.getAllRooms();
    }
    // Handle missing room name
    if (!name || name === '-') {
      name = 'Classic';
    }
    const room = this.rooms.find(r => r.name.toLowerCase() === name.toLowerCase());
    if (!room) {
      // Create new room
      const id = `room-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      const newRoom = {
        id,
        name: name
      };
      try {
        await this.db.addRoom(newRoom);
        this.rooms.push(newRoom);
        return id;
      } catch (error: any) {
        if (error.message?.includes('UNIQUE constraint failed')) {
          // If room exists but wasn't found earlier, refresh room list
          this.rooms = await this.db.getAllRooms();
          const existingRoom = this.rooms.find(r => r.name.toLowerCase() === name.toLowerCase());
          if (existingRoom) {
            return existingRoom.id;
          }
        }
        throw error;
      }
    }
    return room.id;
  }

  public async ingestSales(sales: SaleInput[]): Promise<void> {
    console.log(`Processing sales for date: ${this.date}`);

    for (const [index, saleInput] of sales.entries()) {
      try {
        const { startTime, endTime } = this.formatCheckInOut(saleInput.checkInOut);
        
        const sale: Sale = {
          id: `sale-${Date.now()}-${index + 1}`,
          customerName: saleInput.customerName,
          customerPhone: saleInput.mobileNo,
          amount: this.formatAmount(saleInput.amount),
          paymentMethod: this.formatPaymentMethod(saleInput.paymentMode),
          therapyType: saleInput.therapyType,
          therapistId: await this.getStaffId(saleInput.therapistName),
          roomId: await this.getRoomId(saleInput.roomNo),
          startTime,
          endTime,
          date: this.date
        };

        await this.db.addSale(sale);
        console.log(`✓ Added sale for ${sale.customerName}`);
      } catch (error) {
        console.error(`✗ Error adding sale for ${saleInput.customerName}:`, error);
      }
    }

    console.log('Sales ingestion completed');
  }
}

// Example usage:
async function ingestDailySales(date: string, sales: SaleInput[]) {
  const ingester = new SalesIngester(date);
  await ingester.ingestSales(sales);
}

// Example data format (for reference)
const exampleSales: SaleInput[] = [
  {
    customerName: "Bhargav",
    mobileNo: "9482491979",
    paymentMode: "Card",
    amount: "5,000",
    therapistName: "Liza",
    roomNo: "Classic",
    checkInOut: "5:40 / 6:40",
    therapyType: "Swedish"
  }
];

// If running directly (not imported)
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.log('Usage: ts-node ingest-daily-sales.ts <sales-data-file.json>');
    console.log('\nJSON file should follow this format:');
    console.log(JSON.stringify({
      date: "DD/MM/YYYY",
      sales: exampleSales
    }, null, 2));
    process.exit(1);
  }

  const jsonFile = args[0];
  try {
    const { date, sales } = require(process.cwd() + '/' + jsonFile);
    if (!date || !sales || !Array.isArray(sales)) {
      throw new Error('Invalid JSON format. Must include "date" and "sales" array.');
    }
    ingestDailySales(date, sales).catch(console.error);
  } catch (error) {
    console.error('Error reading sales data:', error);
    process.exit(1);
  }
}
