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
  selectedMonth?: string; // Format: 'YYYY-MM'
}

export function SalesBarChart({ data, title, type, selectedMonth }: SalesBarChartProps) {
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
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const value = payload[0].value as number;
                let date;
                try {
                  // Construct date from selectedMonth and day
                  let displayDate;
                  if (selectedMonth && type === 'daily') {
                    // label is the day of month
                    const [year, month] = selectedMonth.split('-');
                    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(label));
                    displayDate = dateObj.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });
                  } else {
                    // For non-daily charts or when month is not provided
                    displayDate = label;
                  }
                  const formattedAmount = value.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0
                  });
                  return (
                    <div className="bg-background border p-2 rounded-lg shadow-lg">
                      <p className="whitespace-nowrap">{displayDate}</p>
                      <p className="font-bold">{formattedAmount}</p>
                    </div>
                  );
                } catch (e) {
                  // If date parsing fails, just show the label and value
                  return (
                    <div className="bg-background border p-2 rounded-lg shadow-lg">
                      <p>{label}</p>
                      <p className="font-bold">₹{value.toLocaleString('en-IN')}</p>
                    </div>
                  );
                }
              }
              return null;
            }}
            cursor={{ fill: isDark ? 'hsl(var(--muted))' : 'hsl(var(--muted))' }} // Highlight bar on hover
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
