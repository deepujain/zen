"use client";

import * as React from "react";
import { format } from "date-fns";
import { useData } from "@/hooks/use-api-data";
import { MonthSelector } from "@/components/ui/month-selector";
import { ExpensesTable } from "@/components/expenses/expenses-table";
import { ExpenseAnalytics } from "@/components/expenses/expense-analytics";
import type { Expense } from "@/lib/types";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end mb-6">
        <MonthSelector
          currentDate={selectedDate}
          startDate={startDate}
          onMonthChange={setSelectedDate}
        />
      </div>

      <ExpenseAnalytics
        expenses={expenses}
        selectedDate={selectedDate}
      />

      <ExpensesTable
        expenses={expenses}
        onAddExpense={handleAddExpense}
        onUpdateExpense={handleUpdateExpense}
        onDeleteExpense={handleDeleteExpense}
        selectedDate={selectedDate}
      />
    </div>
  );
}