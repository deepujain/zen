"use client";

import * as React from "react";
import { format, getDaysInMonth, isSameMonth, isSameYear, isWithinInterval, startOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee } from "lucide-react";

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

interface ExpenseAnalyticsProps {
  expenses?: Expense[];
  selectedDate: Date;
}

const categoryIcons: Record<string, string> = {
  Supplies: '🛒',
  Rent: '🏠',
  Salary: '💰',
  Housekeeping: '🧹',
  Security: '👮',
  Refreshments: '🥤',
  Water: '💧',
  Snacks: '🍪',
  Marketing: '📢',
  'Phone Recharge': '📱',
  Diesel: '⛽',
  Other: '📝',
};

export function ExpenseAnalytics({ expenses = [], selectedDate }: ExpenseAnalyticsProps) {
  // Ensure expenses is an array
  const expensesArray = Array.isArray(expenses) ? expenses : [];
  
  // Filter expenses for the selected month
  const monthlyExpenses = expensesArray.filter((expense) => {
    const expenseDate = expense.date.split('T')[0];
    const [expenseYear, expenseMonth] = expenseDate.split('-');
    const selectedYear = format(selectedDate, "yyyy");
    const selectedMonth = format(selectedDate, "MM");
    return expenseYear === selectedYear && expenseMonth === selectedMonth;
  });

  // Calculate analytics
  const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Calculate days in month up to today
  const monthStart = startOfMonth(selectedDate);
  const today = new Date();
  const daysInMonth = isSameMonth(selectedDate, today) && isSameYear(selectedDate, today)
    ? today.getDate() // If current month, count days up to today
    : getDaysInMonth(selectedDate); // If past month, count all days
  
  const avgDailyExpense = totalExpenses / daysInMonth;

  return (
    <div className="grid gap-4 md:grid-cols-2 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center text-red-600 dark:text-red-400">
            <IndianRupee className="h-5 w-5 mr-1" />
            {totalExpenses.toLocaleString("en-IN")}
          </div>
          <p className="text-xs text-muted-foreground">
            {monthlyExpenses.length} entries in {format(selectedDate, "MMMM yyyy")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Average Daily Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center text-red-600 dark:text-red-400">
            <IndianRupee className="h-5 w-5 mr-1" />
            {avgDailyExpense.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-muted-foreground">
            Average across {daysInMonth} days month-to-date
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
