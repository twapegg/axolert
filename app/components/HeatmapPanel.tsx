"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import {
  barangayData,
  hospitalData,
  type BarangayData,
  type Hospital,
} from "../data/sampleData";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface HeatmapPanelProps {
  isSimulating: boolean;
  currentView?: ViewType;
  onViewChange?: (view: ViewType) => void;
}

type ViewType = "barangay" | "health-institutions";

interface ProcessedBarangayData extends BarangayData {
  casesToday: number;
  casesLast7Days: number;
  casesLast30Days: number;
  topDiseases: { name: string; cases: number }[];
  colorBin: "green" | "yellow" | "orange" | "red";
}

interface ProcessedHospitalData extends Hospital {
  casesToday: number;
  casesLast7Days: number;
  casesLast30Days: number;
  capacityUsage: number;
  icuUsage: number;
  colorBin: "green" | "yellow" | "orange" | "red";
  status: "operational" | "stressed" | "overwhelmed";
}

// Simulate population data for incidence calculation (per 10k population)
const populationData: Record<string, number> = {
  guadalupe: 85000,
  lahug: 42000,
  banilad: 38000,
  talamban: 65000,
  apas: 28000,
  capitol: 15000,
  mandaue_centro: 95000,
  alang_alang: 45000,
  subangdaku: 55000,
  looc: 35000,
  lapu_lapu_centro: 78000,
  basak: 62000,
  pajac: 48000,
};

// Disease case data generator
function generateDiseaseData(
  barangayId: string,
  isSimulating: boolean
): { name: string; cases: number }[] {
  const diseaseTemplates = {
    guadalupe: [
      { name: "Dengue", baseCases: 200 },
      { name: "Tuberculosis", baseCases: 150 },
      { name: "Hypertension", baseCases: 180 },
    ],
    lahug: [
      { name: "Dengue", baseCases: 120 },
      { name: "Diabetes", baseCases: 95 },
      { name: "Pneumonia", baseCases: 85 },
    ],
    banilad: [
      { name: "Dengue", baseCases: 90 },
      { name: "Asthma", baseCases: 110 },
      { name: "Hypertension", baseCases: 75 },
    ],
    talamban: [
      { name: "Dengue", baseCases: 160 },
      { name: "Tuberculosis", baseCases: 80 },
      { name: "Gastroenteritis", baseCases: 95 },
    ],
    apas: [
      { name: "HIV/AIDS", baseCases: 45 },
      { name: "Dengue", baseCases: 65 },
      { name: "Diabetes", baseCases: 55 },
    ],
    capitol: [
      { name: "Dengue", baseCases: 35 },
      { name: "Hypertension", baseCases: 40 },
      { name: "Pneumonia", baseCases: 25 },
    ],
    mandaue_centro: [
      { name: "Dengue", baseCases: 220 },
      { name: "Tuberculosis", baseCases: 140 },
      { name: "Diabetes", baseCases: 165 },
    ],
    alang_alang: [
      { name: "Dengue", baseCases: 100 },
      { name: "Pneumonia", baseCases: 75 },
      { name: "Asthma", baseCases: 85 },
    ],
    subangdaku: [
      { name: "Dengue", baseCases: 125 },
      { name: "Hypertension", baseCases: 90 },
      { name: "Gastroenteritis", baseCases: 70 },
    ],
    looc: [
      { name: "Dengue", baseCases: 80 },
      { name: "Tuberculosis", baseCases: 55 },
      { name: "Diabetes", baseCases: 65 },
    ],
    lapu_lapu_centro: [
      { name: "Dengue", baseCases: 180 },
      { name: "Pneumonia", baseCases: 120 },
      { name: "Hypertension", baseCases: 140 },
    ],
    basak: [
      { name: "Dengue", baseCases: 140 },
      { name: "Asthma", baseCases: 95 },
      { name: "Tuberculosis", baseCases: 80 },
    ],
    pajac: [
      { name: "HIV/AIDS", baseCases: 5000 }, // Higher prevalence area
      { name: "Dengue", baseCases: 110 },
      { name: "Diabetes", baseCases: 85 },
    ],
  };

  const template = diseaseTemplates[
    barangayId as keyof typeof diseaseTemplates
  ] || [
    { name: "Dengue", baseCases: 50 },
    { name: "Hypertension", baseCases: 40 },
    { name: "Diabetes", baseCases: 30 },
  ];

  const simulationMultiplier = isSimulating ? 1.8 : 1;

  return template
    .map((disease) => ({
      name: disease.name,
      cases: Math.floor(disease.baseCases * simulationMultiplier),
    }))
    .sort((a, b) => b.cases - a.cases)
    .slice(0, 3);
}

function processBarangayData(isSimulating: boolean): ProcessedBarangayData[] {
  return barangayData.map((barangay) => {
    const population = populationData[barangay.id] || 50000; // Default population
    const simulationMultiplier = isSimulating ? 8.0 : 1; // Much higher multiplier for dramatic color changes

    // Calculate cases for different time periods
    const casesToday = Math.floor(
      barangay.predictedCases * 0.15 * simulationMultiplier
    );
    const casesLast7Days = Math.floor(
      casesToday * 7 + (Math.random() * 20 - 10)
    ); // Simulate weekly total
    const casesLast30Days = Math.floor(
      casesLast7Days * 4.2 + (Math.random() * 50 - 25)
    ); // Simulate monthly total

    // Generate disease case data
    const topDiseases = generateDiseaseData(barangay.id, isSimulating);

    // Determine color bin based on today's cases with improved thresholds
    const casesPerThousand = (casesToday / population) * 1000;
    let colorBin: "green" | "yellow" | "orange" | "red";

    if (isSimulating) {
      // During simulation, force dramatic color changes - ALWAYS red or orange
      if (casesToday >= 15) {
        colorBin = "red"; // Critical outbreak - very low threshold
      } else if (casesToday >= 8) {
        colorBin = "red"; // Still critical during outbreak
      } else if (casesToday >= 3) {
        colorBin = "orange"; // High risk during outbreak
      } else {
        colorBin = "orange"; // Force orange minimum during outbreak - no yellow/green
      }
    } else {
      // Normal thresholds based on both absolute cases and population ratio
      if (casesToday >= 50 || casesPerThousand >= 1.0) {
        colorBin = "red"; // Critical
      } else if (casesToday >= 25 || casesPerThousand >= 0.5) {
        colorBin = "orange"; // High
      } else if (casesToday >= 10 || casesPerThousand >= 0.2) {
        colorBin = "yellow"; // Moderate
      } else {
        colorBin = "green"; // Low
      }
    }

    return {
      ...barangay,
      casesToday,
      casesLast7Days,
      casesLast30Days,
      topDiseases,
      colorBin,
    };
  });
}

function processHospitalData(isSimulating: boolean): ProcessedHospitalData[] {
  return hospitalData.map((hospital) => {
    const simulationMultiplier = isSimulating ? 3.0 : 1;

    // Calculate patients/cases for hospitals
    const casesToday = Math.floor(
      (hospital.totalBeds - hospital.availableBeds) * 0.8 * simulationMultiplier
    );
    const casesLast7Days = Math.floor(
      casesToday * 7 + (Math.random() * 30 - 15)
    );
    const casesLast30Days = Math.floor(
      casesLast7Days * 4.2 + (Math.random() * 80 - 40)
    );

    // Calculate capacity usage
    const capacityUsage =
      ((hospital.totalBeds - hospital.availableBeds) / hospital.totalBeds) *
      100;
    const icuUsage =
      ((hospital.icuBeds - hospital.availableIcuBeds) / hospital.icuBeds) * 100;

    // Determine status and color based on capacity
    let status: "operational" | "stressed" | "overwhelmed";
    let colorBin: "green" | "yellow" | "orange" | "red";

    if (isSimulating) {
      // During simulation, hospitals are more stressed
      const adjustedCapacity = capacityUsage * simulationMultiplier;
      if (adjustedCapacity >= 90 || icuUsage >= 85) {
        status = "overwhelmed";
        colorBin = "red";
      } else if (adjustedCapacity >= 70 || icuUsage >= 70) {
        status = "stressed";
        colorBin = "orange";
      } else if (adjustedCapacity >= 50) {
        status = "stressed";
        colorBin = "yellow";
      } else {
        status = "operational";
        colorBin = "green";
      }
    } else {
      // Normal capacity thresholds
      if (capacityUsage >= 90 || icuUsage >= 90) {
        status = "overwhelmed";
        colorBin = "red";
      } else if (capacityUsage >= 75 || icuUsage >= 80) {
        status = "stressed";
        colorBin = "orange";
      } else if (capacityUsage >= 60) {
        status = "operational";
        colorBin = "yellow";
      } else {
        status = "operational";
        colorBin = "green";
      }
    }

    return {
      ...hospital,
      casesToday,
      casesLast7Days,
      casesLast30Days,
      capacityUsage: Math.min(
        capacityUsage * (isSimulating ? simulationMultiplier : 1),
        100
      ),
      icuUsage: Math.min(
        icuUsage * (isSimulating ? simulationMultiplier : 1),
        100
      ),
      colorBin,
      status,
    };
  });
}

function getColorFromBin(
  colorBin: "green" | "yellow" | "orange" | "red"
): string {
  switch (colorBin) {
    case "green":
      return "#10B981"; // Emerald green for low cases
    case "yellow":
      return "#F59E0B"; // Amber for moderate cases
    case "orange":
      return "#EF4444"; // Red-orange for high cases
    case "red":
      return "#DC2626"; // Deep red for critical cases
    default:
      return "#6B7280";
  }
}

function getRadiusFromCases(casesToday: number, isSimulating: boolean): number {
  const baseRadius = isSimulating ? 12 : 8;
  const scaleFactor = Math.min(casesToday / 50, 2); // Cap at 2x, scale based on daily cases
  return Math.max(baseRadius + scaleFactor * 8, baseRadius);
}

function getHospitalRadius(
  capacityUsage: number,
  isSimulating: boolean
): number {
  const baseRadius = isSimulating ? 14 : 10;
  const scaleFactor = Math.min(capacityUsage / 100, 2); // Scale based on capacity usage
  return Math.max(baseRadius + scaleFactor * 6, baseRadius);
}

// Custom hook to fit bounds
function MapController({ barangays }: { barangays: BarangayData[] }) {
  const map = useMap();

  useEffect(() => {
    if (barangays.length > 0) {
      const bounds = barangays.map((b) => b.coordinates);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, barangays]);

  return null;
}

export default function HeatmapPanel({
  isSimulating,
  currentView = "barangay",
  onViewChange,
}: HeatmapPanelProps) {
  const [processedData, setProcessedData] = useState<ProcessedBarangayData[]>(
    []
  );
  const [hospitalProcessedData, setHospitalProcessedData] = useState<
    ProcessedHospitalData[]
  >([]);
  const [mapKey, setMapKey] = useState(0); // Force map re-render
  const mapRef = useRef<L.Map | null>(null);

  // Process data when simulation state changes
  useEffect(() => {
    const processed = processBarangayData(isSimulating);
    const hospitalProcessed = processHospitalData(isSimulating);
    console.log("Processing data - isSimulating:", isSimulating);
    console.log("Current view:", currentView);
    console.log(
      "Sample processed data:",
      processed.slice(0, 2).map((d) => ({
        name: d.name,
        casesToday: d.casesToday,
        colorBin: d.colorBin,
      }))
    );
    setProcessedData(processed);
    setHospitalProcessedData(hospitalProcessed);
    setMapKey((prev) => prev + 1); // Force complete map re-render
  }, [isSimulating, currentView]);

  // If leaflet is not available (SSR), show loading
  if (typeof window === "undefined") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-slate-600">Loading heatmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer
        key={`map-${mapKey}`} // Force re-render with mapKey
        center={[10.3157, 123.9062]}
        zoom={11}
        className="w-full h-full rounded-xl border border-slate-200"
        style={{ minHeight: "350px" }}
        ref={mapRef}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution=""
        />

        <MapController barangays={barangayData} />

        {/* Render Barangay Circles */}
        {currentView === "barangay" &&
          processedData.map((barangay) => (
            <CircleMarker
              key={`${barangay.id}-${isSimulating ? "sim" : "norm"}-${
                barangay.casesToday
              }`}
              center={barangay.coordinates}
              radius={getRadiusFromCases(barangay.casesToday, isSimulating)}
              fillColor={getColorFromBin(barangay.colorBin)}
              color={
                isSimulating
                  ? barangay.colorBin === "red"
                    ? "#FECACA"
                    : barangay.colorBin === "orange"
                    ? "#FED7AA"
                    : "#FEF3C7"
                  : barangay.colorBin === "red"
                  ? "#FECACA"
                  : barangay.colorBin === "orange"
                  ? "#FED7AA"
                  : barangay.colorBin === "yellow"
                  ? "#FEF3C7"
                  : "#D1FAE5"
              }
              weight={
                isSimulating
                  ? barangay.colorBin === "red"
                    ? 4
                    : 3
                  : barangay.colorBin === "red"
                  ? 3
                  : 2
              }
              opacity={isSimulating ? 1 : barangay.colorBin === "red" ? 1 : 0.8}
              fillOpacity={
                isSimulating
                  ? barangay.colorBin === "red"
                    ? 0.95
                    : 0.85
                  : barangay.colorBin === "red"
                  ? 0.9
                  : barangay.colorBin === "orange"
                  ? 0.8
                  : 0.7
              }
              className={
                isSimulating
                  ? barangay.colorBin === "red"
                    ? "outbreak-glow"
                    : "moderate-glow"
                  : ""
              }
            >
              <Tooltip
                direction="top"
                offset={[0, -12]}
                opacity={0.95}
                className="custom-heatmap-tooltip"
              >
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden max-w-48">
                  {/* Simple header */}
                  <div
                    className={`px-3 py-2 text-white text-sm font-medium`}
                    style={{
                      backgroundColor: getColorFromBin(barangay.colorBin),
                    }}
                  >
                    {barangay.name}
                  </div>

                  {/* Compact content */}
                  <div className="p-3 space-y-2 text-xs">
                    {/* Key metric */}
                    <div className="text-center bg-blue-50 rounded px-2 py-1">
                      <div className="font-bold text-blue-700 text-sm">
                        {barangay.casesToday}
                      </div>
                      <div className="text-gray-500 text-xs">Cases Today</div>
                    </div>

                    {/* Compact stats */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last 7 Days:</span>
                        <span className="font-medium">
                          {barangay.casesLast7Days}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last 30 Days:</span>
                        <span className="font-medium text-blue-600">
                          {barangay.casesLast30Days}
                        </span>
                      </div>
                    </div>

                    {/* Top Diseases */}
                    <div className="border-t pt-2 mt-2">
                      <div className="text-gray-500 text-xs mb-1 font-medium">
                        Top Diseases:
                      </div>
                      <div className="space-y-1">
                        {barangay.topDiseases.map((disease, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-gray-600 text-xs">
                              {disease.name}:
                            </span>
                            <span className="font-medium text-xs">
                              {disease.cases.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}

        {/* Render Hospital Markers */}
        {currentView === "health-institutions" &&
          hospitalProcessedData.map((hospital) => (
            <CircleMarker
              key={`hospital-${hospital.id}-${isSimulating ? "sim" : "norm"}-${
                hospital.casesToday
              }`}
              center={hospital.coordinates}
              radius={getHospitalRadius(hospital.capacityUsage, isSimulating)}
              fillColor={getColorFromBin(hospital.colorBin)}
              color={
                hospital.colorBin === "red"
                  ? "#FECACA"
                  : hospital.colorBin === "orange"
                  ? "#FED7AA"
                  : hospital.colorBin === "yellow"
                  ? "#FEF3C7"
                  : "#D1FAE5"
              }
              weight={
                hospital.colorBin === "red"
                  ? 4
                  : hospital.colorBin === "orange"
                  ? 3
                  : 2
              }
              opacity={1}
              fillOpacity={0.8}
              className={
                isSimulating && hospital.colorBin === "red"
                  ? "outbreak-glow"
                  : ""
              }
            >
              <Tooltip
                direction="top"
                offset={[0, -12]}
                opacity={0.95}
                className="custom-heatmap-tooltip"
              >
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden max-w-64">
                  {/* Hospital header */}
                  <div
                    className={`px-3 py-2 text-white text-sm font-medium`}
                    style={{
                      backgroundColor: getColorFromBin(hospital.colorBin),
                    }}
                  >
                    🏥 {hospital.name}
                  </div>

                  {/* Hospital content */}
                  <div className="p-3 space-y-2 text-xs">
                    {/* Status */}
                    <div className="text-center bg-blue-50 rounded px-2 py-1">
                      <div className="font-bold text-blue-700 text-sm capitalize">
                        {hospital.status}
                      </div>
                      <div className="text-gray-500 text-xs">
                        Current Status
                      </div>
                    </div>

                    {/* Capacity stats */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Bed Capacity:</span>
                        <span className="font-medium">
                          {Math.round(hospital.capacityUsage)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">ICU Usage:</span>
                        <span className="font-medium">
                          {Math.round(hospital.icuUsage)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Available Beds:</span>
                        <span className="font-medium text-green-600">
                          {hospital.availableBeds}
                        </span>
                      </div>
                    </div>

                    {/* Resources */}
                    <div className="border-t pt-2 mt-2">
                      <div className="text-gray-500 text-xs mb-1 font-medium">
                        Resources:
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-xs">
                            Vaccines:
                          </span>
                          <span className="font-medium text-xs">
                            {hospital.vaccineStock.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-xs">
                            Medicines:
                          </span>
                          <span className="font-medium text-xs">
                            {hospital.medicineStock.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
      </MapContainer>

      {/* Simulation Indicator */}
      {isSimulating && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg animate-pulse border border-red-600">
          🚨 OUTBREAK SIMULATION ACTIVE
        </div>
      )}
    </div>
  );
}
