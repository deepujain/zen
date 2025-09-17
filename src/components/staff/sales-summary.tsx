
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IndianRupee } from 'lucide-react';
import type { Sale } from '@/lib/types';
import { useData } from '@/hooks/use-api-data';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';

type SalesSummaryProps = {
  staffId: string;
  allSales: Sale[];
};

const IND_CURRENCY = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export default function SalesSummary({ staffId, allSales }: SalesSummaryProps) {
  const { rooms } = useData();
  const [timeRange, setTimeRange] = useState<'mtd' | 'ytd'>('mtd');
  const today = new Date();

  const { start, end } = timeRange === 'mtd'
    ? { start: startOfMonth(today), end: endOfMonth(today) }
    : { start: startOfYear(today), end: endOfYear(today) };
  
  const sales = allSales.filter(s => {
    return s.therapistId === staffId && isWithinInterval(parseISO(s.date), { start, end });
  });

  const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
  const numberOfServices = sales.length;
  const averageSaleValue = numberOfServices > 0 ? totalSales / numberOfServices : 0;

  const paymentModeBreakdown = sales.reduce((acc, s) => {
    acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.amount;
    return acc;
  }, {} as Record<Sale['paymentMethod'], number>);

  const topServices = sales
    .reduce((acc, s) => {
      const existing = acc.find(item => item.name === s.therapyType);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ name: s.therapyType, count: 1 });
      }
      return acc;
    }, [] as { name: string; count: number }[])
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  
  const recentSales = sales.sort((a,b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime()).slice(0, 5);
  
  const teamTotalSales = allSales.filter(s => isWithinInterval(parseISO(s.date), { start, end })).reduce((sum, s) => sum + s.amount, 0);
  const staffContribution = teamTotalSales > 0 ? (totalSales / teamTotalSales) * 100 : 0;
  
  const chartData = [
    { name: 'Contribution', staff: totalSales, team: teamTotalSales - totalSales }
  ];


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Sales Summary</CardTitle>
          <CardDescription>Performance overview for this staff member.</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={(value: 'mtd' | 'ytd') => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mtd">Month-to-Date</SelectItem>
            <SelectItem value="ytd">Year-to-Date</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid md:grid-cols-3 gap-6 text-center">
            <Card className="p-4">
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold flex items-center justify-center"><IndianRupee className="w-6 h-6 mr-1" />{totalSales.toLocaleString('en-IN')}</p>
            </Card>
            <Card className="p-4">
                <p className="text-sm text-muted-foreground">Services Performed</p>
                <p className="text-2xl font-bold">{numberOfServices}</p>
            </Card>
             <Card className="p-4">
                <p className="text-sm text-muted-foreground">Average Sale Value</p>
                <p className="text-2xl font-bold flex items-center justify-center"><IndianRupee className="w-6 h-6 mr-1" />{averageSaleValue.toLocaleString('en-IN')}</p>
            </Card>
        </div>

        <div>
            <CardTitle>Sales Contribution ({timeRange.toUpperCase()})</CardTitle>
            <CardDescription>{staffContribution.toFixed(1)}% of total team sales.</CardDescription>
            <div className="h-[100px] w-full mt-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={chartData} stackOffset="expand">
                        <XAxis hide type="number" />
                        <YAxis hide type="category" dataKey="name" />
                        <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const staffSales = payload.find(p => p.dataKey === 'staff')?.value || 0;
                                    return (
                                        <div className="bg-background border p-2 rounded-lg shadow-lg">
                                            <p className="font-bold">{`Your Sales: INR ${staffSales.toLocaleString('en-IN')}`}</p>
                                            <p className="text-muted-foreground">{`Total Sales: INR ${teamTotalSales.toLocaleString('en-IN')}`}</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="staff" fill="hsl(var(--primary))" stackId="a" radius={[4, 4, 4, 4]} />
                        <Bar dataKey="team" fill="hsl(var(--muted))" stackId="a" radius={[4, 4, 4, 4]}/>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <Card>
                <CardHeader><CardTitle>Payment Breakdown</CardTitle></CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {Object.entries(paymentModeBreakdown).map(([mode, amount]) => (
                            <li key={mode} className="flex justify-between items-center">
                                <span className="capitalize">{mode.toLowerCase()}</span>
                                <span className="font-semibold flex items-center"><IndianRupee className="w-4 h-4 mr-1"/>{amount.toLocaleString('en-IN')}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Top Services</CardTitle></CardHeader>
                <CardContent>
                     <ul className="space-y-2">
                        {topServices.map(service => (
                            <li key={service.name} className="flex justify-between items-center">
                                <span>{service.name}</span>
                                <span className="font-semibold">{service.count} sessions</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
        
        <div>
            <CardTitle className="mb-4">Recent Sales</CardTitle>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentSales.map(sale => {
                        const room = rooms.find(r => r.id === sale.roomId);
                        return (
                            <TableRow key={sale.id}>
                                <TableCell>{sale.customerName}</TableCell>
                                <TableCell>{format(parseISO(sale.date), 'MMM d, yyyy')}</TableCell>
                                <TableCell>
                                    <div>{sale.therapyType}</div>
                                    <div className="text-sm text-muted-foreground">{room?.name}</div>
                                </TableCell>
                                <TableCell className="text-right font-medium flex items-center justify-end"><IndianRupee className="w-4 h-4 mr-1"/>{sale.amount.toLocaleString('en-IN')}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>

      </CardContent>
    </Card>
  );
}
