"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CrCountdownProps {
  mtdSales: number;
  mtdExpenses: number;
  daysInCurrentPeriod: number;
}

const ONE_CR = 10000000; // ₹1,00,00,000

function calculateTimeToOneCr(dailyProfit: number): { years: number; months: number; days: number } | null {
  if (dailyProfit <= 0) return null;

  const daysToTarget = Math.ceil(ONE_CR / dailyProfit);
  const years = Math.floor(daysToTarget / 365);
  const remainingDays = daysToTarget % 365;
  const months = Math.floor(remainingDays / 30);
  const days = remainingDays % 30;

  return { years, months, days };
}

function calculateProgressPercentage(dailyProfit: number): number {
  // Consider ₹3,00,000/day as 100% (would reach 1 Cr in ~33 days)
  const TARGET_DAILY_PROFIT = 300000;
  return Math.min(100, Math.max(0, (dailyProfit / TARGET_DAILY_PROFIT) * 100));
}

export function CrCountdown({ mtdSales, mtdExpenses, daysInCurrentPeriod }: CrCountdownProps) {
  const mtdProfit = mtdSales - mtdExpenses;
  const avgDailyProfit = mtdProfit / daysInCurrentPeriod;
  const timeToOneCr = calculateTimeToOneCr(avgDailyProfit);
  const progressPercentage = calculateProgressPercentage(avgDailyProfit);

  // Calculate the circle's properties
  const size = 200; // Increased size for better visibility
  const strokeWidth = 16; // Thicker stroke
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;
  const center = size / 2;

  // Format the time string
  const timeString = timeToOneCr
    ? `${timeToOneCr.years > 0 ? `${timeToOneCr.years}y ` : ''}${timeToOneCr.months > 0 ? `${timeToOneCr.months}m ` : ''}${timeToOneCr.days}d`
    : '--';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center">
          <div className="relative w-[200px] h-[200px]">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <svg
                    width={size}
                    height={size}
                    style={{ transform: 'rotate(-90deg)' }}
                    className="cursor-help"
                  >
                    {/* Background circle */}
                    <circle
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="none"
                      stroke="#f1f5f9"
                      strokeWidth={strokeWidth}
                      className="dark:stroke-slate-800"
                    />
                    
                    {/* Progress circle */}
                    <circle
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-500 ease-in-out dark:stroke-green-500"
                    />
                  </svg>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center space-y-2 p-2">
                    <p className="font-medium text-slate-600 dark:text-slate-300">Daily Average Profit</p>
                    <p className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                      ₹{Math.round(avgDailyProfit).toLocaleString("en-IN")}/day
                    </p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>MTD Profit: ₹{mtdProfit.toLocaleString("en-IN")}</p>
                      <p>Time to 1Cr: ~{timeString}</p>
                      <p className="text-xs">
                        {progressPercentage.toFixed(1)}% of optimal rate (₹3L/day)
                      </p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <h3 className="text-sm font-medium mb-1">1 Cr Profit Countdown</h3>
              {timeToOneCr ? (
                <>
                  <p className="text-2xl font-bold tracking-tight mb-1" style={{ fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                    {timeString}
                  </p>
                  <p className="text-xs text-muted-foreground" style={{ fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                    ₹{Math.round(avgDailyProfit).toLocaleString("en-IN")}/day
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-red-500">--</p>
                  <p className="text-xs text-muted-foreground">
                    Insufficient profit data
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}