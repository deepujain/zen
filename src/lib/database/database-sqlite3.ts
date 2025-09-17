import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { Staff, Room, Therapy, Sale, Expense, Attendance } from '../types';

class DatabaseService {
  private db: sqlite3.Database;
  private static instance: DatabaseService;

  private constructor() {
    // Create database file in the project root
    const dbPath = join(process.cwd(), 'wavesflow.db');
    this.db = new sqlite3.Database(dbPath);
    
    // Enable foreign key constraints
    this.db.run('PRAGMA foreign_keys = ON');
    
    // Initialize schema
    this.initializeSchema();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private initializeSchema() {
    try {
      const schemaPath = join(process.cwd(), 'src', 'lib', 'database', 'schema.sql');
      const schema = readFileSync(schemaPath, 'utf8');
      this.db.exec(schema);
      console.log('Database schema initialized successfully');
    } catch (error) {
      console.error('Error initializing database schema:', error);
      throw error;
    }
  }

  // Helper method to promisify database operations
  private promisify<T>(method: (callback: (err: Error | null, result?: T) => void) => void): Promise<T> {
    return new Promise((resolve, reject) => {
      method((err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result as T);
        }
      });
    });
  }

  // Staff operations
  public getAllStaff(): Promise<Staff[]> {
    return this.promisify<Staff[]>((callback) => {
      this.db.all('SELECT * FROM staff ORDER BY fullName', callback);
    });
  }

  public getStaffById(id: string): Promise<Staff | undefined> {
    return this.promisify<Staff | undefined>((callback) => {
      this.db.get('SELECT * FROM staff WHERE id = ?', [id], callback);
    });
  }

  public addStaff(staff: Staff): Promise<void> {
    return this.promisify<void>((callback) => {
      this.db.run(
        'INSERT INTO staff (id, fullName, role, experienceYears, phoneNumber, gender) VALUES (?, ?, ?, ?, ?, ?)',
        [staff.id, staff.fullName, staff.role, staff.experienceYears, staff.phoneNumber, staff.gender],
        callback
      );
    });
  }

  public updateStaff(staff: Staff): Promise<void> {
    return this.promisify<void>((callback) => {
      this.db.run(
        'UPDATE staff SET fullName = ?, role = ?, experienceYears = ?, phoneNumber = ?, gender = ? WHERE id = ?',
        [staff.fullName, staff.role, staff.experienceYears, staff.phoneNumber, staff.gender, staff.id],
        callback
      );
    });
  }

  public deleteStaff(id: string): Promise<void> {
    return this.promisify<void>((callback) => {
      this.db.run('DELETE FROM staff WHERE id = ?', [id], callback);
    });
  }

  // Room operations
  public getAllRooms(): Promise<Room[]> {
    return this.promisify<Room[]>((callback) => {
      this.db.all('SELECT * FROM rooms ORDER BY name', callback);
    });
  }

  public getRoomById(id: string): Promise<Room | undefined> {
    return this.promisify<Room | undefined>((callback) => {
      this.db.get('SELECT * FROM rooms WHERE id = ?', [id], callback);
    });
  }

  public addRoom(room: Room): Promise<void> {
    return this.promisify<void>((callback) => {
      this.db.run('INSERT INTO rooms (id, name) VALUES (?, ?)', [room.id, room.name], callback);
    });
  }

  public updateRoom(room: Room): Promise<void> {
    return this.promisify<void>((callback) => {
      this.db.run('UPDATE rooms SET name = ? WHERE id = ?', [room.name, room.id], callback);
    });
  }

  public deleteRoom(id: string): Promise<void> {
    return this.promisify<void>((callback) => {
      this.db.run('DELETE FROM rooms WHERE id = ?', [id], callback);
    });
  }

  // Therapy operations
  public getAllTherapies(): Promise<Therapy[]> {
    return this.promisify<Therapy[]>((callback) => {
      this.db.all('SELECT * FROM therapies ORDER BY name', callback);
    });
  }

  public getTherapyById(id: string): Promise<Therapy | undefined> {
    return this.promisify<Therapy | undefined>((callback) => {
      this.db.get('SELECT * FROM therapies WHERE id = ?', [id], callback);
    });
  }

  public addTherapy(therapy: Therapy): Promise<void> {
    return this.promisify<void>((callback) => {
      this.db.run('INSERT INTO therapies (id, name, duration, price) VALUES (?, ?, ?, ?)', 
        [therapy.id, therapy.name, therapy.duration, therapy.price], callback);
    });
  }

  public updateTherapy(therapy: Therapy): Promise<void> {
    return this.promisify<void>((callback) => {
      this.db.run('UPDATE therapies SET name = ?, duration = ?, price = ? WHERE id = ?', 
        [therapy.name, therapy.duration, therapy.price, therapy.id], callback);
    });
  }

  public deleteTherapy(id: string): Promise<void> {
    return this.promisify<void>((callback) => {
      this.db.run('DELETE FROM therapies WHERE id = ?', [id], callback);
    });
  }

  // Sale operations
  public getAllSales(): Promise<Sale[]> {
    return this.promisify<Sale[]>((callback) => {
      this.db.all('SELECT * FROM sales ORDER BY date DESC, startTime DESC', callback);
    });
  }

  public getSalesByDateRange(startDate: string, endDate: string): Promise<Sale[]> {
    return this.promisify<Sale[]>((callback) => {
      this.db.all('SELECT * FROM sales WHERE date BETWEEN ? AND ? ORDER BY date DESC, startTime DESC', 
        [startDate, endDate], callback);
    });
  }

  public getSaleById(id: string): Promise<Sale | undefined> {
    return this.promisify<Sale | undefined>((callback) => {
      this.db.get('SELECT * FROM sales WHERE id = ?', [id], callback);
    });
  }

  public addSale(sale: Sale): Promise<void> {
    return this.promisify<void>((callback) => {
      this.db.run(
        'INSERT INTO sales (id, customerName, customerPhone, amount, paymentMethod, therapyType, therapistId, roomId, startTime, endTime, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [sale.id, sale.customerName, sale.customerPhone, sale.amount, sale.paymentMethod, sale.therapyType, sale.therapistId, sale.roomId, sale.startTime, sale.endTime, sale.date],
        callback
      );
    });
  }

  public updateSale(sale: Sale): Promise<void> {
    return this.promisify<void>((callback) => {
      this.db.run(
        'UPDATE sales SET customerName = ?, customerPhone = ?, amount = ?, paymentMethod = ?, therapyType = ?, therapistId = ?, roomId = ?, startTime = ?, endTime = ?, date = ? WHERE id = ?',
        [sale.customerName, sale.customerPhone, sale.amount, sale.paymentMethod, sale.therapyType, sale.therapistId, sale.roomId, sale.startTime, sale.endTime, sale.date, sale.id],
        callback
      );
    });
  }

  public deleteSale(id: string): Promise<void> {
    return this.promisify<void>((callback) => {
      this.db.run('DELETE FROM sales WHERE id = ?', [id], callback);
    });
  }

  // Expense operations
  public getAllExpenses(): Promise<Expense[]> {
    return this.promisify<Expense[]>((callback) => {
      this.db.all('SELECT * FROM expenses ORDER BY date DESC', callback);
    });
  }

  public getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    return this.promisify<Expense[]>((callback) => {
      this.db.all('SELECT * FROM expenses WHERE date BETWEEN ? AND ? ORDER BY date DESC', 
        [startDate, endDate], callback);
    });
  }

  public getExpenseById(id: string): Promise<Expense | undefined> {
    return this.promisify<Expense | undefined>((callback) => {
      this.db.get('SELECT * FROM expenses WHERE id = ?', [id], callback);
    });
  }

  public addExpense(expense: Expense): Promise<void> {
    return this.promisify<void>((callback) => {
      this.db.run('INSERT INTO expenses (id, description, category, amount, date) VALUES (?, ?, ?, ?, ?)', 
        [expense.id, expense.description, expense.category, expense.amount, expense.date], callback);
    });
  }

  public updateExpense(expense: Expense): Promise<void> {
    return this.promisify<void>((callback) => {
      this.db.run('UPDATE expenses SET description = ?, category = ?, amount = ?, date = ? WHERE id = ?', 
        [expense.description, expense.category, expense.amount, expense.date, expense.id], callback);
    });
  }

  public deleteExpense(id: string): Promise<void> {
    return this.promisify<void>((callback) => {
      this.db.run('DELETE FROM expenses WHERE id = ?', [id], callback);
    });
  }

  // Attendance operations
  public getAllAttendance(): Promise<Attendance[]> {
    return this.promisify<Attendance[]>((callback) => {
      this.db.all('SELECT * FROM attendance ORDER BY date DESC', callback);
    });
  }

  public getAttendanceByDate(date: string): Promise<Attendance[]> {
    return this.promisify<Attendance[]>((callback) => {
      this.db.all('SELECT * FROM attendance WHERE date = ? ORDER BY checkInTime', [date], callback);
    });
  }

  public getAttendanceByStaffId(staffId: string): Promise<Attendance[]> {
    return this.promisify<Attendance[]>((callback) => {
      this.db.all('SELECT * FROM attendance WHERE staffId = ? ORDER BY date DESC', [staffId], callback);
    });
  }

  public getAttendanceById(id: string): Promise<Attendance | undefined> {
    return this.promisify<Attendance | undefined>((callback) => {
      this.db.get('SELECT * FROM attendance WHERE id = ?', [id], callback);
    });
  }

  public addAttendance(attendance: Attendance): Promise<void> {
    return this.promisify<void>((callback) => {
      this.db.run(
        'INSERT INTO attendance (id, staffId, date, status, checkInTime, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [attendance.id, attendance.staffId, attendance.date, attendance.status, attendance.checkInTime, attendance.notes],
        callback
      );
    });
  }

  public updateAttendance(attendance: Attendance): Promise<void> {
    return this.promisify<void>((callback) => {
      this.db.run(
        'UPDATE attendance SET staffId = ?, date = ?, status = ?, checkInTime = ?, notes = ? WHERE id = ?',
        [attendance.staffId, attendance.date, attendance.status, attendance.checkInTime, attendance.notes, attendance.id],
        callback
      );
    });
  }

  public deleteAttendance(id: string): Promise<void> {
    return this.promisify<void>((callback) => {
      this.db.run('DELETE FROM attendance WHERE id = ?', [id], callback);
    });
  }

  // Utility methods
  public getSalesSummary(startDate?: string, endDate?: string): Promise<{ totalAmount: number; totalCount: number }> {
    let query = 'SELECT SUM(amount) as totalAmount, COUNT(*) as totalCount FROM sales';
    let params: string[] = [];
    
    if (startDate && endDate) {
      query += ' WHERE date BETWEEN ? AND ?';
      params = [startDate, endDate];
    }
    
    return this.promisify<{ totalAmount: number; totalCount: number }>((callback) => {
      this.db.get(query, params, callback);
    }).then(result => ({
      totalAmount: result.totalAmount || 0,
      totalCount: result.totalCount || 0
    }));
  }

  public getExpensesSummary(startDate?: string, endDate?: string): Promise<{ totalAmount: number; totalCount: number }> {
    let query = 'SELECT SUM(amount) as totalAmount, COUNT(*) as totalCount FROM expenses';
    let params: string[] = [];
    
    if (startDate && endDate) {
      query += ' WHERE date BETWEEN ? AND ?';
      params = [startDate, endDate];
    }
    
    return this.promisify<{ totalAmount: number; totalCount: number }>((callback) => {
      this.db.get(query, params, callback);
    }).then(result => ({
      totalAmount: result.totalAmount || 0,
      totalCount: result.totalCount || 0
    }));
  }

  public close(): void {
    this.db.close();
  }
}

export default DatabaseService;
