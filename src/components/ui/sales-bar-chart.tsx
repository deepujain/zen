"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent } from "@/components/ui/card";

import { useTheme } from "@/components/providers/theme-provider";

interface SalesBarChartProps {
  data: {
    name: string;
    total: number | null;
  }[];
  title?: string;
  type: 'payment' | 'therapist' | 'therapy' | 'daily';
}

export function SalesBarChart({ data, title, type }: SalesBarChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const tickColor = isDark ? "#e5e7eb" : "#374151";
  const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
  const labelFillColor = isDark ? "#e5e7eb" : "#374151";

  const barColor = (chartType: SalesBarChartProps['type']) => {
    switch (chartType) {
      case 'payment': return isDark ? "rgba(59, 130, 246, 0.8)" : "rgba(59, 130, 246, 0.5)";
      case 'therapist': return isDark ? "rgba(16, 185, 129, 0.8)" : "rgba(16, 185, 129, 0.5)";
      case 'therapy': return isDark ? "rgba(245, 158, 11, 0.8)" : "rgba(245, 158, 11, 0.5)";
      case 'daily': return isDark ? "rgba(139, 92, 246, 0.8)" : "rgba(139, 92, 246, 0.5)";
      default: return isDark ? "#8884d8" : "#8884d8";
    }
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} // Removed filter to show all days on x-axis
          margin={{
            top: 20, right: 20, left: 20, bottom: 5,
          }}
          barCategoryGap={type === 'daily' ? "20%" : "10%"} // Increased gap for daily charts
        >
          <CartesianGrid 
            strokeDasharray="3 3"
            stroke={gridColor}
            vertical={false}
          />
          <XAxis 
            dataKey="name" 
            type="category" // Explicitly set type to category
            stroke={tickColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            angle={type === 'daily' || type === 'therapist' || type === 'therapy' ? -45 : 0} // Rotate for daily/therapist/therapy
            textAnchor={type === 'daily' || type === 'therapist' || type === 'therapy' ? "end" : "middle"} // Adjust anchor for rotation
            interval={0} // Show all ticks to prevent skipping
            height={type === 'daily' || type === 'therapist' || type === 'therapy' ? 60 : 30} // Adjust height for rotation
            tickFormatter={(value) => value} // Simply return the value from dataKey as the tick label
          />
          <YAxis
            stroke={tickColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹ ${value.toLocaleString('en-IN')}`}
            width={80}
            style={{ fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif' }} // Apply font family
          />
          <Tooltip
            cursor={{ fill: isDark ? 'hsl(var(--muted))' : 'hsl(var(--muted))' }} // Highlight bar on hover
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <Card>
                    <CardContent className="p-2">
                      <div className="text-sm font-medium"
                        style={{ fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif' }} // Apply font family
                      >
                        {type === 'daily' ? `Day ${label}` : label}
                      </div>
                      <div className="text-sm font-bold"
                        style={{ fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif' }} // Apply font family
                      >
                        {item.total !== null ? `₹ ${item.total.toLocaleString('en-IN')}` : "No sales"}
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              return null;
            }}
            wrapperStyle={{ fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif' }} // Apply font family
          />
          <Bar 
            dataKey="total"
            radius={[4, 4, 0, 0]}
            fill={barColor(type)}
            barSize={type === 'daily' ? 25 : (type === 'payment' ? 40 : 25)} // Further reduced barSize for daily
            label={{
              position: 'top',
              formatter: (value: number) => (value > 0 ? `₹ ${value.toLocaleString('en-IN')}` : ''), // Ensure correct formatting
              fill: labelFillColor,
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif', // Apply font family
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
