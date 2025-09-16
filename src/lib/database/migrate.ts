import DatabaseService from './database';
import { 
  staff as initialStaff, 
  rooms as initialRooms, 
  therapies as initialTherapies, 
  sales as initialSales, 
  expenses as initialExpenses, 
  attendance as initialAttendance 
} from '../data';

class DataMigration {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  public async migrateAllData(): Promise<void> {
    console.log('Starting data migration...');
    
    try {
      // Clear existing data
      await this.clearAllData();
      
      // Migrate each entity
      await this.migrateStaff();
      await this.migrateRooms();
      await this.migrateTherapies();
      await this.migrateSales();
      await this.migrateExpenses();
      await this.migrateAttendance();
      
      console.log('Data migration completed successfully!');
    } catch (error) {
      console.error('Error during data migration:', error);
      throw error;
    }
  }

  private async clearAllData(): Promise<void> {
    console.log('Clearing existing data...');
    
    // Delete in reverse order to respect foreign key constraints
    await this.db.deleteAllAttendance();
    await this.db.deleteAllSales();
    await this.db.deleteAllExpenses();
    await this.db.deleteAllTherapies();
    await this.db.deleteAllRooms();
    await this.db.deleteAllStaff();
  }

  private async migrateStaff(): Promise<void> {
    console.log(`Migrating ${initialStaff.length} staff records...`);
    
    for (const staff of initialStaff) {
      await this.db.addStaff(staff);
    }
    
    console.log('Staff migration completed');
  }

  private async migrateRooms(): Promise<void> {
    console.log(`Migrating ${initialRooms.length} room records...`);
    
    for (const room of initialRooms) {
      await this.db.addRoom(room);
    }
    
    console.log('Rooms migration completed');
  }

  private async migrateTherapies(): Promise<void> {
    console.log(`Migrating ${initialTherapies.length} therapy records...`);
    
    for (const therapy of initialTherapies) {
      await this.db.addTherapy(therapy);
    }
    
    console.log('Therapies migration completed');
  }

  private async migrateSales(): Promise<void> {
    console.log(`Migrating ${initialSales.length} sales records...`);
    
    for (const sale of initialSales) {
      await this.db.addSale(sale);
    }
    
    console.log('Sales migration completed');
  }

  private async migrateExpenses(): Promise<void> {
    console.log(`Migrating ${initialExpenses.length} expense records...`);
    
    for (const expense of initialExpenses) {
      await this.db.addExpense(expense);
    }
    
    console.log('Expenses migration completed');
  }

  private async migrateAttendance(): Promise<void> {
    console.log(`Migrating ${initialAttendance.length} attendance records...`);
    
    for (const attendance of initialAttendance) {
      await this.db.addAttendance(attendance);
    }
    
    console.log('Attendance migration completed');
  }

  public async checkDataIntegrity(): Promise<void> {
    console.log('Checking data integrity...');
    
    const staff = await this.db.getAllStaff();
    const rooms = await this.db.getAllRooms();
    const therapies = await this.db.getAllTherapies();
    const sales = await this.db.getAllSales();
    const expenses = await this.db.getAllExpenses();
    const attendance = await this.db.getAllAttendance();
    
    const staffCount = staff.length;
    const roomsCount = rooms.length;
    const therapiesCount = therapies.length;
    const salesCount = sales.length;
    const expensesCount = expenses.length;
    const attendanceCount = attendance.length;
    
    console.log('Data integrity check:');
    console.log(`- Staff: ${staffCount} records`);
    console.log(`- Rooms: ${roomsCount} records`);
    console.log(`- Therapies: ${therapiesCount} records`);
    console.log(`- Sales: ${salesCount} records`);
    console.log(`- Expenses: ${expensesCount} records`);
    console.log(`- Attendance: ${attendanceCount} records`);
    
    if (staffCount === initialStaff.length &&
        roomsCount === initialRooms.length &&
        therapiesCount === initialTherapies.length &&
        salesCount === initialSales.length &&
        expensesCount === initialExpenses.length &&
        attendanceCount === initialAttendance.length) {
      console.log('✅ All data migrated successfully!');
    } else {
      console.log('❌ Data migration incomplete!');
    }
  }
}


export default DataMigration;
