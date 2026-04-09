"use client";

import { useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Building, Bed, Zap, Heart, Gauge } from "lucide-react";
import { hospitalData } from "../data/sampleData";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
);

interface HospitalCapacityProps {
  isSimulating: boolean;
}

type ViewType = "capacity" | "forecast";

interface CapacityMetric {
  id: string;
  label: string;
  icon: React.ReactNode;
  current: number;
  capacity: number;
  unit: string;
  thresholds: {
    good: number;
    warning: number;
  };
}

export default function HospitalCapacity({
  isSimulating,
}: HospitalCapacityProps) {
  const [activeView, setActiveView] = useState<ViewType>("capacity");
  const [selectedHospitalId, setSelectedHospitalId] = useState(
    hospitalData[0].id
  );

  const selectedHospital =
    hospitalData.find((h) => h.id === selectedHospitalId) || hospitalData[0];
  const getMetrics = (): CapacityMetric[] => {
    const simMultiplier = isSimulating ? 1.3 : 1;

    // Use selected hospital data instead of aggregated data
    const occupiedBeds =
      selectedHospital.totalBeds - selectedHospital.availableBeds;
    const occupiedIcuBeds =
      selectedHospital.icuBeds - selectedHospital.availableIcuBeds;

    // Mock data for oxygen and staff based on hospital size
    const hospitalSizeFactor = selectedHospital.totalBeds / 400; // Normalize to largest hospital
    const oxygenStock = Math.round(450 * hospitalSizeFactor);
    const oxygenCapacity = Math.round(600 * hospitalSizeFactor);
    const staffAvailable = Math.round(340 * hospitalSizeFactor);
    const staffTotal = Math.round(450 * hospitalSizeFactor);

    return [
      {
        id: "beds",
        label: "Bed Occupancy",
        icon: <Bed className="w-4 h-4" />,
        current: Math.round(occupiedBeds * simMultiplier),
        capacity: selectedHospital.totalBeds,
        unit: "beds",
        thresholds: { good: 0.7, warning: 0.85 },
      },
      {
        id: "icu",
        label: "ICU Usage",
        icon: <Heart className="w-4 h-4" />,
        current: Math.round(occupiedIcuBeds * simMultiplier),
        capacity: selectedHospital.icuBeds,
        unit: "units",
        thresholds: { good: 0.6, warning: 0.8 },
      },
      {
        id: "oxygen",
        label: "Oxygen Stock",
        icon: <Zap className="w-4 h-4" />,
        current: isSimulating
          ? Math.max(0, oxygenStock - Math.round(150 * hospitalSizeFactor))
          : oxygenStock,
        capacity: oxygenCapacity,
        unit: "tanks",
        thresholds: { good: 0.5, warning: 0.3 },
      },
      {
        id: "staff",
        label: "Staff Available",
        icon: <Building className="w-4 h-4" />,
        current: isSimulating
          ? Math.max(0, staffAvailable - Math.round(20 * hospitalSizeFactor))
          : staffAvailable,
        capacity: staffTotal,
        unit: "staff",
        thresholds: { good: 0.7, warning: 0.5 },
      },
    ];
  };

  const getStatusColor = (metric: CapacityMetric): string => {
    const percentage = metric.current / metric.capacity;

    // For oxygen and staff, lower is worse
    if (metric.id === "oxygen" || metric.id === "staff") {
      if (percentage <= metric.thresholds.warning) return "#FF4D4F"; // Critical
      if (percentage <= metric.thresholds.good) return "#FFB84D"; // Warning
      return "#00E5B0"; // Good
    }

    // For beds and ICU, higher is worse
    if (percentage >= metric.thresholds.warning) return "#FF4D4F"; // Critical
    if (percentage >= metric.thresholds.good) return "#FFB84D"; // Warning
    return "#00E5B0"; // Good
  };

  const createChartData = (metric: CapacityMetric) => {
    const statusColor = getStatusColor(metric);
    const percentage = (metric.current / metric.capacity) * 100;
    const remaining = 100 - percentage;

    return {
      datasets: [
        {
          data: [percentage, remaining],
          backgroundColor: [statusColor, "#27272a"],
          borderColor: ["#ffffff", "#27272a"],
          borderWidth: 1,
          cutout: "70%",
          rotation: -90,
          circumference: 180,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    elements: {
      arc: {
        borderWidth: 0,
      },
    },
  };

  const metrics = getMetrics();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <Building className="w-5 h-5 text-[#00A3FF]" />
        <h3 className="text-sm font-bold text-white">Hospital Monitor</h3>
      </div>

      {/* Hospital Selector */}
      <div className="mb-3">
        <select
          value={selectedHospitalId}
          onChange={(e) => setSelectedHospitalId(e.target.value)}
          className="w-full p-2 bg-[#1a1a24] border border-[#27272a] rounded text-xs text-white focus:outline-none focus:border-[#00A3FF]"
        >
          {hospitalData.map((hospital) => (
            <option key={hospital.id} value={hospital.id}>
              {hospital.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-3 bg-[#27272a] p-1 rounded-lg">
        <button
          onClick={() => setActiveView("capacity")}
          className={`
            flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200
            ${
              activeView === "capacity"
                ? "bg-[#00A3FF] text-white shadow-lg transform scale-[1.02]"
                : "text-[#a1a1aa] hover:text-white hover:bg-[#1a1a24]"
            }
          `}
        >
          <Gauge className="w-4 h-4" />
          Capacity
        </button>
        <button
          onClick={() => setActiveView("forecast")}
          className={`
            flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200
            ${
              activeView === "forecast"
                ? "bg-[#00A3FF] text-white shadow-lg transform scale-[1.02]"
                : "text-[#a1a1aa] hover:text-white hover:bg-[#1a1a24]"
            }
          `}
        >
          <Building className="w-4 h-4" />
          Facilities
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeView === "capacity" ? (
          /* Capacity View */
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {metrics.map((metric) => {
                const percentage = Math.round(
                  (metric.current / metric.capacity) * 100
                );
                const statusColor = getStatusColor(metric);

                return (
                  <div
                    key={metric.id}
                    className="p-2 bg-[#1a1a24] border border-[#27272a] rounded-lg flex flex-col"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <div style={{ color: statusColor }}>{metric.icon}</div>
                        <span className="text-xs font-medium text-white truncate">
                          {metric.label}
                        </span>
                      </div>
                    </div>

                    {/* Chart */}
                    <div className="relative h-12 mb-1">
                      <Doughnut
                        data={createChartData(metric)}
                        options={chartOptions}
                      />
                      {/* Center text */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="text-xs font-bold"
                          style={{ color: statusColor }}
                        >
                          {percentage}%
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="text-center">
                      <div className="text-xs text-[#a1a1aa]">
                        {metric.current.toLocaleString()} /{" "}
                        {metric.capacity.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Overall Status */}
            <div className="p-2 bg-[#1a1a24] border border-[#27272a] rounded-lg mb-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#a1a1aa]">Overall Status:</span>
                <span className="text-xs font-medium">
                  {metrics.some((m) => getStatusColor(m) === "#FF4D4F") ? (
                    <span className="text-[#FF4D4F]">⚠️ Critical</span>
                  ) : metrics.some((m) => getStatusColor(m) === "#FFB84D") ? (
                    <span className="text-[#FFB84D]">⚠️ Warning</span>
                  ) : (
                    <span className="text-[#00E5B0]">✅ Normal</span>
                  )}
                </span>
              </div>
            </div>
          </>
        ) : (
          /* Facilities Overview */
          <div className="h-full overflow-y-auto">
            <div className="mb-3 text-xs text-[#a1a1aa] text-center">
              Current capacity across all major facilities
            </div>
            <div className="grid grid-cols-1 gap-3">
              {hospitalData.map((hospital) => {
                const bedUtilization =
                  ((hospital.totalBeds - hospital.availableBeds) /
                    hospital.totalBeds) *
                  100;
                const icuUtilization =
                  ((hospital.icuBeds - hospital.availableIcuBeds) /
                    hospital.icuBeds) *
                  100;

                // Mock oxygen data based on hospital size
                const hospitalSizeFactor = hospital.totalBeds / 400;
                const oxygenCapacity = Math.round(600 * hospitalSizeFactor);
                const oxygenStock = isSimulating
                  ? Math.max(
                      0,
                      Math.round(450 * hospitalSizeFactor) -
                        Math.round(150 * hospitalSizeFactor)
                    )
                  : Math.round(450 * hospitalSizeFactor);
                const oxygenUtilization =
                  100 - (oxygenStock / oxygenCapacity) * 100;

                const getUtilizationColor = (percentage: number) => {
                  if (percentage < 70) return "#00E5B0"; // Green
                  if (percentage < 85) return "#FFB84D"; // Yellow
                  return "#FF4D4F"; // Red
                };

                const createMiniChartData = (
                  percentage: number,
                  color: string
                ) => ({
                  datasets: [
                    {
                      data: [percentage, 100 - percentage],
                      backgroundColor: [color, "#27272a"],
                      borderColor: ["#ffffff", "#27272a"],
                      borderWidth: 1,
                      cutout: "75%",
                    },
                  ],
                });

                const miniChartOptions = {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false },
                  },
                  elements: { arc: { borderWidth: 0 } },
                };

                return (
                  <div
                    key={hospital.id}
                    onClick={() => setSelectedHospitalId(hospital.id)}
                    className={`
                      p-3 bg-[#1a1a24] border rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02]
                      ${
                        selectedHospitalId === hospital.id
                          ? "border-[#00A3FF] shadow-lg"
                          : "border-[#27272a] hover:border-[#00A3FF]"
                      }
                    `}
                  >
                    <h4 className="text-xs font-medium text-white mb-2 truncate">
                      {hospital.name}
                    </h4>

                    <div className="grid grid-cols-3 gap-2">
                      {/* Bed Occupancy */}
                      <div className="text-center">
                        <div className="relative h-12 w-12 mx-auto mb-1">
                          <Doughnut
                            data={createMiniChartData(
                              bedUtilization,
                              getUtilizationColor(bedUtilization)
                            )}
                            options={miniChartOptions}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className="text-xs font-bold"
                              style={{
                                color: getUtilizationColor(bedUtilization),
                              }}
                            >
                              {Math.round(bedUtilization)}%
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-[#a1a1aa]">Beds</div>
                        <div className="text-xs text-white">
                          {hospital.totalBeds - hospital.availableBeds}/
                          {hospital.totalBeds}
                        </div>
                      </div>

                      {/* ICU Utilization */}
                      <div className="text-center">
                        <div className="relative h-12 w-12 mx-auto mb-1">
                          <Doughnut
                            data={createMiniChartData(
                              icuUtilization,
                              getUtilizationColor(icuUtilization)
                            )}
                            options={miniChartOptions}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className="text-xs font-bold"
                              style={{
                                color: getUtilizationColor(icuUtilization),
                              }}
                            >
                              {Math.round(icuUtilization)}%
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-[#a1a1aa]">ICU</div>
                        <div className="text-xs text-white">
                          {hospital.icuBeds - hospital.availableIcuBeds}/
                          {hospital.icuBeds}
                        </div>
                      </div>

                      {/* Oxygen Tanks */}
                      <div className="text-center">
                        <div className="relative h-12 w-12 mx-auto mb-1">
                          <Doughnut
                            data={createMiniChartData(
                              oxygenUtilization,
                              getUtilizationColor(
                                100 - (oxygenStock / oxygenCapacity) * 100
                              )
                            )}
                            options={miniChartOptions}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className="text-xs font-bold"
                              style={{
                                color: getUtilizationColor(
                                  100 - (oxygenStock / oxygenCapacity) * 100
                                ),
                              }}
                            >
                              {Math.round((oxygenStock / oxygenCapacity) * 100)}
                              %
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-[#a1a1aa]">O₂</div>
                        <div className="text-xs text-white">
                          {oxygenStock}/{oxygenCapacity}
                        </div>
                      </div>
                    </div>

                    {/* Click indicator */}
                    <div className="mt-2 text-xs text-[#00A3FF] text-center opacity-60">
                      Click to select facility
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 p-2 bg-[#1a1a24] border border-[#27272a] rounded-lg">
              <div className="text-xs text-[#a1a1aa] mb-2 text-center">
                Status Legend
              </div>
              <div className="flex justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#00E5B0]"></div>
                  <span className="text-[#a1a1aa]">&lt;70% Normal</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#FFB84D]"></div>
                  <span className="text-[#a1a1aa]">70-85% Warning</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#FF4D4F]"></div>
                  <span className="text-[#a1a1aa]">&gt;85% Critical</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Simulation indicator */}
      {isSimulating && (
        <div className="mt-2 p-2 bg-[#FF4D4F]/20 border border-[#FF4D4F] rounded text-center">
          <div className="text-xs text-[#FF4D4F] font-medium">
            🚨 SIMULATION: Increased demand
          </div>
        </div>
      )}
    </div>
  );
}
