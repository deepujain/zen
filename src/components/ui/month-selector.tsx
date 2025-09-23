"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { format, addMonths, subMonths } from "date-fns";

interface MonthSelectorProps {
  currentDate: Date;
  startDate: Date;
  onMonthChange: (date: Date) => void;
  className?: string;
}

export function MonthSelector({
  currentDate,
  startDate,
  onMonthChange,
  className = "",
}: MonthSelectorProps) {
  const handlePreviousMonth = () => {
    const newDate = subMonths(currentDate, 1);
    if (newDate >= startDate) {
      onMonthChange(newDate);
    }
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentDate, 1));
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="icon"
        onClick={handlePreviousMonth}
        disabled={currentDate <= startDate}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="min-w-[120px] text-center font-medium">
        {format(currentDate, "MMMM yyyy")}
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={handleNextMonth}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
