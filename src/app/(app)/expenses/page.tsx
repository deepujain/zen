"use client";

import * as React from "react";
import { format } from "date-fns";
import { useData } from "@/hooks/use-api-data";
import { MonthSelector } from "@/components/ui/month-selector";
import { ExpensesTable } from "@/components/expenses/expenses-table";

export default function ExpensesPage() {
  const startDate = new Date(2025, 8, 1); // September 2025
  const [selectedDate, setSelectedDate] = React.useState(startDate);
  const [expenses, setExpenses] = React.useState<any[]>([]);

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
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const handleAddExpense = async (expenseData: any) => {
    try {
      // Format the date as YYYY-MM-DD for database compatibility
      const date = new Date(expenseData.date);
      const formattedDate = format(date, "yyyy-MM-dd"); // e.g., "2025-09-23"

      const newExpense = {
        id: crypto.randomUUID(),
        description: expenseData.description,
        category: expenseData.category,
        amount: Number(expenseData.amount),
        date: formattedDate,
      };
      
      console.log('Adding expense:', newExpense); // Debug log
      
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <MonthSelector
          currentDate={selectedDate}
          startDate={startDate}
          onMonthChange={setSelectedDate}
        />
      </div>

      <ExpensesTable
        expenses={expenses}
        onAddExpense={handleAddExpense}
        selectedDate={selectedDate}
      />
    </div>
  );
}