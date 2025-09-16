
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, IndianRupee } from "lucide-react";
import { useData } from "@/hooks/use-api-data";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, eachDayOfInterval, startOfToday } from 'date-fns';

type ExpenseCategory = 'Supplies' | 'Salary' | 'Utilities' | 'Rent' | 'Other';

const categoryIcons: Record<ExpenseCategory, string> = {
  Supplies: '🛒',
  Salary: '💰',
  Utilities: '💡',
  Rent: '🏠',
  Other: '📦',
};

export default function ExpensesPage() {
  const { expenses } = useData();
  const today = startOfToday();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  
  const monthExpenses = expenses.filter(e => isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd }));
  const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd }).length;
  const avgDaily = totalExpenses / daysInMonth;

  const expensesByCategory = monthExpenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  const recentExpenses = monthExpenses.slice(0, 5).sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-headline">{format(today, 'MMMM yyyy')}</h1>
         <Button className="fixed bottom-24 right-4 md:static md:bottom-auto md:right-auto z-20 shadow-lg md:shadow-none rounded-full md:rounded-md w-14 h-14 md:w-auto md:h-auto" disabled>
            <PlusCircle className="h-6 w-6 md:mr-2" />
            <span className="hidden md:inline">Add Expense</span>
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold flex items-center"><IndianRupee className="w-6 h-6 mr-1"/>{totalExpenses.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg. Daily</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold flex items-center"><IndianRupee className="w-6 h-6 mr-1"/>{avgDaily.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>By Category</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {Object.entries(expensesByCategory).map(([category, amount]) => (
            <Card key={category} className="p-4">
              <div className="flex items-center gap-4">
                  <div className="text-3xl">{categoryIcons[category as ExpenseCategory]}</div>
                  <div>
                    <p className="text-sm capitalize text-muted-foreground">{category.toLowerCase()}</p>
                    <p className="font-bold text-lg flex items-center"><IndianRupee className="w-4 h-4 mr-1"/>{amount.toLocaleString('en-IN')}</p>
                  </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {recentExpenses.map(expense => (
              <li key={expense.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl p-3 bg-muted rounded-full">
                    {categoryIcons[expense.category]}
                  </div>
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-muted-foreground capitalize">{format(parseISO(expense.date), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <p className="font-semibold text-right flex items-center"><IndianRupee className="w-4 h-4 mr-1"/>{expense.amount.toLocaleString('en-IN')}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
