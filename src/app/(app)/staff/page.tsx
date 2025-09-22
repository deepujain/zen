
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserCheck, UserX, Clock, FileDown } from 'lucide-react';
import { useData } from "@/hooks/use-api-data";
import Link from 'next/link';
import { format, startOfMonth, isWithinInterval, parseISO, startOfYear, endOfMonth, endOfYear } from "date-fns";
import AttendanceCalendar from "@/components/staff/attendance-calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AddStaffForm from '@/components/staff/add-staff-form';
import RecordAttendanceForm from '@/components/staff/record-attendance-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[1][0]}`;
  }
  return names[0].substring(0, 2).toUpperCase();
};

export default function StaffPage() {
  const { staff, attendance, sales } = useData();
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [recordAttendanceOpen, setRecordAttendanceOpen] = useState(false);
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const todaysAttendance = attendance.filter(a => a.date === todayStr);

  const presentCount = todaysAttendance.filter(a => a.status === 'Present').length;
  const lateCount = todaysAttendance.filter(a => a.status === 'Late').length;
  const absentCount = staff.length - presentCount - lateCount;
  
  const handleExport = () => {
    const yearStart = startOfYear(today);
    const yearEnd = endOfYear(today);
    const ytdInterval = { start: yearStart, end: yearEnd };

    const headers = [
      "Full Name", "Role", "Phone Number", "Experience (Years)", "Gender",
      "YTD Present", "YTD Late", "YTD Absent",
      "YTD Total Sales", "YTD Services Performed", "YTD Average Sale Value"
    ].join(',') + '\n';

    const csvRows = staff.map(member => {
      // YTD Attendance
      const ytdAttendance = attendance.filter(a =>
        a.staffId === member.id && isWithinInterval(parseISO(a.date), ytdInterval)
      );
      const present = ytdAttendance.filter(a => a.status === 'Present').length;
      const late = ytdAttendance.filter(a => a.status === 'Late').length;
      const absent = ytdAttendance.filter(a => a.status === 'Absent').length;

      // YTD Sales
      let totalSales = 0, servicesPerformed = 0, avgSaleValue = 0;
      if (member.role === 'Therapist') {
        const ytdSales = sales.filter(s =>
          s.therapistId === member.id && isWithinInterval(parseISO(s.date), ytdInterval)
        );
        totalSales = ytdSales.reduce((sum, s) => sum + s.amount, 0);
        servicesPerformed = ytdSales.length;
        avgSaleValue = servicesPerformed > 0 ? totalSales / servicesPerformed : 0;
      }
      
      const escapeCsvCell = (cell: string | number) => `"${String(cell).replace(/"/g, '""')}"`;

      return [
        escapeCsvCell(member.fullName),
        escapeCsvCell(member.role),
        escapeCsvCell(member.phoneNumber),
        escapeCsvCell(member.experienceYears),
        escapeCsvCell(member.gender),
        present,
        late,
        absent,
        totalSales.toFixed(2),
        servicesPerformed,
        avgSaleValue.toFixed(2),
      ].join(',');
    });

    const csvContent = headers + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `staff_summary_${format(new Date(), 'yyyyMMdd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <div className="flex gap-2">
            <Dialog open={recordAttendanceOpen} onOpenChange={setRecordAttendanceOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Record Attendance
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Record Attendance</DialogTitle>
                    </DialogHeader>
                    <RecordAttendanceForm setOpen={setRecordAttendanceOpen} />
                </DialogContent>
            </Dialog>

            <Dialog open={addStaffOpen} onOpenChange={setAddStaffOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Staff
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Staff Member</DialogTitle>
                    </DialogHeader>
                    <AddStaffForm setOpen={setAddStaffOpen} />
                </DialogContent>
            </Dialog>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
          <CardDescription>{format(today, 'eeee, MMM d, yyyy')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-3">
          <div className="flex items-center gap-2 p-4 bg-green-100/50 dark:bg-green-900/50 rounded-lg">
            <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-2xl font-bold">{presentCount}</p>
              <p className="text-sm text-muted-foreground">Present</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-4 bg-yellow-100/50 dark:bg-yellow-900/50 rounded-lg">
            <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-2xl font-bold">{lateCount}</p>
              <p className="text-sm text-muted-foreground">Late</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-4 bg-red-100/50 dark:bg-red-900/50 rounded-lg">
            <UserX className="w-6 h-6 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-2xl font-bold">{absentCount}</p>
              <p className="text-sm text-muted-foreground">Absent</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Attendance Calendar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col">
            <AttendanceCalendar attendanceData={attendance} />
            <div className="flex flex-wrap justify-center space-x-4 mt-4 text-sm">
                <div className="flex items-center gap-2"><Badge className="bg-red-200 h-4 w-4 p-0" /> &le;3 Therapists</div>
                <div className="flex items-center gap-2"><Badge className="bg-green-200 h-4 w-4 p-0" /> 4+ Therapists</div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex items-center justify-between flex-row">
          <CardTitle>Staff List</CardTitle>
          <Button variant="outline" onClick={handleExport}>
            <FileDown className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {staff.map(member => {
            const attendanceRecord = todaysAttendance.find(a => a.staffId === member.id);
            const status = attendanceRecord?.status || 'Absent';
            const checkInTime = attendanceRecord?.checkInTime;

            return (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                <Link href={`/staff/${member.id}`} className="flex-1">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-lg">{getInitials(member.fullName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold">{member.fullName}</p>
                      <p className="text-sm text-muted-foreground">{member.role} • Experience: {member.experienceYears} years</p>
                      <p className="text-sm text-muted-foreground">Phone: {member.phoneNumber}</p>
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <Badge variant={status === 'Present' ? 'default' : status === 'Late' ? 'secondary' : 'destructive'} 
                      className={
                        status === 'Present' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        status === 'Late' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }>
                      {status}
                    </Badge>
                    {checkInTime && <p className="text-sm text-muted-foreground mt-1">{checkInTime}</p>}
                    {status === 'Late' && attendanceRecord?.notes && <p className="text-xs text-muted-foreground mt-1">Notes: {attendanceRecord.notes}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

    