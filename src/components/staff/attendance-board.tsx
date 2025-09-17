
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Attendance, Staff } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useData } from '@/hooks/use-api-data';

interface PopulatedAttendance extends Attendance {
  staff: Staff;
}

type AttendanceBoardProps = {
  date: string;
  initialPresent: PopulatedAttendance[];
  initialLate: PopulatedAttendance[];
  initialAbsent: PopulatedAttendance[];
};

const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[1][0]}`;
  }
  return name.substring(0, 2).toUpperCase();
};

function StaffCard({ att }: { att: PopulatedAttendance }) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(att));
    document.body.classList.add('dragging');
  };

  const handleDragEnd = () => {
    document.body.classList.remove('dragging');
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="p-3 mb-2 bg-card border rounded-lg cursor-grab active:cursor-grabbing flex items-center gap-3"
    >
      <Avatar>
        <AvatarFallback>{getInitials(att.staff.fullName)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold">{att.staff.fullName}</p>
        <p className="text-sm text-muted-foreground">{att.staff.role}</p>
      </div>
    </div>
  );
}

function AttendanceColumn({ title, count, status, staff, onDrop }: { title: string; count: number; status: 'Present' | 'Late' | 'Absent'; staff: PopulatedAttendance[], onDrop: (e: React.DragEvent, status: 'Present' | 'Late' | 'Absent') => void}) {
  const [isOver, setIsOver] = useState(false);

  const statusColors = {
    Present: 'border-green-500 bg-green-50 dark:bg-green-900/20',
    Late: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    Absent: 'border-red-500 bg-red-50 dark:bg-red-900/20',
  }

  const dragOverColors = {
    Present: 'border-green-700 bg-green-100 dark:bg-green-900/40',
    Late: 'border-yellow-700 bg-yellow-100 dark:bg-yellow-900/40',
    Absent: 'border-red-700 bg-red-100 dark:bg-red-900/40',
  }

  return (
    <Card 
      className={cn('transition-colors border-2', isOver ? dragOverColors[status] : statusColors[status])}
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        onDrop(e, status);
        setIsOver(false);
      }}
    >
      <CardHeader>
        <CardTitle>{title} ({count})</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[100px] md:min-h-[200px] overflow-y-auto">
        {staff.map(att => <StaffCard key={att.id} att={att} />)}
      </CardContent>
    </Card>
  );
}


export default function AttendanceBoard({ date, initialPresent, initialLate, initialAbsent }: AttendanceBoardProps) {
  const [present, setPresent] = useState(initialPresent);
  const [late, setLate] = useState(initialLate);
  const [absent, setAbsent] = useState(initialAbsent);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const { updateAttendance } = useData();

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    setPresent(initialPresent);
    setLate(initialLate);
    setAbsent(initialAbsent);
  }, [initialPresent, initialLate, initialAbsent]);


  const handleDrop = (e: React.DragEvent, newStatus: 'Present' | 'Late' | 'Absent') => {
    e.preventDefault();
    const droppedItem: PopulatedAttendance = JSON.parse(e.dataTransfer.getData('application/json'));

    const sourceStatus = droppedItem.status;
    
    if (sourceStatus === newStatus) return;

    // This is a new attendance record if they were absent
    const isNewRecord = sourceStatus === 'Absent';
    
    const newRecord: Attendance = {
      id: isNewRecord ? `${droppedItem.staffId}-${date}` : droppedItem.id,
      staffId: droppedItem.staffId,
      date: date,
      status: newStatus,
      checkInTime: newStatus === 'Present' || newStatus === 'Late' ? '02:00 AM' : undefined, // Example time
    };

    updateAttendance(newRecord);
    
    toast({
        title: "Attendance Updated",
        description: `${droppedItem.staff.fullName}'s status changed to ${newStatus}.`,
    });
  };
  
  if (!isClient) return null;

  return (
    <>
      <AttendanceColumn title="Present" count={present.length} status="Present" staff={present} onDrop={handleDrop} />
      <AttendanceColumn title="Absent" count={absent.length} status="Absent" staff={absent} onDrop={handleDrop} />
      <AttendanceColumn title="Late" count={late.length} status="Late" staff={late} onDrop={handleDrop} />
    </>
  );
}
