"use client";

import * as React from "react";
import { format } from "date-fns";
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
  
  // Get unique days with expenses
  const uniqueDays = new Set(monthlyExpenses.map(e => e.date.split('T')[0])).size;
  const avgDailyExpense = uniqueDays > 0 ? totalExpenses / uniqueDays : 0;

  // Group by category
  const categoryTotals = monthlyExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center">
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
          <CardTitle className="text-sm font-medium">Average Daily Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center">
            <IndianRupee className="h-5 w-5 mr-1" />
            {avgDailyExpense.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-muted-foreground">
            Across {uniqueDays} days with expenses
          </p>
        </CardContent>
      </Card>


      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg mr-2" role="img" aria-label={category}>
                    {categoryIcons[category]}
                  </span>
                  <span className="text-sm font-medium">{category}</span>
                </div>
                <div className="flex items-center text-sm">
                  <IndianRupee className="h-3 w-3 mr-1" />
                  {amount.toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          {Object.keys(categoryTotals).length > 3 && (
            <div className="text-xs text-muted-foreground text-right">
              +{Object.keys(categoryTotals).length - 3} more categories
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
