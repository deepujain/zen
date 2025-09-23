"use client";

import * as React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ExpenseForm } from "./expense-form";
import { IndianRupee, PlusCircle, Pencil, Save, X, Trash2, Download } from "lucide-react";
import { cn } from "@/lib/utils";

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
  expenses?: Expense[];
  onAddExpense: (expense: any) => void;
  onUpdateExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  selectedDate: Date;
}

interface EditingExpense extends Expense {
  isEditing?: boolean;
}

export function ExpensesTable({
  expenses = [],
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  selectedDate,
}: ExpensesTableProps) {
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [editingExpenses, setEditingExpenses] = React.useState<Record<string, EditingExpense>>({});

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

  // Group expenses by date
  const groupedExpenses = monthlyExpenses.reduce((groups, expense) => {
    const date = expense.date.split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => b.localeCompare(a));

  const handleEdit = (expense: Expense) => {
    setEditingExpenses({
      ...editingExpenses,
      [expense.id]: { ...expense, isEditing: true }
    });
  };

  const handleSave = async (expense: Expense) => {
    await onUpdateExpense(expense);
    setEditingExpenses({
      ...editingExpenses,
      [expense.id]: { ...expense, isEditing: false }
    });
  };

  const handleCancel = (id: string) => {
    const { [id]: _, ...rest } = editingExpenses;
    setEditingExpenses(rest);
  };

  const handleDelete = async (id: string) => {
    await onDeleteExpense(id);
    const { [id]: _, ...rest } = editingExpenses;
    setEditingExpenses(rest);
    setSelectedRows(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleDateSelect = (date: string, isSelected: boolean) => {
    const dateExpenses = groupedExpenses[date] || [];
    const expenseIds = dateExpenses.map(e => e.id);
    
    setSelectedRows(prev => {
      const next = new Set(prev);
      expenseIds.forEach(id => {
        if (isSelected) {
          next.add(id);
        } else {
          next.delete(id);
        }
      });
      return next;
    });
  };


  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-2xl font-bold">Expenses</CardTitle>
        <div className="flex items-center gap-2">
          <ExpenseForm
            onSubmit={onAddExpense}
            trigger={
              <Button size="lg" className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                Add Expense
              </Button>
            }
          />
          <Button
            size="lg"
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              // Create CSV content
              const headers = ["Date", "Category", "Description", "Amount"];
              const rows = monthlyExpenses.map(expense => [
                format(new Date(expense.date), "yyyy-MM-dd"),
                expense.category,
                expense.description,
                expense.amount.toString()
              ]);
              
              const csvContent = [
                headers.join(","),
                ...rows.map(row => row.join(","))
              ].join("\n");

              // Create and trigger download
              const blob = new Blob([csvContent], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `expenses-${format(selectedDate, "yyyy-MM")}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-5 w-5" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDates.map(date => {
              const dateExpenses = groupedExpenses[date];
              const allSelected = dateExpenses.every(e => selectedRows.has(e.id));
              const someSelected = dateExpenses.some(e => selectedRows.has(e.id));
              
              return (
                <React.Fragment key={date}>
                  <TableRow className="bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected && !allSelected}
                        onCheckedChange={(checked) => handleDateSelect(date, !!checked)}
                      />
                    </TableCell>
                    <TableCell colSpan={4} className="font-medium">
                      {format(new Date(date), "EEEE, MMMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                  {dateExpenses.map((expense) => {
                    const isEditing = editingExpenses[expense.id]?.isEditing;
                    const editingExpense = editingExpenses[expense.id] || expense;

                    return (
                      <TableRow key={expense.id} className={cn(selectedRows.has(expense.id) && "bg-muted/30")}>
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.has(expense.id)}
                            onCheckedChange={(checked) => {
                              setSelectedRows(prev => {
                                const next = new Set(prev);
                                if (checked) {
                                  next.add(expense.id);
                                } else {
                                  next.delete(expense.id);
                                }
                                return next;
                              });
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Select
                              value={editingExpense.category}
                              onValueChange={(value) => {
                                setEditingExpenses({
                                  ...editingExpenses,
                                  [expense.id]: { ...editingExpense, category: value }
                                });
                              }}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(categoryIcons).map(([category]) => (
                                  <SelectItem key={category} value={category}>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xl">{categoryIcons[category]}</span>
                                      <span>{category}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xl" role="img" aria-label={expense.category}>
                                {categoryIcons[expense.category] || '📝'}
                              </span>
                              <span>{expense.category}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editingExpense.description}
                              onChange={(e) => {
                                setEditingExpenses({
                                  ...editingExpenses,
                                  [expense.id]: { ...editingExpense, description: e.target.value }
                                });
                              }}
                            />
                          ) : (
                            expense.description
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <div className="relative">
                              <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                className="pl-8 text-right"
                                value={editingExpense.amount}
                                onChange={(e) => {
                                  setEditingExpenses({
                                    ...editingExpenses,
                                    [expense.id]: { ...editingExpense, amount: Number(e.target.value) }
                                  });
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <IndianRupee className="h-4 w-4" />
                              {expense.amount.toLocaleString("en-IN")}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {isEditing ? (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleSave(editingExpense)}
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleCancel(expense.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleEdit(expense)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDelete(expense.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </React.Fragment>
              );
            })}
            {monthlyExpenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  <p className="text-lg">No expenses for {format(selectedDate, "MMMM yyyy")}</p>
                  <p className="text-sm mt-1">Click "Add Expense" to record a new expense</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}