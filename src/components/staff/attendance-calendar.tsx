
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import type { Attendance } from "@/lib/types";
import { format, parseISO, startOfMonth, getDay, isBefore, isAfter, isSameMonth } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Badge } from '../ui/badge';

type AttendanceCalendarProps = {
  attendanceData: Attendance[];
};

export default function AttendanceCalendar({ attendanceData }: AttendanceCalendarProps) {
  const router = useRouter();
  const today = new Date();
  const [month, setMonth] = useState(startOfMonth(today));
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const spaStartDate = new Date('2025-09-04T00:00:00.000Z');


  const therapistsPresentByDay = attendanceData.reduce((acc, record) => {
    if (record.status === 'Present' || record.status === 'Late') {
      const day = record.date;
      acc[day] = (acc[day] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const DayWithCount = ({ date }: { date: Date }) => {
    const dayStr = format(date, 'yyyy-MM-dd');
    const count = therapistsPresentByDay[dayStr] || 0;
    const dayOfMonth = date.getDate();
    
    const isDisabled = isAfter(date, today) || isBefore(date, spaStartDate);

    let colorClass = "bg-muted/50";
    if (!isDisabled ) {
      if (count <= 3) colorClass = "bg-red-200 dark:bg-red-800/50";
      if (count === 4) colorClass = "bg-yellow-200 dark:bg-yellow-800/50";
      if (count >= 5) colorClass = "bg-green-200 dark:bg-green-800/50";
    }

    const handleClick = () => {
      if (!isDisabled) {
        router.push(`/staff/attendance/${dayStr}`);
      }
    }

    return (
        <div 
            onClick={handleClick} 
            className={`relative w-full h-full flex flex-col items-center justify-center rounded-md transition-colors ${!isDisabled ? 'cursor-pointer hover:bg-accent' : 'opacity-50 cursor-not-allowed'} ${colorClass}`}
        >
          <span>{dayOfMonth}</span>
          {count > 0 && !isDisabled && <span className="text-xs font-bold">{count}</span>}
        </div>
      );
  };
  
  if (!isClient) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Attendance Calendar</CardTitle>
                <CardDescription>Number of therapists present each day.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
                <div className="p-3 h-[368px] w-full max-w-md animate-pulse bg-muted rounded-md"></div>
                 <div className="flex space-x-4 mt-4 text-sm">
                    <div className="flex items-center gap-2"><Badge className="bg-red-200 h-4 w-4 p-0" /> &le;3 Therapists</div>
                    <div className="flex items-center gap-2"><Badge className="bg-yellow-200 h-4 w-4 p-0" /> 4 Therapists</div>
                    <div className="flex items-center gap-2"><Badge className="bg-green-200 h-4 w-4 p-0" /> 5+ Therapists</div>
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
        <Calendar
          month={month}
          onMonthChange={setMonth}
          disabled={(date) => isAfter(date, today) || isBefore(date, spaStartDate)}
          className="p-0"
          classNames={{
            day_cell: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
            day: "h-16 w-full p-1 font-normal aria-selected:opacity-100",
            day_disabled: "opacity-50 cursor-not-allowed",
            month: "space-y-4 w-full flex flex-col items-center",
            caption: "flex justify-center pt-1 relative items-center w-full mb-4",
            caption_label: "text-lg font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
            nav_button_previous: "",
            nav_button_next: isSameMonth(month, today) ? "invisible" : "visible",
          }}
          components={{
            Day: ({ date }) => <DayWithCount date={date} />,
          }}
        />
  );
}
