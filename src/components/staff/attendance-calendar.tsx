
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar"; // Keep Calendar for month navigation, but remove day rendering
import type { Attendance } from "@/lib/types";
import { format, parseISO, startOfMonth, getDay, isBefore, isAfter, isSameMonth, addMonths, subMonths, eachDayOfInterval, endOfMonth, isToday } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Badge } from '../ui/badge';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

type AttendanceCalendarProps = {
  attendanceData: Attendance[];
};

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AttendanceCalendar({ attendanceData }: AttendanceCalendarProps) {
  const router = useRouter();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today)); // Renamed from month to currentMonth
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

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    const firstDayOfMonth = getDay(start);
    
    // Add placeholders for days before the start of the month
    const placeholders = Array.from({ length: firstDayOfMonth }, (_, i) => new Date(0, 0, i));
    return [...placeholders, ...days];
  }, [currentMonth]);


  const DayCell = ({ date }: { date: Date }) => {
    const dayStr = format(date, 'yyyy-MM-dd');
    const count = therapistsPresentByDay[dayStr] || 0;
    const dayOfMonth = date.getDate();
    
    const isDisabled = isAfter(date, today) || isBefore(date, spaStartDate);
    const isPlaceholder = date.getTime() === new Date(0, 0, date.getDay()).getTime();
    const isSunday = getDay(date) === 0;

    let bgColorClass = "";
    let textColorClass = "";

    if (isPlaceholder) {
      bgColorClass = "bg-transparent";
      textColorClass = "text-transparent";
    } else if (isDisabled || isSunday) {
      bgColorClass = "bg-muted/20";
      textColorClass = "text-muted-foreground";
    } else {
      if (count <= 3) bgColorClass = "bg-red-200 dark:bg-red-800/50";
      else if (count >= 4) bgColorClass = "bg-green-200 dark:bg-green-800/50";
    }

    const handleClick = () => {
      if (!isDisabled && !isPlaceholder && !isSunday) {
        router.push(`/staff/attendance/${dayStr}`);
      }
    }

    return (
        <div 
            onClick={handleClick} 
            className={cn(
              "border rounded-lg p-2 h-32 flex flex-col justify-between relative",
              isToday(date) && "bg-primary/10",
              isDisabled && !isSunday && !isPlaceholder && "bg-muted/40 text-muted-foreground cursor-not-allowed",
              isSunday && !isPlaceholder && "bg-muted/20 text-muted-foreground cursor-not-allowed",
              !isDisabled && !isPlaceholder && !isSunday && "cursor-pointer hover:bg-muted/50",
              bgColorClass, textColorClass
            )}
        >
          <div className="flex justify-between items-start">
            <div className="font-semibold">{!isPlaceholder ? dayOfMonth : ""}</div>
          </div>
          {count > 0 && !isDisabled && !isPlaceholder && !isSunday && <div className="text-xs font-bold text-center">{count} Therapists</div>}
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
                 <div className="flex flex-wrap justify-center space-x-4 mt-4 text-sm">
                    <div className="flex items-center gap-2"><Badge className="bg-red-200 h-4 w-4 p-0" /> &le;3 Therapists</div>
                    <div className="flex items-center gap-2"><Badge className="bg-green-200 h-4 w-4 p-0" /> 4+ Therapists</div>
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline">{format(currentMonth, 'MMMM yyyy')}</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => (
            <div key={day} className="text-center font-semibold text-muted-foreground">{day}</div>
          ))}
          {calendarDays.map((day, index) => (
            <DayCell key={index} date={day} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
