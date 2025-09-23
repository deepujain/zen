"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Staff, Room, Therapy, Sale, Expense, Attendance } from '@/lib/types';

interface DataContextType {
  staff: Staff[];
  rooms: Room[];
  therapies: Therapy[];
  sales: Sale[];
  expenses: Expense[];
  attendance: Attendance[];
  addStaff: (staffMember: Staff) => Promise<void>;
  updateStaff: (staffMember: Staff) => Promise<void>;
  addSale: (sale: Sale) => Promise<void>;
  updateSale: (sale: Sale) => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  updateAttendance: (attendanceRecord: Attendance) => Promise<void>;
  refreshData: () => Promise<void>;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function ApiDataProvider({ children }: { children: React.ReactNode }) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [therapies, setTherapies] = useState<Therapy[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all data from API
  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load all data in parallel
      const [staffResponse, roomsResponse, therapiesResponse, salesResponse, expensesResponse, attendanceResponse] = await Promise.all([
        fetch('/api/staff'),
        fetch('/api/rooms'),
        fetch('/api/therapies'),
        fetch('/api/sales'),
        fetch('/api/expenses'),
        fetch('/api/attendance')
      ]);

      const [staffData, roomsData, therapiesData, salesData, expensesData, attendanceData] = await Promise.all([
        staffResponse.json(),
        roomsResponse.json(),
        therapiesResponse.json(),
        salesResponse.json(),
        expensesResponse.json(),
        attendanceResponse.json()
      ]);

      setStaff(staffData);
      setRooms(roomsData);
      setTherapies(therapiesData);
      setSales(salesData);
      setExpenses(expensesData);
      setAttendance(attendanceData);
    } catch (error) {
      console.error('Error loading data from API:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const addStaff = async (staffMember: Staff) => {
    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(staffMember),
      });

      if (response.ok) {
        setStaff(prev => [...prev, staffMember]);
      } else {
        console.error('Failed to add staff');
      }
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  const updateStaff = async (updatedStaffMember: Staff) => {
    try {
      const response = await fetch('/api/staff', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedStaffMember),
      });

      if (response.ok) {
        setStaff(prev => prev.map(s => s.id === updatedStaffMember.id ? updatedStaffMember : s));
      } else {
        console.error('Failed to update staff');
      }
    } catch (error) {
      console.error('Error updating staff:', error);
    }
  };

  const addSale = async (sale: Sale) => {
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sale),
      });

      if (response.ok) {
        setSales(prev => [sale, ...prev]);
      } else {
        console.error('Failed to add sale');
      }
    } catch (error) {
      console.error('Error adding sale:', error);
    }
  };

  const updateSale = async (sale: Sale) => {
    try {
      const response = await fetch('/api/sales', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sale),
      });

      if (response.ok) {
        setSales(prev => prev.map(s => s.id === sale.id ? sale : s));
      } else {
        console.error('Failed to update sale');
      }
    } catch (error) {
      console.error('Error updating sale:', error);
    }
  };

  const updateAttendance = async (attendanceRecord: Attendance) => {
    try {
      // Check if attendance record exists
      const existingRecord = attendance.find(a => a.id === attendanceRecord.id);
      
      const response = await fetch('/api/attendance', {
        method: existingRecord ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceRecord),
      });

      if (response.ok) {
        if (existingRecord) {
          setAttendance(prev => prev.map(a => a.id === attendanceRecord.id ? attendanceRecord : a));
        } else {
          setAttendance(prev => [...prev, attendanceRecord]);
        }
      } else {
        console.error('Failed to update attendance');
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  const addExpense = async (expense: Expense) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
      });

      if (response.ok) {
        setExpenses(prev => [...prev, expense]);
      } else {
        console.error('Failed to add expense');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const updateExpense = async (expense: Expense) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
      });

      if (response.ok) {
        setExpenses(prev => prev.map(e => e.id === expense.id ? expense : e));
      } else {
        console.error('Failed to update expense');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
    }
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
    updateSale,
    addExpense,
    updateExpense,
    updateAttendance,
    refreshData,
    isLoading,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useApiData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useApiData must be used within an ApiDataProvider');
  }
  return context;
}

// For backward compatibility, export as useData
export const useData = useApiData;
