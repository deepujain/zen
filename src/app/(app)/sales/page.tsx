
"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, IndianRupee, FileDown, Calendar as CalendarIcon, ArrowUp, ArrowDown, Target } from 'lucide-react';
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
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
import { Input } from "@/components/ui/input"; // Import Input
// Removed duplicate import for Select components

export default function SalesPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAddSaleSheetOpen, setIsAddSaleSheetOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [editedSaleData, setEditedSaleData] = useState<Partial<Sale> | null>(null);
  const [scrollToSaleId, setScrollToSaleId] = useState<string | null>(null); // New state for scrolling
  const [selectedSales, setSelectedSales] = useState<string[]>([]); // State for selected sales
  const [selectedDays, setSelectedDays] = useState<string[]>([]); // New state for selected days
  const { sales, therapies, staff, rooms, refreshData } = useData(); // Added mutate to refresh data
  
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

  const top5Therapists = useMemo(() => {
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

  const top5Therapies = useMemo(() => {
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
    const headers = "Sl No,Sales Date,Customer,Phone Number,Payment Mode,Amount,Therapist,Room,CheckIn:Checkout,Therapy\n";
    
    const csvRows = dataToExport.map((sale, index) => {
      const therapist = staff.find(s => s.id === sale.therapistId);
      const room = rooms.find(r => r.id === sale.roomId);
      const schedule = `${format(parseISO(sale.startTime), 'h:mm a')} - ${format(parseISO(sale.endTime), 'h:mm a')}`;
      const cleanedPhoneNumber = sale.customerPhone.replace(/\+91|\s/g, '').trim().slice(-10);

      const row = [
        index + 1,
        `"${format(parseISO(sale.date), 'dd MMM yyyy')}"`,
        `"${sale.customerName}"`,
        `"${cleanedPhoneNumber}"`,
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
    setEditingSaleId(sale.id); // Set the ID to scroll to
    setIsSheetOpen(true);
  };

  // New handlers for inline editing
  const handleEditClick = (sale: Sale) => {
    setEditingSaleId(sale.id);
    setEditedSaleData({ ...sale });
  };

  const handleCancelEdit = () => {
    setEditingSaleId(null);
    setEditedSaleData(null);
  };

  const handleSaveClick = async (saleId: string) => {
    if (!editedSaleData) return;

    try {
      const response = await fetch('http://localhost:9002/api/sales', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedSaleData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update sale: ${response.statusText}`);
      }
      refreshData(); // Refresh data after successful save
      setEditingSaleId(null); // Exit editing mode
      setEditedSaleData(null); // Clear edited data
    } catch (error) {
      console.error(`Error saving sale ${saleId}:`, error);
      // Optionally, show a toast notification for the error
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedSaleData(prev => ({
      ...prev,
      [name]: value,
    }));
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
    refreshData(); // Refresh data after saving a sale
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

  const handleSelectSale = (saleId: string, isSelected: boolean) => {
    setSelectedSales(prev => 
      isSelected ? [...prev, saleId] : prev.filter(id => id !== saleId)
    );
    // If a single sale is deselected, ensure its day is also deselected in `selectedDays`
    if (!isSelected) {
      const sale = sales.find(s => s.id === saleId);
      if (sale) {
        const dateStr = format(parseISO(sale.date), 'yyyy-MM-dd');
        setSelectedDays(prev => prev.filter(day => day !== dateStr));
      }
    }
  };

  const handleSelectAllSales = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedSales([]); // Now acts as clear all
      setSelectedDays([]);
    } else {
      setSelectedSales([]);
      setSelectedDays([]);
    }
  };

  const handleSelectDay = (dateStr: string, isSelected: boolean) => {
    const salesForDay = sortedSales.filter(sale => format(parseISO(sale.date), 'yyyy-MM-dd') === dateStr);
    const salesIdsForDay = salesForDay.map(sale => sale.id);

    setSelectedSales(prev => {
      if (isSelected) {
        // Add all sales IDs for the day, ensuring no duplicates
        return Array.from(new Set([...prev, ...salesIdsForDay]));
      } else {
        // Remove all sales IDs for the day
        return prev.filter(id => !salesIdsForDay.includes(id));
      }
    });

    setSelectedDays(prev => 
      isSelected ? [...prev, dateStr] : prev.filter(day => day !== dateStr)
    );
  };

  const handleDeleteSelectedSales = async () => {
    if (selectedSales.length === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedSales.length} selected sales records?`)) {
      return;
    }

    for (const saleId of selectedSales) {
      try {
        const response = await fetch(`http://localhost:9002/api/sales?id=${saleId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          console.error(`Failed to delete sale ${saleId}: ${response.statusText}`);
        }
      } catch (error) {
        console.error(`Error deleting sale ${saleId}:`, error);
      }
    }
    setSelectedSales([]); // Clear selection
    refreshData(); // Refresh data after deletion
  };

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
                <TableHead className="w-[50px]">
                  {/* Removed Select All Checkbox */}
                </TableHead>
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
                        <TableCell className="w-[50px]">
                           <Checkbox 
                            checked={selectedDays.includes(format(parseISO(sale.date), 'yyyy-MM-dd'))}
                            onCheckedChange={(checked: boolean) => handleSelectDay(format(parseISO(sale.date), 'yyyy-MM-dd'), checked)}
                          />
                        </TableCell>
                        <TableCell colSpan={11} className="py-2 text-center text-sm font-semibold text-muted-foreground">
                          {format(parseISO(sale.date), 'EEEE, MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow key={sale.id} id={`sale-row-${sale.id}`}>
                      <TableCell style={{ verticalAlign: 'middle' }} className="align-middle">
                        <Checkbox 
                          checked={selectedSales.includes(sale.id)}
                          onCheckedChange={(checked: boolean) => handleSelectSale(sale.id, checked)}
                        />
                      </TableCell>
                      <TableCell style={{ verticalAlign: 'middle' }} className="align-middle">{index + 1}</TableCell>
                      <TableCell style={{ verticalAlign: 'middle' }} className="align-middle">{format(parseISO(sale.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell style={{ verticalAlign: 'middle' }} className="align-middle">
                        {editingSaleId === sale.id ? (
                          <Input 
                            name="customerName"
                            value={editedSaleData?.customerName || ''}
                            onChange={handleChange}
                          />
                        ) : (
                          sale.customerName
                        )}
                      </TableCell>
                      <TableCell style={{ verticalAlign: 'middle' }} className="align-middle">
                        {editingSaleId === sale.id ? (
                          <Input 
                            name="customerPhone"
                            value={editedSaleData?.customerPhone || ''}
                            onChange={handleChange}
                          />
                        ) : (
                          sale.customerPhone
                        )}
                      </TableCell>
                      <TableCell style={{ verticalAlign: 'middle' }} className="align-middle">
                        {editingSaleId === sale.id ? (
                          <Select
                            name="paymentMethod"
                            value={editedSaleData?.paymentMethod || sale.paymentMethod}
                            onValueChange={(value) => handleChange({ target: { name: 'paymentMethod', value } } as React.ChangeEvent<HTMLSelectElement>)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UPI">UPI</SelectItem>
                              <SelectItem value="Cash">Cash</SelectItem>
                              <SelectItem value="Card">Card</SelectItem>
                              <SelectItem value="Member">Member</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          sale.paymentMethod
                        )}
                      </TableCell>
                      <TableCell style={{ verticalAlign: 'middle' }} className="align-middle">
                        <div className="flex items-center justify-end">
                          <IndianRupee className="w-4 h-4 mr-1" />
                          {editingSaleId === sale.id ? (
                            <Input 
                              name="amount"
                              type="number"
                              value={editedSaleData?.amount?.toString() || ''}
                              onChange={handleChange}
                            />
                          ) : (
                            sale.amount.toLocaleString('en-IN')
                          )}
                        </div>
                      </TableCell>
                      <TableCell style={{ verticalAlign: 'middle' }} className="align-middle">
                        {editingSaleId === sale.id ? (
                          <Select
                            name="therapistId"
                            value={editedSaleData?.therapistId || sale.therapistId}
                            onValueChange={(value) => handleChange({ target: { name: 'therapistId', value } } as React.ChangeEvent<HTMLSelectElement>)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select therapist" />
                            </SelectTrigger>
                            <SelectContent>
                              {staff.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.fullName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          therapist?.fullName
                        )}
                      </TableCell>
                      <TableCell style={{ verticalAlign: 'middle' }} className="align-middle">
                        {editingSaleId === sale.id ? (
                          <Select
                            name="roomId"
                            value={editedSaleData?.roomId || sale.roomId}
                            onValueChange={(value) => handleChange({ target: { name: 'roomId', value } } as React.ChangeEvent<HTMLSelectElement>)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select room" />
                            </SelectTrigger>
                            <SelectContent>
                              {rooms.map(r => (
                                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          room?.name
                        )}
                      </TableCell>
                      <TableCell style={{ verticalAlign: 'middle' }} className="align-middle">{schedule}</TableCell>
                      <TableCell style={{ verticalAlign: 'middle' }} className="align-middle">
                        {editingSaleId === sale.id ? (
                          <Select
                            name="therapyType"
                            value={editedSaleData?.therapyType || sale.therapyType}
                            onValueChange={(value) => handleChange({ target: { name: 'therapyType', value } } as React.ChangeEvent<HTMLSelectElement>)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select therapy" />
                            </SelectTrigger>
                            <SelectContent>
                              {therapies.map(t => (
                                <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          sale.therapyType
                        )}
                      </TableCell>
                      <TableCell style={{ verticalAlign: 'middle' }} className="align-middle">
                        {editingSaleId === sale.id ? (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSaveClick(sale.id)}
                            >
                              Save
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(sale)}
                          >
                            Edit
                          </Button>
                        )}
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
        <div className="grid gap-4 md:grid-cols-3"> {/* New grid for Total Sales, Total Therapies, and Monthly Sales Goal */}
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

          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="grid gap-4 md:grid-cols-3">Sales Goal</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">{((totalSalesForPeriod / 3000000) * 100).toFixed(1)}%</div>
                </div>
                <Progress value={(totalSalesForPeriod / 3000000) * 100} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div style={{ fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif' }}>₹{totalSalesForPeriod.toLocaleString('en-IN')}</div>
                  <div style={{ fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif' }}>Goal: ₹30,00,000</div>
                </div>
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
              {top5Therapists.length > 0 ? (
                <SalesBarChart data={top5Therapists} type="therapist" />
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
              {top5Therapies.length > 0 ? (
                <SalesBarChart data={top5Therapies} type="therapy" />
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
            <div className="flex items-center gap-2">
              {selectedSales.length > 0 && (
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteSelectedSales}
                  className="flex items-center gap-2"
                >
                  Delete Selected ({selectedSales.length})
                </Button>
              )}
              <Button variant="outline" onClick={handleExport} disabled={currentSales.length === 0}>
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {renderSalesList(sortedSales)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
