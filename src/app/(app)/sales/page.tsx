
"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, IndianRupee, FileDown, Calendar as CalendarIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from '@/hooks/use-api-data';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, differenceInMinutes, eachDayOfInterval } from 'date-fns';
import { SalesBarChart } from '@/components/ui/sales-bar-chart';
import { SalesPieChart } from '@/components/ui/sales-pie-chart'; // New import
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import SaleForm from '@/components/sales/sale-form';
import type { Sale } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


export default function SalesPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAddSaleSheetOpen, setIsAddSaleSheetOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [scrollToSaleId, setScrollToSaleId] = useState<string | null>(null); // New state for scrolling
  const { sales, therapies, staff, rooms } = useData();
  
  const today = new Date();

  type SortKey = keyof Sale | 'therapist' | 'room' | 'schedule' | 'date';
  type SortDirection = 'ascending' | 'descending';

  interface SortConfig {
    key: SortKey;
    direction: SortDirection;
  }

  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'date', direction: 'descending' });

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Calculate available months from sales data
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    // Start with September 2025 as the default earliest month if no sales yet
    months.add(format(new Date(2025, 8, 1), 'yyyy-MM')); // September is month 8 in JS Date (0-indexed)

    sales.forEach(sale => {
      months.add(format(parseISO(sale.date), 'yyyy-MM'));
    });

    // Sort months in descending order (latest first)
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [sales]);

  const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0]);

  const { salesForSelectedMonth, dailySalesForSelectedMonth } = useMemo(() => {
    const monthStart = parseISO(`${selectedMonth}-01`);
    const monthEnd = endOfMonth(monthStart);

    const salesForSelectedMonth = sales.filter(s => 
      isWithinInterval(parseISO(s.date), { start: monthStart, end: monthEnd })
    );

    // Generate data for every day of the selected month up to today
    const allDaysInInterval = eachDayOfInterval({ start: monthStart, end: monthEnd }); // Changed 'today' to 'monthEnd'
    
    const dailySalesForSelectedMonth = allDaysInInterval.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const daysSales = salesForSelectedMonth.filter(s => s.date === dateStr);
      const totalAmount = daysSales.reduce((sum, sale) => sum + sale.amount, 0);
      return {
        name: format(date, 'd'), // X-axis label as day of month (1, 2, 3...)
        total: totalAmount > 0 ? totalAmount : null, // Set to null if 0 for no bar
      };
    });

    return { salesForSelectedMonth, dailySalesForSelectedMonth };
  }, [sales, selectedMonth, today]);

  // Calculate Max, Min, and Average for Daily Sales Trend
  const { maxDailySales, minDailySales, avgDailySales } = useMemo(() => {
    const validSales = dailySalesForSelectedMonth.filter(item => item.total !== null && item.total > 0).map(item => item.total as number);
    
    if (validSales.length === 0) {
      return { maxDailySales: 0, minDailySales: 0, avgDailySales: 0 };
    }

    const max = Math.max(...validSales);
    const min = Math.min(...validSales);
    const sum = validSales.reduce((acc, curr) => acc + curr, 0);
    const avg = sum / validSales.length;

    return { maxDailySales: max, minDailySales: min, avgDailySales: avg };
  }, [dailySalesForSelectedMonth]);
  
  const currentSales = salesForSelectedMonth;

  const totalSalesForPeriod = useMemo(() => {
    return currentSales.reduce((acc, sale) => acc + sale.amount, 0);
  }, [currentSales]);

  // Calculate Total Therapies
  const totalTherapies = useMemo(() => {
    // Changed to count total sales records, not unique therapies
    return currentSales.length;
  }, [currentSales]);
  
  const salesByTherapist = useMemo(() => {
    return currentSales.reduce((acc, sale) => {
      const therapist = staff.find(s => s.id === sale.therapistId);
      if (therapist) {
        acc[therapist.fullName] = (acc[therapist.fullName] || 0) + sale.amount;
      }
      return acc;
    }, {} as Record<string, number>);
  }, [currentSales, staff]);

  const top6Therapists = useMemo(() => {
    return Object.entries(salesByTherapist)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, total]) => ({ name, total }));
  }, [salesByTherapist]);

  const salesByTherapy = useMemo(() => {
    return currentSales.reduce((acc, sale) => {
      acc[sale.therapyType] = (acc[sale.therapyType] || 0) + sale.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [currentSales]);

  const top6Therapies = useMemo(() => {
    return Object.entries(salesByTherapy)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, total]) => ({ name, total }));
  }, [salesByTherapy]);

  const salesByPaymentMethod = useMemo(() => {
    return currentSales.reduce((acc, sale) => {
      acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.amount;
      return acc;
    }, {} as Record<Sale['paymentMethod'], number>);
  }, [currentSales]);


  const top3PaymentMethods = useMemo(() => {
     return Object.entries(salesByPaymentMethod)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, total]) => ({ name, total }));
  }, [salesByPaymentMethod]);

  const sortedSales = useMemo(() => {
    let sortableItems = [...currentSales];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === 'therapist') {
          aValue = staff.find(s => s.id === a.therapistId)?.fullName || '';
          bValue = staff.find(s => s.id === b.therapistId)?.fullName || '';
        } else if (sortConfig.key === 'room') {
          aValue = rooms.find(r => r.id === a.roomId)?.name || '';
          bValue = rooms.find(r => r.id === b.roomId)?.name || '';
        } else if (sortConfig.key === 'schedule') {
          aValue = parseISO(a.startTime).getTime();
          bValue = parseISO(b.startTime).getTime();
        } else if (sortConfig.key === 'date') {
          aValue = parseISO(a.date).getTime();
          bValue = parseISO(b.date).getTime();
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [currentSales, sortConfig, staff, rooms]);

  const handleExport = () => {
    const dataToExport = currentSales;
    const headers = "Sl No,Customer,Customer Phone Number,Payment Mode,Amount,Therapist,Room,CheckIn:Checkout,Therapy\n";
    
    const csvRows = dataToExport.map((sale, index) => {
      const therapist = staff.find(s => s.id === sale.therapistId);
      const room = rooms.find(r => r.id === sale.roomId);
      const schedule = `${format(parseISO(sale.startTime), 'h:mm a')} - ${format(parseISO(sale.endTime), 'h:mm a')}`;

      const row = [
        index + 1,
        `"${sale.customerName}"`,
        `"${sale.customerPhone}"`,
        `"${sale.paymentMethod}"`,
        sale.amount,
        `"${therapist?.fullName || ''}"`,
        `"${room?.name || ''}"`,
        `"${schedule}"`,
        `"${sale.therapyType}"`
      ];
      return row.join(',');
    });

    const csvContent = headers + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `sales_${selectedMonth}_${format(new Date(), 'yyyyMMdd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setScrollToSaleId(sale.id); // Set the ID to scroll to
    setIsSheetOpen(true);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setEditingSale(null); // Clear editing sale when sheet closes
      setScrollToSaleId(null); // Clear scroll target
    }
  };

  const onSaleSaved = (saleId: string) => {
    setScrollToSaleId(saleId);
  };

  useEffect(() => {
    if (scrollToSaleId) {
      const element = document.getElementById(`sale-row-${scrollToSaleId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setScrollToSaleId(null); // Clear the scroll target after scrolling
    }
  }, [scrollToSaleId]);

  const renderSalesList = (salesList: Sale[]) => {
    if (salesList.length === 0) {
      return <p className="text-muted-foreground text-center py-8">No sales records for this period.</p>;
    }
    
    const salesToRender = salesList;

    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sl No</TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort('date')}>
                  <div className="flex items-center">
                    Sales Date {sortConfig?.key === 'date' && (sortConfig.direction === 'ascending' ? <ArrowDown className="ml-1 h-3 w-3" /> : <ArrowUp className="ml-1 h-3 w-3" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort('customerName')}>
                  <div className="flex items-center">
                    Customer {sortConfig?.key === 'customerName' && (sortConfig.direction === 'ascending' ? <ArrowDown className="ml-1 h-3 w-3" /> : <ArrowUp className="ml-1 h-3 w-3" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort('customerPhone')}>
                  <div className="flex items-center">
                    Customer Phone Number {sortConfig?.key === 'customerPhone' && (sortConfig.direction === 'ascending' ? <ArrowDown className="ml-1 h-3 w-3" /> : <ArrowUp className="ml-1 h-3 w-3" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort('paymentMethod')}>
                  <div className="flex items-center">
                    Payment Mode {sortConfig?.key === 'paymentMethod' && (sortConfig.direction === 'ascending' ? <ArrowDown className="ml-1 h-3 w-3" /> : <ArrowUp className="ml-1 h-3 w-3" />)}
                  </div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => requestSort('amount')}>
                  <div className="flex items-center justify-end">
                    Amount {sortConfig?.key === 'amount' && (sortConfig.direction === 'ascending' ? <ArrowDown className="ml-1 h-3 w-3" /> : <ArrowUp className="ml-1 h-3 w-3" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort('therapist')}>
                  <div className="flex items-center">
                    Therapist {sortConfig?.key === 'therapist' && (sortConfig.direction === 'ascending' ? <ArrowDown className="ml-1 h-3 w-3" /> : <ArrowUp className="ml-1 h-3 w-3" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort('room')}>
                  <div className="flex items-center">
                    Room {sortConfig?.key === 'room' && (sortConfig.direction === 'ascending' ? <ArrowDown className="ml-1 h-3 w-3" /> : <ArrowUp className="ml-1 h-3 w-3" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort('schedule')}>
                  <div className="flex items-center">
                    CheckIn:Checkout {sortConfig?.key === 'schedule' && (sortConfig.direction === 'ascending' ? <ArrowDown className="ml-1 h-3 w-3" /> : <ArrowUp className="ml-1 h-3 w-3" />)}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort('therapyType')}>
                  <div className="flex items-center">
                    Therapy {sortConfig?.key === 'therapyType' && (sortConfig.direction === 'ascending' ? <ArrowDown className="ml-1 h-3 w-3" /> : <ArrowUp className="ml-1 h-3 w-3" />)}
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesToRender.map((sale, index) => {
                const therapist = staff.find(s => s.id === sale.therapistId);
                const room = rooms.find(r => r.id === sale.roomId);
                const schedule = `${format(parseISO(sale.startTime), 'h:mm a')} - ${format(parseISO(sale.endTime), 'h:mm a')}`;

                // Helper to keep track of the previous date for visual separation
                const isNewDay = index === 0 || format(parseISO(sale.date), 'yyyy-MM-dd') !== format(parseISO(salesToRender[index - 1].date), 'yyyy-MM-dd');

                return (
                  <React.Fragment key={sale.id}>
                    {isNewDay && (
                      <TableRow className="bg-accent/20 hover:bg-accent/20">
                        <TableCell colSpan={11} className="py-2 text-center text-sm font-semibold text-muted-foreground">
                          {format(parseISO(sale.date), 'EEEE, MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow key={sale.id} id={`sale-row-${sale.id}`}>
                      <TableCell>{index + 1}</TableCell><TableCell>{format(parseISO(sale.date), 'MMM d, yyyy')}</TableCell><TableCell>{sale.customerName}</TableCell><TableCell>{sale.customerPhone}</TableCell><TableCell>{sale.paymentMethod}</TableCell><TableCell className="text-right flex items-center justify-end"><IndianRupee className="w-4 h-4 mr-1" />{sale.amount.toLocaleString('en-IN')}</TableCell><TableCell>{therapist?.fullName}</TableCell><TableCell>{room?.name}</TableCell><TableCell>{schedule}</TableCell><TableCell>{sale.therapyType}</TableCell><TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSale(sale)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <div className="relative space-y-6">
      <div className="flex items-center justify-end mb-4 gap-2"> {/* Aligned to right with gap */}
        <Sheet open={isAddSaleSheetOpen} onOpenChange={setIsAddSaleSheetOpen}>
          <SheetTrigger asChild>
            <Button className="flex items-center gap-2"> <PlusCircle className="h-4 w-4" /> Add Sale</Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[480px] w-full pr-0">
            <SheetHeader>
              <SheetTitle>Add New Sale</SheetTitle>
              <SheetDescription>Fill in the details to record a new sale.</SheetDescription>
            </SheetHeader>
            <SaleForm setOpen={setIsAddSaleSheetOpen} onSaleSaved={onSaleSaved} />
          </SheetContent>
        </Sheet>
        <Select onValueChange={(value) => setSelectedMonth(value)} value={selectedMonth}>
          <SelectTrigger className="w-[180px]">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {availableMonths.map(month => (
              <SelectItem key={month} value={month}>{format(parseISO(month + '-01'), 'MMM yyyy')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Edit Sale Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingSale ? "Edit Sale Record" : "Add Sale Record"}</SheetTitle>
          </SheetHeader>
          <SaleForm setOpen={handleSheetOpenChange} initialData={editingSale} onSaleSaved={onSaleSaved} />
        </SheetContent>
      </Sheet>

      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2"> {/* New grid for Total Sales and Total Therapies */}
          <Card>
            <CardHeader>
              <CardTitle>Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold flex items-center">
                <IndianRupee className="w-7 h-7 mr-1" />
                {totalSalesForPeriod.toLocaleString('en-IN')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Therapies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold flex items-center">
                {totalTherapies}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"> {/* Adjusted grid columns to 6 */}
          <Card className="lg:col-span-1 xl:col-span-2"> {/* Therapist takes 2/6ths (1/3rd) space */}
            <CardHeader>
              <CardTitle>Sales by Therapist</CardTitle>
              <CardDescription>Total sales for the top therapists in this period.</CardDescription>
            </CardHeader>
            <CardContent>
              {top6Therapists.length > 0 ? (
                <SalesBarChart data={top6Therapists} type="therapist" />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No sales data for this period.</p>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-1 xl:col-span-2"> {/* Payment Method takes 2/6ths (1/3rd) space */}
            <CardHeader>
              <CardTitle>Sales by Payment Method</CardTitle>
              <CardDescription>Total sales for top payment methods in this period.</CardDescription>
            </CardHeader>
            <CardContent>
              {top3PaymentMethods.length > 0 ? (
                <SalesPieChart data={top3PaymentMethods} />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No sales data for this period.</p>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-1 xl:col-span-2"> {/* Therapy takes 2/6ths (1/3rd) space */}
            <CardHeader>
              <CardTitle>Sales by Therapy</CardTitle>
              <CardDescription>Total sales for the top therapies in this period.</CardDescription>
            </CardHeader>
            <CardContent>
              {top6Therapies.length > 0 ? (
                <SalesBarChart data={top6Therapies} type="therapy" />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No sales data for this period.</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Daily Sales Trend Card - Moved here */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Sales Trend</CardTitle>
            <CardDescription>Daily sales totals for the current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
              <div className="w-full lg:w-11/12">
                <SalesBarChart data={dailySalesForSelectedMonth} type="daily" />
              </div>
              {dailySalesForSelectedMonth.length > 0 && (
                <div className="w-full lg:w-1/12 mt-4 lg:mt-0 text-sm text-muted-foreground flex lg:flex-col justify-center lg:justify-start items-center lg:items-end gap-2 px-0">
                  <span style={{ fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif' }}>Max: ₹{maxDailySales.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  <span style={{ fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif' }}>Min: ₹{minDailySales.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  <span style={{ fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif' }}>Avg: ₹{avgDailySales.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Sales</CardTitle>
            </div>
             <Button variant="outline" onClick={handleExport} disabled={currentSales.length === 0}>
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            {renderSalesList(sortedSales)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
