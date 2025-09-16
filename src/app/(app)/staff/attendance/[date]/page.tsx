
"use client";

import { parseISO, format } from "date-fns";
import { useData } from "@/hooks/use-api-data";
import { AttendanceRecord, Staff } from "@/lib/types";
import AttendanceBoard from "@/components/staff/attendance-board";
import { useMemo } from "react";
import React from 'react'; // Import React

interface PopulatedAttendance extends AttendanceRecord {
  staff: Staff;
}

export default function DailyAttendancePage({ params }: { params: { date: string } }) {
  const { attendance, staff } = useData();
  const selectedDate = React.use(params).date;
  const date = parseISO(selectedDate);

  const { allPresent, allLate, allAbsent } = useMemo(() => {
    const dailyAttendance = attendance.filter(a => a.date === selectedDate);

    const populatedAttendance = dailyAttendance.map(att => {
      const staffMember = staff.find(s => s.id === att.staffId);
      return staffMember ? { ...att, staff: staffMember } : null;
    }).filter((a): a is PopulatedAttendance => a !== null);

    const present = populatedAttendance.filter(a => a.status === 'Present');
    const late = populatedAttendance.filter(a => a.status === 'Late');
    
    const attendedStaffIds = new Set(populatedAttendance.map(a => a.staffId));
    const absentStaff = staff.filter(s => !attendedStaffIds.has(s.id));
    const absent = absentStaff.map(s => ({
        id: `${s.id}-${selectedDate}`,
        staffId: s.id,
        date: selectedDate,
        status: 'Absent' as 'Absent',
        checkInTime: undefined,
        notes: undefined,
        staff: s
    }));

    return { allPresent: present, allLate: late, allAbsent: absent };
  }, [attendance, staff, selectedDate]);


  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold font-headline">{format(date, 'eeee, MMMM d, yyyy')}</h1>
        <p className="text-muted-foreground">Drag and drop staff to update their attendance status.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        <AttendanceBoard
          date={selectedDate}
          initialPresent={allPresent}
          initialLate={allLate}
          initialAbsent={allAbsent}
        />
      </div>
    </div>
  );
}
