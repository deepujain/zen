"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/components/providers/theme-provider";

interface SalesPieChartProps {
  data: {
    name: string;
    total: number | null;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6B6B', '#6BFF6B'];

export function SalesPieChart({ data }: SalesPieChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const formattedData = data.filter(item => item.total !== null && item.total > 0).map(item => ({
    name: item.name,
    value: item.total || 0, // Ensure value is a number for Recharts
  }));

  const totalSales = formattedData.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent, value }) => 
              value > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
            }
            nameKey="name"
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            cursor={{ fill: isDark ? 'hsl(var(--muted))' : 'hsl(var(--muted))' }} // Highlight on hover
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <Card>
                    <CardContent className="p-2">
                      <div className="text-sm font-medium"
                        style={{ fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif' }}
                      >
                        {item.name}
                      </div>
                      <div className="text-sm font-bold"
                        style={{ fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif' }}
                      >
                        {item.value !== null ? `₹ ${item.value.toLocaleString('en-IN')}` : "No sales"}
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              return null;
            }}
            wrapperStyle={{ fontFamily: 'Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif' }} // Apply font family
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
