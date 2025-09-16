
export type Staff = {
  id: string;
  fullName: string;
  role: 'Manager' | 'Therapist' | 'Receptionist';
  experienceYears: number;
  phoneNumber: string;
  gender: 'Male' | 'Female';
};

export type Attendance = {
  id: string;
  staffId: string;
  staff?: Staff;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Late' | 'Absent';
  checkInTime?: string; // HH:mm
  notes?: string;
};

export type Sale = {
  id: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  paymentMethod: 'UPI' | 'Cash' | 'Card' | 'Member';
  therapyType: string;
  therapistId: string;
  therapist?: Staff;
  roomId: string;
  room?: Room;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  date: string; // YYYY-MM-DD
};

export type Expense = {
  id: string;
  description: string;
  category: 'Supplies' | 'Salary' | 'Utilities' | 'Rent' | 'Other';
  amount: number;
  date: string; // YYYY-MM-DD
};

export type Room = {
  id: string;
  name: string;
};

export type Therapy = {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
};
