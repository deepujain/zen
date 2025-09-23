
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Users, UserCheck, UserX, Clock, Trophy, TrendingUp, Calendar, IndianRupee, Receipt, Medal, Target, ArrowDownUp, Wallet } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { useData } from "@/hooks/use-api-data";
import { format, parseISO, startOfMonth, isWithinInterval, startOfYear, startOfToday, endOfMonth, endOfYear, differenceInDays } from "date-fns";
import { CrCountdown } from "@/components/ui/cr-countdown";
import { useState, useMemo, useCallback } from 'react';
import { ArrowDown } from "lucide-react";


const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[1][0]}`;
  }
  return names[0].substring(0, 2).toUpperCase();
};

const rankIcons = [
    { 
        icon: <Medal className="w-6 h-6 text-yellow-600 drop-shadow-sm" />, 
        color: 'bg-gradient-to-r from-yellow-200 to-yellow-300 dark:from-yellow-800 dark:to-yellow-700 border border-yellow-300 dark:border-yellow-600' 
    },
    { 
        icon: <Medal className="w-6 h-6 text-slate-500 drop-shadow-sm" />, 
        color: 'bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 border border-slate-300 dark:border-slate-600' 
    },
    { 
        icon: <Medal className="w-6 h-6 text-orange-700 drop-shadow-sm" />, 
        color: 'bg-gradient-to-r from-orange-200 to-amber-300 dark:from-orange-800 dark:to-amber-800 border border-orange-300 dark:border-orange-600' 
    },
];

export default function DashboardPage() {
  const { sales, staff, rooms, attendance, expenses } = useData();
  const today = startOfToday();
  const [timeRange, setTimeRange] = useState<'mtd' | 'ytd'>('mtd');
  const todayStr = format(today, 'yyyy-MM-dd');
  const monthStart = startOfMonth(today);
  const yearStart = startOfYear(today);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' | null }>({ key: 'startTime', direction: 'descending' });

  const handleSort = useCallback((key: string) => {
    setSortConfig(prevConfig => {
      let direction: 'ascending' | 'descending' | null = 'ascending';
      if (prevConfig.key === key) {
        if (prevConfig.direction === 'ascending') {
          direction = 'descending';
        } else if (prevConfig.direction === 'descending') {
          direction = null;
        }
      }
      return { key, direction };
    });
  }, []);
  
  // Expense stats
  const todaysExpenses = expenses.filter(e => e.date === todayStr);
  const todayExpenseTotal = todaysExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const mtdExpenses = expenses.filter(e => isWithinInterval(parseISO(e.date), { start: monthStart, end: today }));
  const mtdExpenseTotal = mtdExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const ytdExpenses = expenses.filter(e => isWithinInterval(parseISO(e.date), { start: yearStart, end: today }));
  const ytdExpenseTotal = ytdExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Todays stats
  const todaysSales = sales.filter(s => s.date === todayStr);
  const dailyTotal = todaysSales.reduce((sum, sale) => sum + sale.amount, 0);
  const customersToday = new Set(todaysSales.map(s => 
    s.customerPhone && s.customerPhone !== '-' ? s.customerPhone : s.id
  )).size;

  const sortedRecentSales = useMemo(() => {
    if (!todaysSales || todaysSales.length === 0) return [];

    let sortableItems = [...todaysSales];
    if (sortConfig.key && sortConfig.direction) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof typeof a];
        const bValue = b[sortConfig.key as keyof typeof b];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          if (sortConfig.key === 'startTime') {
            const timeA = parseISO(`2000-01-01T${aValue}`);
            const timeB = parseISO(`2000-01-01T${bValue}`);
            return sortConfig.direction === 'ascending' ? timeA.getTime() - timeB.getTime() : timeB.getTime() - timeA.getTime();
          }
          return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    }
    return sortableItems.slice(0, 3);
  }, [todaysSales, sortConfig]);

  const recentSales = sortedRecentSales;
  
  const todaysAttendance = attendance.filter(a => a.date === todayStr);
  const presentCount = todaysAttendance.filter(a => a.status === 'Present').length;
  const lateCount = todaysAttendance.filter(a => a.status === 'Late').length;
  const therapists = staff.filter(s => s.role === 'Therapist');
  const absentCount = therapists.length - presentCount - lateCount;
  
  // Calculate absent therapists
  const presentTherapistIds = todaysAttendance.map(a => a.staffId);
  const absentTherapists = therapists.filter(t => !presentTherapistIds.includes(t.id));

  // Month-to-date stats
  const mtdSales = sales.filter(s => isWithinInterval(parseISO(s.date), { start: monthStart, end: today }));
  const mtdTotal = mtdSales.reduce((sum, sale) => sum + sale.amount, 0);

  // Year-to-date stats
  const ytdSales = sales.filter(s => isWithinInterval(parseISO(s.date), { start: yearStart, end: today }));
  const ytdTotal = ytdSales.reduce((sum, sale) => sum + sale.amount, 0);

  // Top performers and therapies logic
  const { topTherapists, topTherapies } = useMemo(() => {
    const { start, end } = timeRange === 'mtd'
      ? { start: startOfMonth(today), end: endOfMonth(today) }
      : { start: startOfYear(today), end: endOfYear(today) };
    
    const filteredSales = sales.filter(s => isWithinInterval(parseISO(s.date), { start, end }));

    // Calculate top therapists
    const therapistSales = filteredSales.reduce((acc, sale) => {
        const therapistId = sale.therapistId;
        if (!acc[therapistId]) {
            acc[therapistId] = { total: 0, sessions: 0 };
        }
        acc[therapistId].total += sale.amount;
        acc[therapistId].sessions++;
        return acc;
    }, {} as Record<string, { total: number; sessions: number }>);
    
    const therapists = staff.filter(s => s.role === 'Therapist');
    
    const topTherapists = therapists
        .map(therapist => ({
            ...therapist,
            salesTotal: therapistSales[therapist.id]?.total || 0,
            sessionsTotal: therapistSales[therapist.id]?.sessions || 0,
        }))
        .sort((a, b) => b.salesTotal - a.salesTotal)
        .slice(0, 3);

    // Calculate top therapies
    const therapySales = filteredSales.reduce((acc, sale) => {
        const therapyType = sale.therapyType;
        if (!acc[therapyType]) {
            acc[therapyType] = { total: 0, sessions: 0 };
        }
        acc[therapyType].total += sale.amount;
        acc[therapyType].sessions++;
        return acc;
    }, {} as Record<string, { total: number; sessions: number }>);

    const topTherapies = Object.entries(therapySales)
        .map(([name, stats]) => ({
            name,
            salesTotal: stats.total,
            sessionsTotal: stats.sessions,
        }))
        .sort((a, b) => b.salesTotal - a.salesTotal)
        .slice(0, 3);

    return { topTherapists, topTherapies };
  }, [sales, staff, timeRange, today]);


  return (
    <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Today's Sales</CardTitle>
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold flex items-center"><IndianRupee className="h-5 w-5 mr-1" />{dailyTotal.toLocaleString('en-IN')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Month-to-Date Sales</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold flex items-center"><IndianRupee className="h-5 w-5 mr-1" />{mtdTotal.toLocaleString('en-IN')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Year-to-Date Sales</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold flex items-center"><IndianRupee className="h-5 w-5 mr-1" />{ytdTotal.toLocaleString('en-IN')}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Today's Expenses</CardTitle>
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold flex items-center"><IndianRupee className="h-5 w-5 mr-1" />{todayExpenseTotal.toLocaleString('en-IN')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Month-to-Date Expenses</CardTitle>
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold flex items-center"><IndianRupee className="h-5 w-5 mr-1" />{mtdExpenseTotal.toLocaleString('en-IN')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Year-to-Date Expenses</CardTitle>
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold flex items-center"><IndianRupee className="h-5 w-5 mr-1" />{ytdExpenseTotal.toLocaleString('en-IN')}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className={`text-sm font-medium ${(dailyTotal - todayExpenseTotal) < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>Today's Profit</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold flex items-center ${(dailyTotal - todayExpenseTotal) < 0 ? 'text-red-500' : 'text-green-500'}`}>
                        <IndianRupee className="h-5 w-5 mr-1" />
                        {Math.abs(dailyTotal - todayExpenseTotal).toLocaleString('en-IN')}
                      </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className={`text-sm font-medium ${(mtdTotal - mtdExpenseTotal) < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>Month-to-Date Profit</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold flex items-center ${(mtdTotal - mtdExpenseTotal) < 0 ? 'text-red-500' : 'text-green-500'}`}>
                        <IndianRupee className="h-5 w-5 mr-1" />
                        {Math.abs(mtdTotal - mtdExpenseTotal).toLocaleString('en-IN')}
                      </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className={`text-sm font-medium ${(ytdTotal - ytdExpenseTotal) < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>Year-to-Date Profit</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold flex items-center ${(ytdTotal - ytdExpenseTotal) < 0 ? 'text-red-500' : 'text-green-500'}`}>
                        <IndianRupee className="h-5 w-5 mr-1" />
                        {Math.abs(ytdTotal - ytdExpenseTotal).toLocaleString('en-IN')}
                      </div>
                    </CardContent>
                </Card>
            </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Monthly Sales Goal</CardTitle>
                  <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-green-600 dark:text-green-400" style={{ fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif' }}>{((mtdTotal / 3000000) * 100).toFixed(1)}%</div>
                  </div>
                  <Progress value={(mtdTotal / 3000000) * 100} className="h-2 [&>div]:bg-green-600 [&>div]:dark:bg-green-400 bg-green-100 dark:bg-green-900" />
                  <div className="flex items-center justify-between text-xs text-green-600/75 dark:text-green-400/75">
                    <div style={{ fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif' }}>₹{mtdTotal.toLocaleString('en-IN')}</div>
                    <div style={{ fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif' }}>Goal: ₹30,00,000</div>
                  </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily Average Profit</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold flex items-center ${(mtdTotal - mtdExpenseTotal) < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    <IndianRupee className="h-5 w-5 mr-1" />
                    {Math.abs(Math.round((mtdTotal - mtdExpenseTotal) / (differenceInDays(today, monthStart) + 1))).toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on {differenceInDays(today, monthStart) + 1} days MTD
                  </p>
                </CardContent>
            </Card>
            <CrCountdown 
                mtdSales={mtdTotal}
                mtdExpenses={mtdExpenseTotal}
                daysInCurrentPeriod={differenceInDays(today, monthStart) + 1}
            />
            <Card className="md:col-span-3">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{customersToday}</div>
                </CardContent>
            </Card>
        </div>

      <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Top Therapists</CardTitle>
                <Select value={timeRange} onValueChange={(value: 'mtd' | 'ytd') => setTimeRange(value)}>
                    <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Select a time range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="mtd">MTD</SelectItem>
                        <SelectItem value="ytd">YTD</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="space-y-4">
                {topTherapists.map((therapist, index) => {
                    const isGold = index === 0;
                    const isSilver = index === 1;
                    const isBronze = index === 2;
                    
                    return (
                        <div key={therapist.id} className={`flex items-center p-4 rounded-lg shadow-sm ${rankIcons[index].color}`}>
                            <div className="mr-4">{rankIcons[index].icon}</div>
                            <Avatar className="h-10 w-10 mr-4">
                                <AvatarFallback className={`font-semibold ${
                                    isGold ? 'bg-yellow-600 text-white' :
                                    isSilver ? 'bg-slate-600 text-white' :
                                    'bg-orange-700 text-white'
                                }`}>{getInitials(therapist.fullName)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className={`font-bold ${
                                    isGold ? 'text-yellow-800 dark:text-yellow-100' :
                                    isSilver ? 'text-slate-800 dark:text-slate-100' :
                                    'text-orange-800 dark:text-orange-100'
                                }`}>{therapist.fullName}</p>
                                <p className={`text-sm ${
                                    isGold ? 'text-yellow-700 dark:text-yellow-200' :
                                    isSilver ? 'text-slate-600 dark:text-slate-300' :
                                    'text-orange-700 dark:text-orange-200'
                                }`}>{therapist.sessionsTotal} sessions</p>
                            </div>
                            <div className={`text-lg font-bold flex items-center ${
                                isGold ? 'text-yellow-800 dark:text-yellow-100' :
                                isSilver ? 'text-slate-800 dark:text-slate-100' :
                                'text-orange-800 dark:text-orange-100'
                            }`}>
                                <IndianRupee className="w-5 h-5 mr-1"/>
                                {therapist.salesTotal.toLocaleString('en-IN')}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Top Therapies</CardTitle>
                <Select value={timeRange} onValueChange={(value: 'mtd' | 'ytd') => setTimeRange(value)}>
                    <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Select a time range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="mtd">MTD</SelectItem>
                        <SelectItem value="ytd">YTD</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="space-y-4">
                {topTherapies.map((therapy, index) => {
                    const isGold = index === 0;
                    const isSilver = index === 1;
                    const isBronze = index === 2;
                    
                    return (
                        <div key={therapy.name} className={`flex items-center p-4 rounded-lg shadow-sm ${rankIcons[index].color}`}>
                            <div className="mr-4">{rankIcons[index].icon}</div>
                            <div className="flex-1">
                                <p className={`font-bold ${
                                    isGold ? 'text-yellow-800 dark:text-yellow-100' :
                                    isSilver ? 'text-slate-800 dark:text-slate-100' :
                                    'text-orange-800 dark:text-orange-100'
                                }`}>{therapy.name}</p>
                                <p className={`text-sm ${
                                    isGold ? 'text-yellow-700 dark:text-yellow-200' :
                                    isSilver ? 'text-slate-600 dark:text-slate-300' :
                                    'text-orange-700 dark:text-orange-200'
                                }`}>{therapy.sessionsTotal} sessions</p>
                            </div>
                            <div className={`text-lg font-bold flex items-center ${
                                isGold ? 'text-yellow-800 dark:text-yellow-100' :
                                isSilver ? 'text-slate-800 dark:text-slate-100' :
                                'text-orange-800 dark:text-orange-100'
                            }`}>
                                <IndianRupee className="w-5 h-5 mr-1"/>
                                {therapy.salesTotal.toLocaleString('en-IN')}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
          </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">Today's Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 bg-green-100/50 dark:bg-green-900/50 rounded-lg">
                        <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="text-2xl font-bold">{presentCount}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-100/50 dark:bg-yellow-900/50 rounded-lg">
                        <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-2xl font-bold">{lateCount}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-100/50 dark:bg-red-900/50 rounded-lg">
                        <UserX className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <span className="text-2xl font-bold">{absentCount}</span>
                    </div>
                </div>
                {absentTherapists.length > 0 && (
                    <div className="mt-4 p-4 bg-red-50/50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">Absent Therapists:</p>
                        <div className="flex flex-wrap gap-2">
                            {absentTherapists.map((therapist) => (
                                <div key={therapist.id} className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-100/80 dark:bg-red-900/30 rounded">
                                    <UserX className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                                    <span className="text-sm text-red-700 dark:text-red-300">{therapist.fullName}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2"><Receipt className="h-4 w-4" /> Recent Sales</CardTitle>
            <CardDescription>
              You made {todaysSales.length} sales today.
            </CardDescription>
          </div>
          <Button asChild size="sm" className="ml-auto gap-1">
            <Link href="/sales">
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentSales.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => handleSort('customerName')} className="cursor-pointer hover:text-foreground">Customer {sortConfig.key === 'customerName' && (sortConfig.direction === 'ascending' ? <ArrowDown className="ml-1 inline h-4 w-4" /> : <ArrowDownUp className="ml-1 inline h-4 w-4" />)}</TableHead>
                  <TableHead onClick={() => handleSort('therapyType')} className="cursor-pointer hover:text-foreground">Therapy {sortConfig.key === 'therapyType' && (sortConfig.direction === 'ascending' ? <ArrowDown className="ml-1 inline h-4 w-4" /> : <ArrowDownUp className="ml-1 inline h-4 w-4" />)}</TableHead>
                  <TableHead onClick={() => handleSort('amount')} className="text-right cursor-pointer hover:text-foreground">Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'ascending' ? <ArrowDown className="ml-1 inline h-4 w-4" /> : <ArrowDownUp className="ml-1 inline h-4 w-4" />)}</TableHead>
                  <TableHead onClick={() => handleSort('startTime')} className="text-right cursor-pointer hover:text-foreground">Time {sortConfig.key === 'startTime' && (sortConfig.direction === 'ascending' ? <ArrowDown className="ml-1 inline h-4 w-4" /> : <ArrowDownUp className="ml-1 inline h-4 w-4" />)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSales.map(sale => {
                  const therapist = staff.find(s => s.id === sale.therapistId);
                  const room = rooms.find(r => r.id === sale.roomId);
                  return (
                    <TableRow key={sale.id}>
                      <TableCell>
                        <div className="font-medium">{sale.customerName}</div>
                      </TableCell>
                      <TableCell>
                        <div>{sale.therapyType}</div>
                        <div className="text-sm text-muted-foreground">{therapist?.fullName} • {room?.name}</div>
                      </TableCell>
                      <TableCell className="text-right flex items-center justify-end"><IndianRupee className="w-4 h-4 mr-1" />{sale.amount.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right">{format(parseISO(sale.startTime), 'h:mm a')}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No sales recorded for today.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
