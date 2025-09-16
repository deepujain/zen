"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useTheme } from "@/components/providers/theme-provider";

// Register ChartJS components
// Only register the components we need, explicitly exclude Legend
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  ChartDataLabels
);

interface SalesBarChartProps {
  data: {
    name: string;
    total: number;
  }[];
  title?: string;
  type: 'payment' | 'therapist' | 'therapy';
}

export function SalesBarChart({ data, title, type }: SalesBarChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Different color schemes for each card type
  const colorSchemes = {
    payment: {
      light: {
        bg: 'rgba(59, 130, 246, 0.5)',
        border: 'rgba(59, 130, 246, 0.7)'
      },
      dark: {
        bg: 'rgba(59, 130, 246, 0.8)',
        border: 'rgba(59, 130, 246, 0.9)'
      }
    },
    therapist: {
      light: {
        bg: 'rgba(16, 185, 129, 0.5)',
        border: 'rgba(16, 185, 129, 0.7)'
      },
      dark: {
        bg: 'rgba(16, 185, 129, 0.8)',
        border: 'rgba(16, 185, 129, 0.9)'
      }
    },
    therapy: {
      light: {
        bg: 'rgba(245, 158, 11, 0.5)',
        border: 'rgba(245, 158, 11, 0.7)'
      },
      dark: {
        bg: 'rgba(245, 158, 11, 0.8)',
        border: 'rgba(245, 158, 11, 0.9)'
      }
    }
  };

  const colors = colorSchemes[type][isDark ? 'dark' : 'light'];

  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.total),
        backgroundColor: colors.bg,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 28,
        maxBarThickness: 32,
        minBarLength: 50, // Ensure minimum bar length for small values
        // Ensure bar doesn't take full width to leave space for labels
        categoryPercentage: 0.8,
        barPercentage: 0.9,
        // Disable hover effects that might suggest interactivity
        hoverBackgroundColor: colors.bg,
        hoverBorderColor: colors.border,
        // Remove all legend-related properties
        showLine: false,
        label: '',
        hidden: false,
        fill: true,
        spanGaps: true,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const, // This makes the bars horizontal
    responsive: true,
    maintainAspectRatio: false,
    // Remove all chart controls and legends
    layout: {
      padding: {
        top: 0,
        right: 50,  // Add padding for value labels
        bottom: 0,
        left: 0
      }
    },
    plugins: {
      // Remove all plugin displays
      legend: {
        display: false,
        labels: {
          boxWidth: 0,
          generateLabels: () => []
        }
      },
      title: {
        display: false
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: any) => {
            return `₹ ${context.raw.toLocaleString('en-IN')}`;
          },
        },
      },
      datalabels: {
        color: isDark ? '#e5e7eb' : '#374151',
        anchor: 'end',
        align: 'right',
        offset: 8,
        font: {
          weight: '600',
          size: 11,
        },
        formatter: (value: number) => `₹${value.toLocaleString('en-IN')}`,
        // Ensure labels are always visible
        clamp: true,
        clip: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDark ? '#e5e7eb' : '#374151',
          callback: (value: number) => `₹${value.toLocaleString('en-IN')}`,
          maxRotation: 0,
          autoSkip: true,
        },
        // Ensure the axis takes up less space
        afterFit: (axis: any) => {
          axis.maxWidth = axis.width * 0.8;
        }
      },
      y: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: isDark ? '#e5e7eb' : '#374151',
          font: {
            weight: '500',
          },
          // Ensure labels don't get cut off
          padding: 8,
          maxRotation: 0,
          minRotation: 0,
        },
      },
    },
    // Add plugin to display values on the bars
    plugins: {
      ...{}, // Keep existing plugin config
      datalabels: {
        display: true,
        align: 'end',
        anchor: 'end',
        color: isDark ? '#e5e7eb' : '#374151',
        font: {
          weight: '600',
        },
        formatter: (value: number) => `₹${value.toLocaleString('en-IN')}`,
      },
    },
  };

  return (
    <div className="w-full h-[300px]">
      <Bar data={chartData} options={options} />
    </div>
  );
}
