"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";

interface CrCountdownProps {
  mtdSales: number; // Actually YTD sales
  mtdExpenses: number; // Actually YTD expenses
  daysInCurrentPeriod: number; // Days in current year
}

const ONE_CR = 10000000; // ₹1,00,00,000

function calculateTimeToOneCr(dailyProfit: number): { years: number; months: number; days: number } | null {
  if (dailyProfit <= 0) {
    return null;
  }

  const daysToTarget = Math.ceil(ONE_CR / dailyProfit);
  
  const years = Math.floor(daysToTarget / 365);
  const remainingDays = daysToTarget % 365;
  const months = Math.floor(remainingDays / 30);
  const days = remainingDays % 30;

  return { years, months, days };
}

function calculateProgressPercentage(totalProfit: number): number {
  // Calculate what percentage of 1 Cr has been achieved
  return Math.min(100, Math.max(0, (totalProfit / ONE_CR) * 100));
}

export function CrCountdown({ mtdSales, mtdExpenses, daysInCurrentPeriod }: CrCountdownProps) {
  console.log('CrCountdown Props:', { mtdSales, mtdExpenses, daysInCurrentPeriod });
  
  const ytdProfit = mtdSales - mtdExpenses;
  console.log('YTD Profit:', ytdProfit);
  
  const avgDailyProfit = ytdProfit / daysInCurrentPeriod;
  console.log('Avg Daily Profit:', avgDailyProfit);
  
  const timeToOneCr = calculateTimeToOneCr(avgDailyProfit);
  console.log('Time to 1 Cr:', timeToOneCr);
  
  const currentProfit = ytdProfit; // Use YTD profit directly
  console.log('Current Profit:', currentProfit);
  
  const progressPercentage = calculateProgressPercentage(currentProfit);
  console.log('Progress Percentage:', progressPercentage);

  return (
    <Card>
      <CardContent className="pt-6">
        {timeToOneCr ? (
          <div className="flex flex-col items-center">
            <CircularProgress 
              percentage={progressPercentage}
              size={180}
              strokeWidth={12}
              currentValue={Math.round(avgDailyProfit * daysInCurrentPeriod)}
              maxValue={ONE_CR}>
              <div className="text-center">
                <h3 className="text-sm font-medium mb-2">1 Cr Profit Countdown</h3>
                <p className="text-xl font-bold" style={{ fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                  {timeToOneCr.years > 0 && `${timeToOneCr.years}yrs `}
                  {timeToOneCr.months > 0 && `${timeToOneCr.months}m `}
                  {timeToOneCr.days}d
                </p>
                <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                  ₹{Math.round(avgDailyProfit).toLocaleString("en-IN")}/day
                </p>
              </div>
            </CircularProgress>
          </div>
        ) : (
          <div className="flex flex-col items-center py-8">
            <CircularProgress 
              percentage={0}
              size={180}
              strokeWidth={12}
              currentValue={0}
              maxValue={ONE_CR}>
              <div className="text-center">
                <h3 className="text-sm font-medium mb-2">1 Cr Profit Countdown</h3>
                <p className="text-xl font-bold text-red-500">--</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Insufficient profit data
                </p>
              </div>
            </CircularProgress>
          </div>
        )}
      </CardContent>
    </Card>
  );
}