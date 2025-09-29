"use client";

import * as React from "react";
import { format, endOfMonth, eachDayOfInterval } from "date-fns";
import { useData } from "@/hooks/use-api-data";
import { MonthSelector } from "@/components/ui/month-selector";
import { ExpensesTable } from "@/components/expenses/expenses-table";
import { ExpenseAnalytics } from "@/components/expenses/expense-analytics";
import { ExpenseCategoryChart } from "@/components/expenses/expense-category-chart";
import type { Expense } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SalesBarChart } from "@/components/ui/sales-bar-chart";

export default function ExpensesPage() {
  const startDate = new Date(2025, 8, 1); // September 2025
  const [selectedDate, setSelectedDate] = React.useState(startDate);
  const [expenses, setExpenses] = React.useState<Expense[]>([]);

  // Fetch expenses on component mount
  React.useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      console.log('Fetching expenses...');
      const response = await fetch("/api/expenses");
      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }
      const data = await response.json();
      console.log('Fetched expenses:', data);
      console.log('Expenses type:', Array.isArray(data) ? 'array' : typeof data);
      
      // Ensure we're setting an array
      const expensesArray = Array.isArray(data) ? data : [];
      setExpenses(expensesArray);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      // Set empty array on error
      setExpenses([]);
    }
  };

  const handleAddExpense = async (expenseData: any) => {
    try {
      // Format the date as YYYY-MM-DD for database compatibility
      const date = new Date(expenseData.date);
      // Set time to midnight to avoid timezone issues
      date.setHours(0, 0, 0, 0);
      const formattedDate = format(date, "yyyy-MM-dd");

      const newExpense = {
        id: crypto.randomUUID(),
        description: expenseData.description,
        category: expenseData.category,
        amount: Number(expenseData.amount),
        date: formattedDate,
      };
      
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newExpense),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add expense");
      }

      const updatedExpenses = await response.json();
      setExpenses(updatedExpenses);
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const handleUpdateExpense = async (expense: any) => {
    try {
      const response = await fetch("/api/expenses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expense),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update expense");
      }

      const updatedExpenses = await response.json();
      setExpenses(updatedExpenses);
    } catch (error) {
      console.error("Error updating expense:", error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete expense");
      }

      const updatedExpenses = await response.json();
      setExpenses(updatedExpenses);
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  // Compute Daily Expense Trend for selected month (mirrors Daily Sales Trend)
  const selectedMonth = React.useMemo(() => format(selectedDate, 'yyyy-MM'), [selectedDate]);

  const { dailyExpensesForSelectedMonth, maxDailyExpense, minDailyExpense, avgDailyExpense } = React.useMemo(() => {
    // Build month start/end using local time to avoid timezone shifts
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = Number(yearStr);
    const monthIndex = Number(monthStr) - 1; // 0-based
    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = endOfMonth(monthStart);

    const expensesForSelectedMonth = expenses.filter(e => {
      // e.date is 'yyyy-MM-dd' — construct a local date
      const [ey, em, ed] = e.date.split('-').map(Number);
      const d = new Date(ey, em - 1, ed);
      return d >= monthStart && d <= monthEnd;
    });

    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const daily = allDays.map(d => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const total = expensesForSelectedMonth
        .filter(e => e.date === dateStr)
        .reduce((sum, e) => sum + (Number.isFinite(e.amount) ? e.amount : 0), 0);
      return {
        name: format(d, 'd'),
        total: total > 0 ? total : null,
      };
    });

    const values = daily.filter(x => x.total !== null && (x.total as number) > 0).map(x => x.total as number);
    const max = values.length ? Math.max(...values) : 0;
    const min = values.length ? Math.min(...values) : 0;
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;

    return { dailyExpensesForSelectedMonth: daily, maxDailyExpense: max, minDailyExpense: min, avgDailyExpense: avg };
  }, [expenses, selectedMonth]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end mb-6">
        <MonthSelector
          currentDate={selectedDate}
          startDate={startDate}
          onMonthChange={setSelectedDate}
        />
      </div>

      <div className="space-y-6">
        <ExpenseAnalytics
          expenses={expenses}
          selectedDate={selectedDate}
        />

        {/* Daily Expense Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Expense Trend</CardTitle>
            <CardDescription>Daily expense totals for the current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
              <div className="w-full lg:w-11/12">
                <SalesBarChart data={dailyExpensesForSelectedMonth} type="daily" selectedMonth={selectedMonth} />
              </div>
              {dailyExpensesForSelectedMonth.length > 0 && (
                <div className="w-full lg:w-1/12 mt-4 lg:mt-0 text-sm text-muted-foreground flex lg:flex-col justify-center lg:justify-start items-center lg:items-end gap-2 px-0">
                  <span style={{ fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif' }}>Max: ₹{maxDailyExpense.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  <span style={{ fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif' }}>Min: ₹{minDailyExpense.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  <span style={{ fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif' }}>Avg: ₹{avgDailyExpense.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <ExpensesTable
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
            selectedDate={selectedDate}
          />
          <ExpenseCategoryChart categoryTotals={expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
          }, {} as Record<string, number>)} />
        </div>
      </div>
    </div>
  );
}