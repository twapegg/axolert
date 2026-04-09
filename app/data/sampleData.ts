// Sample data for Axolert Dashboard - Cebu Region VII
export interface BarangayData {
  id: string;
  name: string;
  city: string;
  coordinates: [number, number]; // [lat, lng]
  riskLevel: "safe" | "moderate" | "high";
  predictedCases: number;
  currentBeds: number;
  neededBeds: number;
  vaccineStock: number;
  predictedVaccineNeeded: number;
  medicineStock: number;
  predictedMedicineNeeded: number;
}

export interface Hospital {
  id: string;
  name: string;
  coordinates: [number, number];
  totalBeds: number;
  availableBeds: number;
  icuBeds: number;
  availableIcuBeds: number;
  vaccineStock: number;
  medicineStock: number;
}

export interface PredictionData {
  date: string;
  bedsAvailable: number;
  bedsNeeded: number;
  vaccinesAvailable: number;
  vaccinesNeeded: number;
  medicinesAvailable: number;
  medicinesNeeded: number;
}

export interface ShortageAlert {
  location: string;
  resource: string;
  shortage: number;
  daysUntil: number;
  severity: "low" | "medium" | "high";
}

// Cebu Region VII Barangays Data
export const barangayData: BarangayData[] = [
  {
    id: "guadalupe",
    name: "Guadalupe",
    city: "Cebu City",
    coordinates: [10.2958, 123.9072],
    riskLevel: "high",
    predictedCases: 250,
    currentBeds: 30,
    neededBeds: 50,
    vaccineStock: 500,
    predictedVaccineNeeded: 750,
    medicineStock: 200,
    predictedMedicineNeeded: 300,
  },
  {
    id: "lahug",
    name: "Lahug",
    city: "Cebu City",
    coordinates: [10.3157, 123.8854],
    riskLevel: "moderate",
    predictedCases: 120,
    currentBeds: 25,
    neededBeds: 30,
    vaccineStock: 800,
    predictedVaccineNeeded: 600,
    medicineStock: 150,
    predictedMedicineNeeded: 180,
  },
  {
    id: "banilad",
    name: "Banilad",
    city: "Cebu City",
    coordinates: [10.3364, 123.9062],
    riskLevel: "safe",
    predictedCases: 45,
    currentBeds: 40,
    neededBeds: 20,
    vaccineStock: 1200,
    predictedVaccineNeeded: 300,
    medicineStock: 300,
    predictedMedicineNeeded: 150,
  },
  {
    id: "mandaue-center",
    name: "Centro",
    city: "Mandaue City",
    coordinates: [10.3233, 123.9227],
    riskLevel: "high",
    predictedCases: 180,
    currentBeds: 20,
    neededBeds: 45,
    vaccineStock: 300,
    predictedVaccineNeeded: 1550,
    medicineStock: 100,
    predictedMedicineNeeded: 220,
  },
  {
    id: "lapu-lapu-poblacion",
    name: "Poblacion",
    city: "Lapu-Lapu City",
    coordinates: [10.3103, 123.9494],
    riskLevel: "moderate",
    predictedCases: 95,
    currentBeds: 35,
    neededBeds: 25,
    vaccineStock: 600,
    predictedVaccineNeeded: 500,
    medicineStock: 180,
    predictedMedicineNeeded: 120,
  },
  {
    id: "talisay-poblacion",
    name: "Poblacion",
    city: "Talisay City",
    coordinates: [10.2441, 123.8495],
    riskLevel: "safe",
    predictedCases: 60,
    currentBeds: 45,
    neededBeds: 18,
    vaccineStock: 900,
    predictedVaccineNeeded: 400,
    medicineStock: 250,
    predictedMedicineNeeded: 180,
  },
];

// Hospitals Data
export const hospitalData: Hospital[] = [
  {
    id: "cebu-city-medical",
    name: "Cebu City Medical Center",
    coordinates: [10.3157, 123.8854],
    totalBeds: 400,
    availableBeds: 120,
    icuBeds: 50,
    availableIcuBeds: 15,
    vaccineStock: 2500,
    medicineStock: 1800,
  },
  {
    id: "vicente-sotto",
    name: "Vicente Sotto Memorial Medical Center",
    coordinates: [10.2958, 123.9072],
    totalBeds: 600,
    availableBeds: 180,
    icuBeds: 80,
    availableIcuBeds: 25,
    vaccineStock: 3200,
    medicineStock: 2400,
  },
  {
    id: "mandaue-district",
    name: "Mandaue District Hospital",
    coordinates: [10.3233, 123.9227],
    totalBeds: 200,
    availableBeds: 45,
    icuBeds: 20,
    availableIcuBeds: 5,
    vaccineStock: 800,
    medicineStock: 600,
  },
  {
    id: "lapu-lapu-district",
    name: "Lapu-Lapu District Hospital",
    coordinates: [10.3103, 123.9494],
    totalBeds: 150,
    availableBeds: 60,
    icuBeds: 15,
    availableIcuBeds: 8,
    vaccineStock: 1200,
    medicineStock: 900,
  },
];

// 7-day prediction data
export const predictionData: PredictionData[] = [
  {
    date: "2025-09-10",
    bedsAvailable: 405,
    bedsNeeded: 380,
    vaccinesAvailable: 7700,
    vaccinesNeeded: 6500,
    medicinesAvailable: 5700,
    medicinesNeeded: 5200,
  },
  {
    date: "2025-09-11",
    bedsAvailable: 395,
    bedsNeeded: 420,
    vaccinesAvailable: 7200,
    vaccinesNeeded: 7200,
    medicinesAvailable: 5400,
    medicinesNeeded: 5800,
  },
  {
    date: "2025-09-12",
    bedsAvailable: 380,
    bedsNeeded: 465,
    vaccinesAvailable: 6800,
    vaccinesNeeded: 8100,
    medicinesAvailable: 5100,
    medicinesNeeded: 6500,
  },
  {
    date: "2025-09-13",
    bedsAvailable: 365,
    bedsNeeded: 510,
    vaccinesAvailable: 6200,
    vaccinesNeeded: 9200,
    medicinesAvailable: 4700,
    medicinesNeeded: 7300,
  },
  {
    date: "2025-09-14",
    bedsAvailable: 350,
    bedsNeeded: 555,
    vaccinesAvailable: 5500,
    vaccinesNeeded: 10500,
    medicinesAvailable: 4300,
    medicinesNeeded: 8200,
  },
  {
    date: "2025-09-15",
    bedsAvailable: 330,
    bedsNeeded: 600,
    vaccinesAvailable: 4800,
    vaccinesNeeded: 12000,
    medicinesAvailable: 3900,
    medicinesNeeded: 9100,
  },
  {
    date: "2025-09-16",
    bedsAvailable: 315,
    bedsNeeded: 650,
    vaccinesAvailable: 4000,
    vaccinesNeeded: 13800,
    medicinesAvailable: 3400,
    medicinesNeeded: 10200,
  },
];

// Shortage alerts
export const shortageAlerts: ShortageAlert[] = [
  {
    location: "Guadalupe",
    resource: "Beds",
    shortage: -20,
    daysUntil: 4,
    severity: "high",
  },
  {
    location: "Mandaue Centro",
    resource: "Vaccines",
    shortage: -1250,
    daysUntil: 6,
    severity: "high",
  },
  {
    location: "Cebu City Medical Center",
    resource: "ICU Beds",
    shortage: -10,
    daysUntil: 3,
    severity: "medium",
  },
  {
    location: "Mandaue District Hospital",
    resource: "Medicines",
    shortage: -300,
    daysUntil: 5,
    severity: "medium",
  },
];

// AI-generated recommendations
export const aiRecommendations = [
  {
    id: "1",
    priority: "high",
    title: "Critical ICU Bed Shortage Incoming",
    description:
      "Guadalupe ICU beds will run out in 4 days. Recommend reallocating 15 ICU beds from Cebu City Medical Center.",
    action: "Transfer 15 ICU beds from CCMC to Vicente Sotto Memorial",
    impact: "Prevents 85% of predicted overflow cases",
  },
  {
    id: "2",
    priority: "high",
    title: "Vaccine Supply Chain Alert",
    description:
      "Mandaue Centro vaccine shortage approaching critical levels. Emergency procurement recommended.",
    action: "Rush order 2,000 dengue vaccines for Mandaue district",
    impact: "Covers 130% of predicted demand surge",
  },
  {
    id: "3",
    priority: "medium",
    title: "Resource Optimization Opportunity",
    description:
      "Banilad and Talisay have excess capacity. Consider redistribution to high-risk areas.",
    action: "Redistribute 25 beds and 500 vaccine doses",
    impact: "Improves overall regional preparedness by 23%",
  },
];
