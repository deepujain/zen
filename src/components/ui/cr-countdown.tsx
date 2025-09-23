"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer } from "lucide-react";
import { differenceInDays } from "date-fns";

interface CrCountdownProps {
  mtdSales: number;
  mtdExpenses: number;
  daysInCurrentPeriod: number;
}

function calculateTimeToOneCr(dailyProfit: number): { years: number; months: number; days: number } | null {
  if (dailyProfit <= 0) {
    return null;
  }

  const ONE_CR = 10000000; // ₹1,00,00,000
  const daysToTarget = Math.ceil(ONE_CR / dailyProfit);
  
  const years = Math.floor(daysToTarget / 365);
  const remainingDays = daysToTarget % 365;
  const months = Math.floor(remainingDays / 30);
  const days = remainingDays % 30;

  return { years, months, days };
}

export function CrCountdown({ mtdSales, mtdExpenses, daysInCurrentPeriod }: CrCountdownProps) {
  const mtdProfit = mtdSales - mtdExpenses;
  const avgDailyProfit = mtdProfit / daysInCurrentPeriod;
  const timeToOneCr = calculateTimeToOneCr(avgDailyProfit);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400">1 Cr Profit Countdown</CardTitle>
        <Timer className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      </CardHeader>
      <CardContent>
        {timeToOneCr ? (
          <>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {timeToOneCr.years > 0 && `${timeToOneCr.years}y `}
              {timeToOneCr.months > 0 && `${timeToOneCr.months}m `}
              {timeToOneCr.days}d
            </div>
            <p className="text-xs text-orange-600/75 dark:text-orange-400/75 mt-1" style={{ fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
              At current daily profit of ₹{Math.round(avgDailyProfit).toLocaleString("en-IN")}
            </p>
          </>
        ) : (
          <>
            <div className="text-2xl font-bold text-red-500">--</div>
            <p className="text-xs text-muted-foreground mt-1">
              Insufficient profit data
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
