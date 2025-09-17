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

  // Staff operations
  public getAllStaff(): Staff[] {
    const stmt = this.db.prepare('SELECT * FROM staff ORDER BY fullName');
    return stmt.all() as Staff[];
  }

  public getStaffById(id: string): Staff | undefined {
    const stmt = this.db.prepare('SELECT * FROM staff WHERE id = ?');
    return stmt.get(id) as Staff | undefined;
  }

  public addStaff(staff: Staff): void {
    const stmt = this.db.prepare(`
      INSERT INTO staff (id, fullName, role, experienceYears, phoneNumber, gender)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(staff.id, staff.fullName, staff.role, staff.experienceYears, staff.phoneNumber, staff.gender);
  }

  public updateStaff(staff: Staff): void {
    const stmt = this.db.prepare(`
      UPDATE staff 
      SET fullName = ?, role = ?, experienceYears = ?, phoneNumber = ?, gender = ?
      WHERE id = ?
    `);
    stmt.run(staff.fullName, staff.role, staff.experienceYears, staff.phoneNumber, staff.gender, staff.id);
  }

  public deleteStaff(id: string): void {
    const stmt = this.db.prepare('DELETE FROM staff WHERE id = ?');
    stmt.run(id);
  }

  // Room operations
  public getAllRooms(): Room[] {
    const stmt = this.db.prepare('SELECT * FROM rooms ORDER BY name');
    return stmt.all() as Room[];
  }

  public getRoomById(id: string): Room | undefined {
    const stmt = this.db.prepare('SELECT * FROM rooms WHERE id = ?');
    return stmt.get(id) as Room | undefined;
  }

  public addRoom(room: Room): void {
    const stmt = this.db.prepare('INSERT INTO rooms (id, name) VALUES (?, ?)');
    stmt.run(room.id, room.name);
  }

  public updateRoom(room: Room): void {
    const stmt = this.db.prepare('UPDATE rooms SET name = ? WHERE id = ?');
    stmt.run(room.name, room.id);
  }

  public deleteRoom(id: string): void {
    const stmt = this.db.prepare('DELETE FROM rooms WHERE id = ?');
    stmt.run(id);
  }

  // Therapy operations
  public getAllTherapies(): Therapy[] {
    const stmt = this.db.prepare('SELECT * FROM therapies ORDER BY name');
    return stmt.all() as Therapy[];
  }

  public getTherapyById(id: string): Therapy | undefined {
    const stmt = this.db.prepare('SELECT * FROM therapies WHERE id = ?');
    return stmt.get(id) as Therapy | undefined;
  }

  public addTherapy(therapy: Therapy): void {
    const stmt = this.db.prepare('INSERT INTO therapies (id, name, duration, price) VALUES (?, ?, ?, ?)');
    stmt.run(therapy.id, therapy.name, therapy.duration, therapy.price);
  }

  public updateTherapy(therapy: Therapy): void {
    const stmt = this.db.prepare('UPDATE therapies SET name = ?, duration = ?, price = ? WHERE id = ?');
    stmt.run(therapy.name, therapy.duration, therapy.price, therapy.id);
  }

  public deleteTherapy(id: string): void {
    const stmt = this.db.prepare('DELETE FROM therapies WHERE id = ?');
    stmt.run(id);
  }

  // Sale operations
  public getAllSales(): Sale[] {
    const stmt = this.db.prepare('SELECT * FROM sales ORDER BY date DESC, startTime DESC');
    return stmt.all() as Sale[];
  }

  public getSalesByDateRange(startDate: string, endDate: string): Sale[] {
    const stmt = this.db.prepare('SELECT * FROM sales WHERE date BETWEEN ? AND ? ORDER BY date DESC, startTime DESC');
    return stmt.all(startDate, endDate) as Sale[];
  }

  public getSaleById(id: string): Sale | undefined {
    const stmt = this.db.prepare('SELECT * FROM sales WHERE id = ?');
    return stmt.get(id) as Sale | undefined;
  }

  public addSale(sale: Sale): void {
    const stmt = this.db.prepare(`
      INSERT INTO sales (id, customerName, customerPhone, amount, paymentMethod, therapyType, therapistId, roomId, startTime, endTime, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      sale.id, sale.customerName, sale.customerPhone, sale.amount, 
      sale.paymentMethod, sale.therapyType, sale.therapistId, sale.roomId, 
      sale.startTime, sale.endTime, sale.date
    );
  }

  public updateSale(sale: Sale): void {
    const stmt = this.db.prepare(`
      UPDATE sales 
      SET customerName = ?, customerPhone = ?, amount = ?, paymentMethod = ?, therapyType = ?, 
          therapistId = ?, roomId = ?, startTime = ?, endTime = ?, date = ?
      WHERE id = ?
    `);
    stmt.run(
      sale.customerName, sale.customerPhone, sale.amount, sale.paymentMethod, 
      sale.therapyType, sale.therapistId, sale.roomId, sale.startTime, 
      sale.endTime, sale.date, sale.id
    );
  }

  public deleteSale(id: string): void {
    const stmt = this.db.prepare('DELETE FROM sales WHERE id = ?');
    stmt.run(id);
  }

  // Expense operations
  public getAllExpenses(): Expense[] {
    const stmt = this.db.prepare('SELECT * FROM expenses ORDER BY date DESC');
    return stmt.all() as Expense[];
  }

  public getExpensesByDateRange(startDate: string, endDate: string): Expense[] {
    const stmt = this.db.prepare('SELECT * FROM expenses WHERE date BETWEEN ? AND ? ORDER BY date DESC');
    return stmt.all(startDate, endDate) as Expense[];
  }

  public getExpenseById(id: string): Expense | undefined {
    const stmt = this.db.prepare('SELECT * FROM expenses WHERE id = ?');
    return stmt.get(id) as Expense | undefined;
  }

  public addExpense(expense: Expense): void {
    const stmt = this.db.prepare('INSERT INTO expenses (id, description, category, amount, date) VALUES (?, ?, ?, ?, ?)');
    stmt.run(expense.id, expense.description, expense.category, expense.amount, expense.date);
  }

  public updateExpense(expense: Expense): void {
    const stmt = this.db.prepare('UPDATE expenses SET description = ?, category = ?, amount = ?, date = ? WHERE id = ?');
    stmt.run(expense.description, expense.category, expense.amount, expense.date, expense.id);
  }

  public deleteExpense(id: string): void {
    const stmt = this.db.prepare('DELETE FROM expenses WHERE id = ?');
    stmt.run(id);
  }

  // Attendance operations
  public getAllAttendance(): Attendance[] {
    const stmt = this.db.prepare('SELECT * FROM attendance ORDER BY date DESC');
    return stmt.all() as Attendance[];
  }

  public getAttendanceByDate(date: string): Attendance[] {
    const stmt = this.db.prepare('SELECT * FROM attendance WHERE date = ? ORDER BY checkInTime');
    return stmt.all(date) as Attendance[];
  }

  public getAttendanceByStaffId(staffId: string): Attendance[] {
    const stmt = this.db.prepare('SELECT * FROM attendance WHERE staffId = ? ORDER BY date DESC');
    return stmt.all(staffId) as Attendance[];
  }

  public getAttendanceById(id: string): Attendance | undefined {
    const stmt = this.db.prepare('SELECT * FROM attendance WHERE id = ?');
    return stmt.get(id) as Attendance | undefined;
  }

  public addAttendance(attendance: Attendance): void {
    const stmt = this.db.prepare(`
      INSERT INTO attendance (id, staffId, date, status, checkInTime, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(attendance.id, attendance.staffId, attendance.date, attendance.status, attendance.checkInTime, attendance.notes);
  }

  public updateAttendance(attendance: Attendance): void {
    const stmt = this.db.prepare(`
      UPDATE attendance 
      SET staffId = ?, date = ?, status = ?, checkInTime = ?, notes = ?
      WHERE id = ?
    `);
    stmt.run(attendance.staffId, attendance.date, attendance.status, attendance.checkInTime, attendance.notes, attendance.id);
  }

  public deleteAttendance(id: string): void {
    const stmt = this.db.prepare('DELETE FROM attendance WHERE id = ?');
    stmt.run(id);
  }

  // Utility methods
  public getSalesSummary(startDate?: string, endDate?: string): { totalAmount: number; totalCount: number } {
    let query = 'SELECT SUM(amount) as totalAmount, COUNT(*) as totalCount FROM sales';
    let params: string[] = [];
    
    if (startDate && endDate) {
      query += ' WHERE date BETWEEN ? AND ?';
      params = [startDate, endDate];
    }
    
    const stmt = this.db.prepare(query);
    const result = stmt.get(...params) as { totalAmount: number; totalCount: number };
    
    return {
      totalAmount: result.totalAmount || 0,
      totalCount: result.totalCount || 0
    };
  }

  public getExpensesSummary(startDate?: string, endDate?: string): { totalAmount: number; totalCount: number } {
    let query = 'SELECT SUM(amount) as totalAmount, COUNT(*) as totalCount FROM expenses';
    let params: string[] = [];
    
    if (startDate && endDate) {
      query += ' WHERE date BETWEEN ? AND ?';
      params = [startDate, endDate];
    }
    
    const stmt = this.db.prepare(query);
    const result = stmt.get(...params) as { totalAmount: number; totalCount: number };
    
    return {
      totalAmount: result.totalAmount || 0,
      totalCount: result.totalCount || 0
    };
  }

  public close(): void {
    this.db.close();
  }
}

export default DatabaseService;
