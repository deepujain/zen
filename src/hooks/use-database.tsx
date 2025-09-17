"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Staff, Room, Therapy, Sale, Expense, Attendance } from '@/lib/types';
import DatabaseService from '@/lib/database/database';

interface DataContextType {
  staff: Staff[];
  rooms: Room[];
  therapies: Therapy[];
  sales: Sale[];
  expenses: Expense[];
  attendance: Attendance[];
  addStaff: (staffMember: Staff) => void;
  updateStaff: (staffMember: Staff) => void;
  addSale: (sale: Sale) => void;
  updateAttendance: (attendanceRecord: Attendance) => void;
  refreshData: () => void;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [therapies, setTherapies] = useState<Therapy[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const db = DatabaseService.getInstance();

  // Load all data from database
  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load all data in parallel
      const [staffData, roomsData, therapiesData, salesData, expensesData, attendanceData] = await Promise.all([
        Promise.resolve(db.getAllStaff()),
        Promise.resolve(db.getAllRooms()),
        Promise.resolve(db.getAllTherapies()),
        Promise.resolve(db.getAllSales()),
        Promise.resolve(db.getAllExpenses()),
        Promise.resolve(db.getAllAttendance())
      ]);

      setStaff(staffData);
      setRooms(roomsData);
      setTherapies(therapiesData);
      setSales(salesData);
      setExpenses(expensesData);
      setAttendance(attendanceData);
    } catch (error) {
      console.error('Error loading data from database:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const addStaff = (staffMember: Staff) => {
    try {
      db.addStaff(staffMember);
      setStaff(prev => [...prev, staffMember]);
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  const updateStaff = (updatedStaffMember: Staff) => {
    try {
      db.updateStaff(updatedStaffMember);
      setStaff(prev => prev.map(s => s.id === updatedStaffMember.id ? updatedStaffMember : s));
    } catch (error) {
      console.error('Error updating staff:', error);
    }
  };

  const addSale = (sale: Sale) => {
    try {
      db.addSale(sale);
      setSales(prev => [sale, ...prev]);
    } catch (error) {
      console.error('Error adding sale:', error);
    }
  };

  const updateAttendance = (attendanceRecord: Attendance) => {
    try {
      // Check if attendance record exists
      const existingRecord = db.getAttendanceById(attendanceRecord.id);
      
      if (existingRecord) {
        db.updateAttendance(attendanceRecord);
        setAttendance(prev => prev.map(a => a.id === attendanceRecord.id ? attendanceRecord : a));
      } else {
        db.addAttendance(attendanceRecord);
        setAttendance(prev => [...prev, attendanceRecord]);
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const refreshData = () => {
    loadData();
  };

  const value = {
    staff,
    rooms,
    therapies,
    sales,
    expenses,
    attendance,
    addStaff,
    updateStaff,
    addSale,
    updateAttendance,
    refreshData,
    isLoading,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useDatabase() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}

// For backward compatibility, export as useData
export const useData = useDatabase;
