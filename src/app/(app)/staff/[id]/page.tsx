
"use client";

import React, { useState } from 'react';
import { useData } from "@/hooks/use-api-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Briefcase, User } from "lucide-react";
import { notFound } from "next/navigation";
import { format, parseISO, startOfMonth, startOfYear, isWithinInterval } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import EditStaffForm from '@/components/staff/edit-staff-form';
import EditAttendanceForm from '@/components/staff/edit-attendance-form';
import { useToast } from '@/hooks/use-toast';
import SalesSummary from '@/components/staff/sales-summary';

const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length > 1) return `${names[0][0]}${names[1][0]}`;
  return name.substring(0, 2).toUpperCase();
};

export default function StaffDetailPage({ params }: { params: { id: string } }) {
  const { id } = React.use(params);
  const { staff, attendance, sales } = useData();
  const [editStaffOpen, setEditStaffOpen] = useState(false);
  const [editAttendanceOpen, setEditAttendanceOpen] = useState(false);
  const { toast } = useToast();

  const member = staff.find(s => s.id === id);

  if (!member) {
    notFound();
  }

  const calculateStats = (staffId: string, startDate: Date, endDate: Date) => {
    const interval = { start: startDate, end: endDate };
    const staffAttendance = attendance.filter(a => a.staffId === staffId && isWithinInterval(parseISO(a.date), interval));
    
    const present = staffAttendance.filter(a => a.status === 'Present').length;
    const late = staffAttendance.filter(a => a.status === 'Late').length;
    const absent = staffAttendance.filter(a => a.status === 'Absent').length;
    const totalDays = staffAttendance.length;

    return { present, late, absent, totalDays };
  }
  
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const todaysRecord = attendance.find(a => a.staffId === member.id && a.date === todayStr);
  const staffSales = sales.filter(s => s.therapistId === member.id);

  const mtdStats = calculateStats(member.id, startOfMonth(today), today);
  const ytdStats = calculateStats(member.id, startOfYear(today), today);
  
  const handleEditAttendanceClick = () => {
    if (!todaysRecord) {
        toast({
            variant: "destructive",
            title: "No Record Found",
            description: `No attendance record for ${member.fullName} today. Please record attendance first.`,
        });
        return;
    }
    setEditAttendanceOpen(true);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 text-3xl">
              <AvatarFallback>{getInitials(member.fullName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold font-headline">{member.fullName}</h1>
              <p className="text-muted-foreground">{member.role}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {member.phoneNumber}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {member.experienceYears} years</span>
                <span className="flex items-center gap-1.5"><User className="w-4 h-4"/> {member.gender}</span>
              </div>
            </div>
            <Dialog open={editStaffOpen} onOpenChange={setEditStaffOpen}>
                <DialogTrigger asChild>
                    <Button>Edit</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Staff Member</DialogTitle></DialogHeader>
                    <EditStaffForm staffMember={member} setOpen={setEditStaffOpen} />
                </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Today's Status</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {todaysRecord ? (
                <>
                    <Badge variant={todaysRecord.status === 'Present' ? 'default' : todaysRecord.status === 'Late' ? 'secondary' : 'destructive'} 
                      className={`text-lg px-4 py-1 capitalize ${
                        todaysRecord.status === 'Present' ? 'bg-green-100 text-green-800' :
                        todaysRecord.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {todaysRecord.status}
                    </Badge>
                    {todaysRecord.checkInTime && <p className="text-muted-foreground mt-2">Check-in: {todaysRecord.checkInTime}</p>}
                </>
            ) : (
                <Badge variant="destructive" className="text-lg px-4 py-1 bg-red-100 text-red-800">Absent</Badge>
            )}
             <div>
                <Dialog open={editAttendanceOpen} onOpenChange={setEditAttendanceOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={handleEditAttendanceClick}>Edit Attendance</Button>
                    </DialogTrigger>
                    {todaysRecord && (
                        <DialogContent>
                            <DialogHeader><DialogTitle>Edit Attendance</DialogTitle></DialogHeader>
                            <EditAttendanceForm attendanceRecord={todaysRecord} staffMember={member} setOpen={setEditAttendanceOpen} />
                        </DialogContent>
                    )}
                </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="font-semibold">Month-to-Date</h3>
                    <div className="grid grid-cols-4 gap-2 text-center mt-2">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
                            <p className="font-bold text-lg">{mtdStats.present}</p><p className="text-xs">Present</p>
                        </div>
                        <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300">
                            <p className="font-bold text-lg">{mtdStats.late}</p><p className="text-xs">Late</p>
                        </div>
                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300">
                            <p className="font-bold text-lg">{mtdStats.absent}</p><p className="text-xs">Absent</p>
                        </div>
                        <div className="p-2 rounded-lg bg-primary/20">
                            <p className="font-bold text-lg">{mtdStats.totalDays}</p><p className="text-xs">Total Days</p>
                        </div>
                    </div>
                </div>
                 <div>
                    <h3 className="font-semibold">Year-to-Date</h3>
                    <div className="grid grid-cols-4 gap-2 text-center mt-2">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
                            <p className="font-bold text-lg">{ytdStats.present}</p><p className="text-xs">Present</p>
                        </div>
                        <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300">
                            <p className="font-bold text-lg">{ytdStats.late}</p><p className="text-xs">Late</p>
                        </div>
                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300">
                            <p className="font-bold text-lg">{ytdStats.absent}</p><p className="text-xs">Absent</p>
                        </div>
                        <div className="p-2 rounded-lg bg-primary/20">
                            <p className="font-bold text-lg">{ytdStats.totalDays}</p><p className="text-xs">Total Days</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
      
      {member.role === 'Therapist' && <SalesSummary staffId={member.id} allSales={sales} />}
    </div>
  );
}
