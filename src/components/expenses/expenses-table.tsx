"use client";

import * as React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExpenseForm } from "./expense-form";
import { IndianRupee, PlusCircle } from "lucide-react";

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

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

interface ExpensesTableProps {
  expenses: Expense[];
  onAddExpense: (expense: any) => void;
  selectedDate: Date;
}

export function ExpensesTable({
  expenses,
  onAddExpense,
  selectedDate,
}: ExpensesTableProps) {
  // Debug logs
  console.log('All expenses:', expenses);
  console.log('Selected date:', format(selectedDate, "yyyy-MM-dd"));
  
  // Filter expenses for the selected month
  const monthlyExpenses = expenses.filter((expense) => {
    const expenseDate = expense.date.split('T')[0];
    const [expenseYear, expenseMonth] = expenseDate.split('-');
    const selectedYear = format(selectedDate, "yyyy");
    const selectedMonth = format(selectedDate, "MM");
    
    return expenseYear === selectedYear && expenseMonth === selectedMonth;
  });

  const totalAmount = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-2xl font-bold">Expenses</CardTitle>
        <ExpenseForm
          onSubmit={onAddExpense}
          trigger={
            <Button size="lg" className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Add Expense
            </Button>
          }
        />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthlyExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-medium">
                  {format(new Date(expense.date), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-xl" role="img" aria-label={expense.category}>
                      {categoryIcons[expense.category] || '📝'}
                    </span>
                    <span>{expense.category}</span>
                  </div>
                </TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell className="text-right font-medium">
                  <div className="flex items-center justify-end gap-1">
                    <IndianRupee className="h-4 w-4" />
                    {expense.amount.toLocaleString("en-IN")}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {monthlyExpenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  <p className="text-lg">No expenses for {format(selectedDate, "MMMM yyyy")}</p>
                  <p className="text-sm mt-1">Click "Add Expense" to record a new expense</p>
                </TableCell>
              </TableRow>
            )}
            <TableRow className="border-t-2">
              <TableCell colSpan={3} className="font-bold text-lg">
                Total
              </TableCell>
              <TableCell className="text-right font-bold text-lg">
                <div className="flex items-center justify-end gap-1">
                  <IndianRupee className="h-5 w-5" />
                  {totalAmount.toLocaleString("en-IN")}
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
