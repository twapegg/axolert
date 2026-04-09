"use client";

import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CasesChartProps {
  isSimulating: boolean;
}

// Generate mock data for dengue cases
const generateCasesData = (isSimulating: boolean) => {
  const dates = [];
  const observedCases = [];
  const rollingAverage = [];
  const predictedCases = [];

  // Generate dates (past 14 days + future 7 days)
  for (let i = -14; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date.getDate().toString());
  }

  // Generate realistic case data
  for (let i = 0; i < dates.length; i++) {
    if (i < 15) {
      // Past data (observed)
      const baseCase = 45 + Math.sin(i * 0.3) * 15 + Math.random() * 10;
      const simMultiplier = isSimulating ? 1 + (i / 15) * 2 : 1;
      const currentCase = Math.floor(baseCase * simMultiplier);
      observedCases.push(currentCase);

      // Rolling average
      if (i >= 6) {
        const recentCases = observedCases
          .slice(i - 6, i + 1)
          .filter((c) => c !== null) as number[];
        const avg =
          recentCases.length > 0
            ? recentCases.reduce((a, b) => a + b, 0) / recentCases.length
            : 0;
        rollingAverage.push(avg);
      } else {
        rollingAverage.push(null);
      }
      predictedCases.push(null);
    } else {
      // Future data (predicted)
      observedCases.push(null);

      const lastAvg =
        rollingAverage.filter((val) => val !== null).slice(-1)[0] || 45;
      const trendMultiplier = isSimulating ? 2.5 : 1.2;
      const predicted = lastAvg * trendMultiplier * (1 + (i - 14) * 0.1);

      predictedCases.push(predicted);
      rollingAverage.push(null);
    }
  }

  return { dates, observedCases, rollingAverage, predictedCases };
};

export default function CasesChart({ isSimulating }: CasesChartProps) {
  const [data, setData] = useState(generateCasesData(false));

  useEffect(() => {
    setData(generateCasesData(isSimulating));
  }, [isSimulating]);

  const chartData = {
    labels: data.dates,
    datasets: [
      // Observed cases (main color line with fill)
      {
        label: "Observed Cases",
        data: data.observedCases,
        borderColor: "#758db9",
        backgroundColor: "rgba(117, 141, 185, 0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: "#758db9",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
      // 7-day rolling average (pink line)
      {
        label: "7-Day Rolling Average",
        data: data.rollingAverage,
        borderColor: "#f3bdc8",
        backgroundColor: "transparent",
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#f3bdc8",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
      // Predicted cases (red dashed line)
      {
        label: "Predicted Cases",
        data: data.predictedCases,
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        borderDash: [8, 4],
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: "#ef4444",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#475569",
          usePointStyle: true,
          padding: 15,
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1e293b",
        bodyColor: "#64748b",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          color: "#f1f5f9",
          drawBorder: false,
        },
        ticks: {
          color: "#64748b",
          font: { size: 11 },
        },
        title: {
          display: true,
          text: "September 2025",
          color: "#475569",
          font: { size: 12, weight: "bold" as const },
        },
      },
      y: {
        grid: {
          color: "#f1f5f9",
          drawBorder: false,
        },
        ticks: {
          color: "#64748b",
          font: { size: 11 },
        },
        title: {
          display: true,
          text: "Daily Cases",
          color: "#475569",
          font: { size: 12, weight: "bold" as const },
        },
      },
    },
  };

  // Find anomalies (spikes in observed data)
  const anomalies = data.observedCases
    .map((cases, index) => ({ cases, index }))
    .filter((item) => item.cases && item.cases > 65).length;

  return (
    <div className="h-full flex flex-col">
      {/* Chart */}
      <div className="flex-1 min-h-[160px] lg:min-h-[200px]">
        <Line data={chartData} options={options} />
      </div>

      {/* Anomaly alerts */}
      {anomalies > 0 && (
        <div className="mt-3 p-2 lg:p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 text-xs lg:text-sm">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="text-amber-700 font-medium">
              {anomalies} anomaly point{anomalies !== 1 ? "s" : ""} detected
            </span>
          </div>
        </div>
      )}

      {/* Key metrics */}
      <div className="mt-3 grid grid-cols-3 gap-2 lg:gap-3">
        <div className="p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <div className="text-xs text-gray-500 mb-1">Current</div>
          <div className="text-sm lg:text-lg font-bold text-[#758db9]">
            {data.observedCases.filter((c) => c !== null).slice(-1)[0] || 0}
          </div>
        </div>
        <div className="p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <div className="text-xs text-gray-500 mb-1">7-Day Avg</div>
          <div className="text-sm lg:text-lg font-bold text-[#f3bdc8]">
            {Math.round(
              data.rollingAverage.filter((c) => c !== null).slice(-1)[0] || 0
            )}
          </div>
        </div>
        <div className="p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <div className="text-xs text-gray-500 mb-1">Predicted</div>
          <div className="text-sm lg:text-lg font-bold text-red-600">
            {Math.round(data.predictedCases.filter((c) => c !== null)[0] || 0)}
          </div>
        </div>
      </div>

      {/* Simulation indicator */}
      {isSimulating && (
        <div className="mt-3 p-2 lg:p-3 bg-red-50 border border-red-200 rounded-lg text-center">
          <div className="text-xs lg:text-sm text-red-700 font-medium">
            📈 OUTBREAK SIMULATION: Cases spiking rapidly
          </div>
        </div>
      )}
    </div>
  );
}
