"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Activity, MapPin, BarChart3, Gauge, Zap } from "lucide-react";
import { useClientDate } from "./hooks/useClientDate";

// Dynamically import components to avoid SSR issues with map libraries
const HeatmapPanel = dynamic(() => import("./components/HeatmapPanel"), {
  ssr: false,
});
const CasesChart = dynamic(() => import("./components/CasesChart"), {
  ssr: false,
});
const ResourceTimeline = dynamic(
  () => import("./components/ResourceTimeline"),
  { ssr: false }
);
const AIRecommendations = dynamic(
  () => import("./components/AIRecommendations"),
  { ssr: false }
);

export default function AxolertDashboard() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [heatmapView, setHeatmapView] = useState<
    "barangay" | "health-institutions"
  >("barangay");
  const currentDate = useClientDate();

  const handleSimulateOutbreak = () => {
    setIsSimulating(!isSimulating);
  };

  const handleViewToggle = (view: "barangay" | "health-institutions") => {
    setHeatmapView(view);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] text-gray-900 font-inter">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4 lg:p-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#f3bdc8] to-[#758db9] rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-[#f3bdc8] to-[#758db9] bg-clip-text text-transparent">
                Axolert
              </h1>
              <p className="text-sm text-gray-600">
                Predictive Health Intelligence Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSimulateOutbreak}
              className={`group flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                isSimulating
                  ? "bg-gradient-to-r from-[#f3bdc8] to-[#758db9] text-white shadow-lg shadow-[#f3bdc8]/25 hover:shadow-[#f3bdc8]/40"
                  : "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
              } hover:scale-105 transform`}
            >
              <Zap className="w-4 h-4 transition-transform group-hover:rotate-12" />
              {isSimulating ? "Stop Simulation" : "Simulate Outbreak"}
            </button>

            <div className="hidden lg:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Region VII</p>
                <p className="text-xs text-[#758db9] font-medium">
                  {currentDate ? `Updated ${currentDate}` : "Loading..."}
                </p>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#f3bdc8] animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <main className="max-w-7xl mx-auto p-3 lg:p-6 space-y-4 lg:space-y-6">
        {/* Main Heatmap Section */}
        <div className="grid grid-cols-1 gap-4 lg:gap-6">
          {/* Heatmap - Full Width */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-4 lg:p-6 shadow-xl shadow-gray-900/5 h-[450px] lg:h-[500px]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#f3bdc8] to-[#758db9] rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base lg:text-lg font-bold text-gray-900">
                    Regional Health Map
                  </h2>
                  <p className="text-xs lg:text-sm text-gray-600">
                    Real-time disease surveillance
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
                {/* View Toggle */}
                <div className="flex bg-gray-100 rounded-xl p-1 w-full sm:w-auto">
                  <button
                    onClick={() => handleViewToggle("barangay")}
                    className={`px-3 lg:px-4 py-2 text-sm font-medium rounded-lg transition-all flex-1 sm:flex-none ${
                      heatmapView === "barangay"
                        ? "bg-white text-[#758db9] shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Communities
                  </button>
                  <button
                    onClick={() => handleViewToggle("health-institutions")}
                    className={`px-3 lg:px-4 py-2 text-sm font-medium rounded-lg transition-all flex-1 sm:flex-none ${
                      heatmapView === "health-institutions"
                        ? "bg-white text-[#758db9] shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Facilities
                  </button>
                </div>

                {/* Legend */}
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 w-full sm:w-auto">
                  <h4 className="text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                    {heatmapView === "barangay"
                      ? isSimulating
                        ? "Outbreak Level"
                        : "Risk Level"
                      : isSimulating
                      ? "Facility Stress"
                      : "Capacity Status"}
                  </h4>
                  <div className="flex flex-wrap gap-3 lg:gap-4 text-xs">
                    {heatmapView === "barangay" ? (
                      isSimulating ? (
                        <>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-gray-700 font-medium">
                              Critical
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            <span className="text-gray-700 font-medium">
                              High
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="text-gray-700 font-medium">
                              Low
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span className="text-gray-700 font-medium">
                              Moderate
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            <span className="text-gray-700 font-medium">
                              High
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-gray-700 font-medium">
                              Critical
                            </span>
                          </div>
                        </>
                      )
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                          <span className="text-gray-700 font-medium">
                            Normal
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <span className="text-gray-700 font-medium">
                            Busy
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          <span className="text-gray-700 font-medium">
                            Stressed
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span className="text-gray-700 font-medium">
                            Critical
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[calc(100%-120px)] lg:h-[calc(100%-140px)] rounded-xl overflow-hidden border border-gray-200">
              <HeatmapPanel
                isSimulating={isSimulating}
                currentView={heatmapView}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section - Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Cases Chart */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-4 lg:p-6 shadow-xl shadow-gray-900/5 h-[380px] lg:h-[400px]">
            <div className="flex items-center gap-3 mb-4 lg:mb-6">
              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-[#f3bdc8] to-[#758db9] rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base lg:text-lg font-bold text-gray-900">
                  Disease Trends
                </h2>
                <p className="text-xs lg:text-sm text-gray-600">
                  Cases & predictions
                </p>
              </div>
            </div>
            <div className="h-[calc(100%-70px)] lg:h-[calc(100%-80px)]">
              <CasesChart isSimulating={isSimulating} />
            </div>
          </div>

          {/* Resource Timeline */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-4 lg:p-6 shadow-xl shadow-gray-900/5 h-[380px] lg:h-[400px]">
            <div className="flex items-center gap-3 mb-4 lg:mb-6">
              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-[#758db9] to-[#f3bdc8] rounded-lg flex items-center justify-center">
                <Gauge className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base lg:text-lg font-bold text-gray-900">
                  Resource Monitor
                </h2>
                <p className="text-xs lg:text-sm text-gray-600">
                  Supply & demand
                </p>
              </div>
            </div>
            <div className="h-[calc(100%-60px)] lg:h-[calc(100%-80px)] overflow-hidden">
              <ResourceTimeline isSimulating={isSimulating} />
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-4 lg:p-6 shadow-xl shadow-gray-900/5 h-[380px] lg:h-[400px] overflow-hidden md:col-span-2 lg:col-span-1">
            <AIRecommendations isSimulating={isSimulating} />
          </div>
        </div>
      </main>
    </div>
  );
}
