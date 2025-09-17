
"use client";

import React, { createContext, useContext, useState } from 'react';
import type { Staff, Room, Therapy, Sale, Expense, Attendance } from '@/lib/types';
import { 
    staff as initialStaff, 
    rooms as initialRooms, 
    therapies as initialTherapies, 
    sales as initialSales, 
    expenses as initialExpenses, 
    attendance as initialAttendance 
} from '@/lib/data';

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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [therapies, setTherapies] = useState<Therapy[]>(initialTherapies);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [attendance, setAttendance] = useState<Attendance[]>(initialAttendance);

  const addStaff = (staffMember: Staff) => {
    setStaff(prev => [...prev, staffMember]);
  };

  const updateStaff = (updatedStaffMember: Staff) => {
    setStaff(prev => prev.map(s => s.id === updatedStaffMember.id ? updatedStaffMember : s));
  };
  
  const addSale = (sale: Sale) => {
    setSales(prev => [sale, ...prev]);
  };

  const updateAttendance = (attendanceRecord: Attendance) => {
    setAttendance(prev => {
        const existingRecordIndex = prev.findIndex(a => a.id === attendanceRecord.id);
        if (existingRecordIndex > -1) {
            const newAttendance = [...prev];
            newAttendance[existingRecordIndex] = attendanceRecord;
            return newAttendance;
        } else {
            return [...prev, attendanceRecord];
        }
    });
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
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
