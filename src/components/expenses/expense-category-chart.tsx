"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IndianRupee, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface ExpenseCategoryChartProps {
  categoryTotals: Record<string, number>;
}

type CategoryData = {
  category: string;
  amount: number;
  percentage: number;
};

export function ExpenseCategoryChart({ categoryTotals }: ExpenseCategoryChartProps) {
  const [sorting, setSorting] = React.useState<{ column: keyof CategoryData; direction: 'asc' | 'desc' }>({
    column: 'amount',
    direction: 'desc'
  });

  const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

  const categoryData: CategoryData[] = Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    amount,
    percentage: total > 0 ? (amount / total) * 100 : 0
  }));

  const sortedData = React.useMemo(() => {
    return [...categoryData].sort((a, b) => {
      const multiplier = sorting.direction === 'asc' ? 1 : -1;
      if (sorting.column === 'category') {
        return multiplier * a.category.localeCompare(b.category);
      }
      return multiplier * (a[sorting.column] - b[sorting.column]);
    });
  }, [categoryData, sorting]);

  const handleSort = (column: keyof CategoryData) => {
    setSorting(current => ({
      column,
      direction: current.column === column && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  return (
    <Card className="h-[600px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {total > 0 ? (
          <div className="h-[520px] overflow-auto custom-scrollbar">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('category')}
                      className="flex items-center"
                    >
                      Category
                      {sorting.column === 'category' && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('amount')}
                      className="flex items-center justify-end w-full"
                    >
                      Amount
                      {sorting.column === 'amount' && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('percentage')}
                      className="flex items-center justify-end w-full"
                    >
                      Percentage
                      {sorting.column === 'percentage' && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map(({ category, amount, percentage }) => (
                  <TableRow key={category}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl" role="img" aria-label={category}>
                          {categoryIcons[category]}
                        </span>
                        <span>{category}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <IndianRupee className="h-4 w-4" />
                        {amount.toLocaleString("en-IN")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {percentage.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="h-[520px] flex items-center justify-center text-muted-foreground">
            No expenses to display
          </div>
        )}
      </CardContent>
    </Card>
  );
}