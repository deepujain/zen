
"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, IndianRupee, FileDown } from 'lucide-react';
import { useData } from '@/hooks/use-api-data';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, differenceInMinutes } from 'date-fns';
import { SalesBarChart } from '@/components/ui/sales-bar-chart';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import AddSaleForm from '@/components/sales/add-sale-form';
import type { Sale } from '@/lib/types';


function SaleCard({ sale }: { sale: Sale }) {
  const { staff, rooms } = useData();
  const therapist = staff.find(s => s.id === sale.therapistId);
  const room = rooms.find(r => r.id === sale.roomId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg">{sale.customerName}</CardTitle>
          <p className="text-sm text-muted-foreground">{sale.customerPhone}</p>
        </div>
        <div className="text-lg font-semibold flex items-center">
            <IndianRupee className="w-4 h-4 mr-1"/>{sale.amount.toLocaleString('en-IN')}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Payment:</span>
          <span>{sale.paymentMethod}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Therapy:</span>
          <span>{sale.therapyType}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Therapist:</span>
          <span>{therapist?.fullName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Room:</span>
          <span>{room?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Duration:</span>
          <span>
            {differenceInMinutes(parseISO(sale.endTime), parseISO(sale.startTime))} mins
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Schedule:</span>
          <span>
            {format(parseISO(sale.startTime), 'h:mm a')} - {format(parseISO(sale.endTime), 'h:mm a')} ({format(parseISO(sale.date), 'MMM d, yyyy')})
          </span>
        </div>
      </CardContent>
    </Card>
  );
}


export default function SalesPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { sales, therapies, staff, rooms } = useData();
  
  const today = new Date();

  const { salesToday, salesMTD, salesYTD } = useMemo(() => {
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const salesToday = sales.filter(s => isWithinInterval(parseISO(s.date), { start: todayStart, end: todayEnd }));

    const monthStart = startOfMonth(today);
    const salesMTD = sales.filter(s => isWithinInterval(parseISO(s.date), { start: monthStart, end: today }));
    
    const yearStart = startOfYear(today);
    const salesYTD = sales.filter(s => isWithinInterval(parseISO(s.date), { start: yearStart, end: today }));

    return { salesToday, salesMTD, salesYTD };
  }, [sales, today]);

  const [activeTab, setActiveTab] = useState<'today' | 'mtd' | 'ytd'>('today');
  const [visibleSalesCount, setVisibleSalesCount] = useState(50);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const salesForPeriod = (period: 'today' | 'mtd' | 'ytd') => {
    if (period === 'today') return salesToday;
    if (period === 'mtd') return salesMTD;
    return salesYTD;
  }
  const currentSales = salesForPeriod(activeTab);

  const totalSalesForPeriod = useMemo(() => {
    return currentSales.reduce((acc, sale) => acc + sale.amount, 0);
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
      .slice(0, 6)
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
      .slice(0, 6)
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

  const handleExport = () => {
    const dataToExport = salesForPeriod(activeTab);
    const headers = "Day,Customer Name,Phone Number,Amount,Payment Method,Therapy Type,Therapist,Room,Duration (mins),Schedule\n";
    
    const csvRows = dataToExport.map(sale => {
      const therapist = staff.find(s => s.id === sale.therapistId);
      const room = rooms.find(r => r.id === sale.roomId);
      const duration = differenceInMinutes(parseISO(sale.endTime), parseISO(sale.startTime));
      const schedule = `${format(parseISO(sale.startTime), 'h:mm a')} - ${format(parseISO(sale.endTime), 'h:mm a')}`;
      const day = format(parseISO(sale.date), 'eeee');

      const row = [
        `"${format(parseISO(sale.date), 'MMM d, yyyy')}"`,
        `"${sale.customerName}"`,
        `"${sale.customerPhone}"`,
        sale.amount,
        sale.paymentMethod,
        `"${sale.therapyType}"`,
        `"${therapist?.fullName || ''}"`,
        `"${room?.name || ''}"`,
        duration,
        `"${schedule}"`
      ];
      return row.join(',');
    });

    const csvContent = headers + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `sales_${activeTab}_${format(new Date(), 'yyyyMMdd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


  // Intersection Observer for infinite scroll
  const loadMoreSales = useCallback(() => {
    const currentSales = salesForPeriod(activeTab);
    if (visibleSalesCount < currentSales.length) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setVisibleSalesCount(prev => Math.min(prev + 50, currentSales.length));
        setIsLoadingMore(false);
      }, 500);
    }
  }, [activeTab, visibleSalesCount, salesForPeriod]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreSales();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loadMoreSales]);

  const renderSalesList = (salesList: Sale[]) => {
    if (salesList.length === 0) {
      return <p className="text-muted-foreground text-center py-8">No sales records for this period.</p>;
    }
    
    const sortedSales = [...salesList].sort((a,b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime());
    const visibleSales = sortedSales.slice(0, visibleSalesCount);
    const hasMoreSales = visibleSalesCount < sortedSales.length;
    
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleSales.map(sale => <SaleCard key={sale.id} sale={sale} />)}
        </div>
        
        {/* Load more trigger */}
        {hasMoreSales && (
          <div ref={loadMoreRef} className="flex justify-center py-4">
            {isLoadingMore ? (
              <p className="text-muted-foreground">Loading more sales...</p>
            ) : (
              <p className="text-muted-foreground">
                Showing {visibleSales.length} of {sortedSales.length} sales
              </p>
            )}
          </div>
        )}
        
        {!hasMoreSales && sortedSales.length > 50 && (
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              All {sortedSales.length} sales loaded
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative space-y-6">
      <div className="flex items-center justify-end mb-4 flex-wrap gap-2">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                  <Button className="fixed bottom-24 right-4 md:static md:bottom-auto md:right-auto z-20 shadow-lg md:shadow-none rounded-full md:rounded-md w-14 h-14 md:w-auto md:h-auto">
                      <PlusCircle className="h-6 w-6 md:mr-2" />
                      <span className="hidden md:inline">Add Sale</span>
                  </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                  <SheetHeader>
                      <SheetTitle>Add Sale Record</SheetTitle>
                  </SheetHeader>
                  <AddSaleForm setOpen={setIsSheetOpen} />
              </SheetContent>
          </Sheet>
        </div>

      <Tabs defaultValue="today" onValueChange={(value) => { 
        setActiveTab(value as 'today' | 'mtd' | 'ytd');
        setVisibleSalesCount(50); // Reset pagination when switching tabs
      }}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="mtd">MTD</TabsTrigger>
          <TabsTrigger value="ytd">YTD</TabsTrigger>
        </TabsList>

        <div className="space-y-4 mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Total Sales</CardTitle>
                    <CardDescription>Total sales for the selected period.</CardDescription>
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
                    <CardTitle>Sales by Payment Method</CardTitle>
                    <CardDescription>Total sales for top payment methods in this period.</CardDescription>
                </CardHeader>
                <CardContent>
                    {top3PaymentMethods.length > 0 ? (
                        <SalesBarChart data={top3PaymentMethods} type="payment" />
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No sales data for this period.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
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

            <Card>
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
            
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Individual Sales</CardTitle>
                        <CardDescription>All sales recorded for the selected period.</CardDescription>
                    </div>
                     <Button variant="outline" onClick={handleExport} disabled={currentSales.length === 0}>
                        <FileDown className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </CardHeader>
                <CardContent>
                    <TabsContent value="today" className="mt-0">{renderSalesList(salesToday)}</TabsContent>
                    <TabsContent value="mtd" className="mt-0">{renderSalesList(salesMTD)}</TabsContent>
                    <TabsContent value="ytd" className="mt-0">{renderSalesList(salesYTD)}</TabsContent>
                </CardContent>
            </Card>
        </div>
      </Tabs>
    </div>
  );
}
