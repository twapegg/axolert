"use client";

import React, { useState } from "react";
import { Line } from "react-chartjs-2";
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
import {
  Calendar,
  Bed,
  Pill,
  Zap,
  AlertTriangle,
  Clock,
  TrendingDown,
} from "lucide-react";
import { predictionData, shortageAlerts } from "../data/sampleData";

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

interface ResourceTimelineProps {
  isSimulating: boolean;
}

type ResourceType = "beds" | "medicines" | "oxygen" | "shortages";
type ForecastHorizon = 7 | 14 | 30;

interface TabConfig {
  id: ResourceType;
  label: string;
  icon: React.ReactNode;
  availableColor: string;
  demandColor: string;
  ciColor: string;
}

const tabs: TabConfig[] = [
  {
    id: "beds",
    label: "Beds",
    icon: <Bed className="w-4 h-4" />,
    availableColor: "#758db9",
    demandColor: "#f3bdc8",
    ciColor: "#f3bdc840",
  },
  {
    id: "medicines",
    label: "Medicines",
    icon: <Pill className="w-4 h-4" />,
    availableColor: "#758db9",
    demandColor: "#f3bdc8",
    ciColor: "#f3bdc840",
  },
  {
    id: "oxygen",
    label: "Oxygen",
    icon: <Zap className="w-4 h-4" />,
    availableColor: "#758db9",
    demandColor: "#f3bdc8",
    ciColor: "#f3bdc840",
  },
  {
    id: "shortages",
    label: "Shortages",
    icon: <AlertTriangle className="w-4 h-4" />,
    availableColor: "#ef4444",
    demandColor: "#f97316",
    ciColor: "#f9731640",
  },
];

const horizonOptions = [
  { value: 7 as ForecastHorizon, label: "7 days" },
  { value: 14 as ForecastHorizon, label: "14 days" },
  { value: 30 as ForecastHorizon, label: "30 days" },
];

// Helper functions for shortage alerts
function getSeverityColor(severity: string): string {
  switch (severity) {
    case "low":
      return "text-yellow-600 border-yellow-200 bg-yellow-50";
    case "medium":
      return "text-orange-600 border-orange-200 bg-orange-50";
    case "high":
      return "text-red-600 border-red-200 bg-red-50";
    default:
      return "text-[#6b7280] border-[#6b7280]";
  }
}

function getSeverityBg(severity: string): string {
  switch (severity) {
    case "low":
      return "bg-[#FFD700]/10";
    case "medium":
      return "bg-[#FF7A00]/10";
    case "high":
      return "bg-[#FF4D4F]/10";
    default:
      return "bg-[#6b7280]/10";
  }
}

function formatShortage(shortage: number): string {
  return shortage < 0 ? shortage.toString() : `+${shortage}`;
}

export default function ResourceTimeline({
  isSimulating,
}: ResourceTimelineProps) {
  const [activeTab, setActiveTab] = useState<ResourceType>("beds");
  const [forecastHorizon, setForecastHorizon] = useState<ForecastHorizon>(14);

  const getChartData = (resourceType: ResourceType) => {
    const tab = tabs.find((t) => t.id === resourceType)!;

    // Get data based on forecast horizon
    const horizonData = predictionData.slice(0, forecastHorizon);
    const dates = horizonData.map((d) =>
      new Date(d.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    );

    let availableData: number[];
    let demandData: number[];
    let upperCiData: number[];
    let lowerCiData: number[];

    const simMultiplier = isSimulating ? 1.5 : 1;

    switch (resourceType) {
      case "beds":
        availableData = Array(horizonData.length).fill(1200); // Static available beds
        demandData = horizonData.map((d) => d.bedsNeeded * simMultiplier);
        upperCiData = demandData.map((d) => d * 1.2); // 20% upper CI
        lowerCiData = demandData.map((d) => d * 0.8); // 20% lower CI
        break;
      case "medicines":
        availableData = Array(horizonData.length).fill(5000); // Static medicine stock
        demandData = horizonData.map((d) => d.medicinesNeeded * simMultiplier);
        upperCiData = demandData.map((d) => d * 1.25);
        lowerCiData = demandData.map((d) => d * 0.75);
        break;
      case "oxygen":
        availableData = Array(horizonData.length).fill(800); // Static oxygen tanks
        demandData = horizonData.map(
          (d, i) => (d.bedsNeeded * 0.3 + i * 10) * simMultiplier
        ); // Oxygen based on bed usage
        upperCiData = demandData.map((d) => d * 1.3);
        lowerCiData = demandData.map((d) => d * 0.7);
        break;
      default:
        availableData = [];
        demandData = [];
        upperCiData = [];
        lowerCiData = [];
        break;
    }

    // Find shortage point
    const shortageIndex = demandData.findIndex(
      (demand, index) => demand > availableData[index]
    );
    const daysUntilShortage = shortageIndex !== -1 ? shortageIndex + 1 : null;

    return {
      labels: dates,
      datasets: [
        {
          label: `${tab.label} Available`,
          data: availableData,
          borderColor: tab.availableColor,
          backgroundColor: `${tab.availableColor}20`,
          fill: false,
          tension: 0,
          borderWidth: 3,
          pointRadius: 0,
          borderDash: [5, 5],
        },
        {
          label: `Predicted Demand`,
          data: demandData,
          borderColor: tab.demandColor,
          backgroundColor: "transparent",
          fill: false,
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: tab.demandColor,
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 4,
        },
        {
          label: "Upper CI",
          data: upperCiData,
          borderColor: "transparent",
          backgroundColor: tab.ciColor,
          fill: "+1",
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 0,
        },
        {
          label: "Lower CI",
          data: lowerCiData,
          borderColor: "transparent",
          backgroundColor: tab.ciColor,
          fill: "-1",
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 0,
        },
      ],
      shortageIndex,
      daysUntilShortage,
    };
  };

  const chartData = getChartData(activeTab);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#ffffff",
          usePointStyle: true,
          padding: 12,
          font: { size: 10 },
          filter: function (legendItem: { text: string }) {
            return !legendItem.text.includes("CI");
          },
        },
      },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#1e293b",
        bodyColor: "#64748b",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context: {
            datasetIndex: number;
            formattedValue: string;
          }) {
            if (context.datasetIndex === 0) {
              return `Available: ${context.formattedValue}`;
            } else if (context.datasetIndex === 1) {
              return `Predicted Demand: ${context.formattedValue}`;
            }
            return "";
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "#e2e8f0",
          drawBorder: false,
        },
        ticks: {
          color: "#64748b",
          font: { size: 11 },
        },
        title: {
          display: true,
          text: `${forecastHorizon}-Day Forecast`,
          color: "#475569",
          font: { size: 12, weight: "bold" as const },
        },
      },
      y: {
        grid: {
          color: "#e2e8f0",
          drawBorder: false,
        },
        ticks: {
          color: "#64748b",
          font: { size: 11 },
        },
        title: {
          display: true,
          text: "Count",
          color: "#475569",
          font: { size: 12, weight: "bold" as const },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs and Controls */}
      <div className="flex flex-col gap-2 lg:gap-3 mb-3">
        {/* Resource Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-1.5 px-2 lg:px-3 py-1.5 lg:py-2 rounded-md text-xs lg:text-sm font-medium transition-all duration-200
                ${
                  activeTab === tab.id
                    ? "bg-white text-[#758db9] shadow-sm transform scale-[1.02]"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }
              `}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Forecast Horizon Selector (only for resource tabs) */}
        {activeTab !== "shortages" && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-xs lg:text-sm text-gray-600">
                Forecast:
              </span>
            </div>
            <div className="flex gap-1">
              {horizonOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setForecastHorizon(option.value)}
                  className={`
                    px-2 lg:px-3 py-1 lg:py-1.5 text-xs lg:text-sm rounded-lg transition-all duration-200
                    ${
                      forecastHorizon === option.value
                        ? "bg-[#758db9] text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      {activeTab === "shortages" ? (
        /* Shortage Alerts */
        <div className="flex-1 overflow-y-auto space-y-2">
          {(() => {
            // Simulate additional critical alerts during outbreak simulation
            const simulationAlerts = [
              {
                location: "Guadalupe",
                resource: "ICU Beds",
                shortage: -35,
                daysUntil: 1,
                severity: "high" as const,
              },
              {
                location: "Mandaue Centro",
                resource: "Emergency Beds",
                shortage: -50,
                daysUntil: 2,
                severity: "high" as const,
              },
              {
                location: "Lahug",
                resource: "Vaccines",
                shortage: -75,
                daysUntil: 3,
                severity: "medium" as const,
              },
            ];

            const allAlerts = isSimulating
              ? [...shortageAlerts, ...simulationAlerts]
              : shortageAlerts;

            return allAlerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-lg ${getSeverityBg(
                  alert.severity
                )} ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium text-sm">
                        {alert.location}
                      </span>
                    </div>
                    <p className="text-xs opacity-90 mb-2">
                      {alert.resource} shortage predicted
                    </p>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        <span className="font-bold">
                          {formatShortage(alert.shortage)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {alert.daysUntil} day
                          {alert.daysUntil !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(
                      alert.severity
                    )}`}
                  >
                    {alert.severity.toUpperCase()}
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>
      ) : (
        /* Chart View */
        <>
          {/* Days Until Shortage Badge */}
          {chartData.daysUntilShortage && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-red-700 font-medium">
                  ⚠️ Shortage predicted in {chartData.daysUntilShortage} days
                </span>
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="flex-1 min-h-[140px] lg:min-h-[180px]">
            <Line data={chartData} options={options} />
          </div>

          {/* Resource metrics */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="p-2 lg:p-3 bg-gray-50 rounded border border-gray-200 text-center">
              <div className="text-xs text-gray-500">Available</div>
              <div className="text-sm lg:text-base font-bold text-[#758db9]">
                {chartData.datasets[0]?.data[0]?.toLocaleString() || "0"}
              </div>
            </div>
            <div className="p-2 lg:p-3 bg-gray-50 rounded border border-gray-200 text-center">
              <div className="text-xs text-gray-500">Current Demand</div>
              <div className="text-sm lg:text-base font-bold text-[#f3bdc8]">
                {chartData.datasets[1]?.data[0]?.toLocaleString() || "0"}
              </div>
            </div>
            <div className="p-2 lg:p-3 bg-gray-50 rounded border border-gray-200 text-center">
              <div className="text-xs text-gray-500">Peak Demand</div>
              <div className="text-sm lg:text-base font-bold text-red-600">
                {chartData.datasets[1]?.data.length > 0
                  ? Math.max(...chartData.datasets[1].data).toLocaleString()
                  : "0"}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Simulation indicator */}
      {isSimulating && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-center">
          <div className="text-xs text-red-700 font-medium">
            ⚠️ SIMULATION: Demand increased by 50%
          </div>
        </div>
      )}
    </div>
  );
}
