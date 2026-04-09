"use client";

import { useState, useEffect } from "react";
import {
  Brain,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { aiRecommendations } from "../data/sampleData";

interface AIRecommendationsProps {
  isSimulating: boolean;
}

interface OutbreakRecommendation {
  id: string;
  title: string;
  description: string;
  action: string;
  priority: "high" | "medium" | "low";
  impact: string;
}

// Additional outbreak-specific recommendations
const outbreakRecommendations: OutbreakRecommendation[] = [
  {
    id: "outbreak-1",
    title: "Emergency Bed Capacity Expansion",
    description:
      "Current outbreak simulation shows critical bed shortage across high-risk barangays. Immediate capacity expansion required.",
    action:
      "Deploy mobile medical units to Guadalupe and Mandaue Centro. Set up emergency triage centers in public buildings.",
    priority: "high",
    impact: "Prevent healthcare system collapse",
  },
  {
    id: "outbreak-2",
    title: "Accelerated Vector Control",
    description:
      "Outbreak patterns suggest rapid mosquito population growth. Enhanced vector control measures needed immediately.",
    action:
      "Deploy emergency fogging teams to all affected areas. Implement community-wide cleanup campaigns within 24 hours.",
    priority: "high",
    impact: "70% reduction in transmission rate",
  },
  {
    id: "outbreak-3",
    title: "Emergency Medicine Redistribution",
    description:
      "Simulation shows critical medicine shortages in outbreak zones. Emergency supply redistribution required.",
    action:
      "Redirect medicine stocks from low-risk areas to outbreak zones. Contact WHO for emergency medical supplies.",
    priority: "high",
    impact: "Ensure adequate treatment for 95% of cases",
  },
  {
    id: "outbreak-4",
    title: "Public Health Emergency Declaration",
    description:
      "Outbreak magnitude requires coordinated emergency response and public awareness campaign.",
    action:
      "Issue public health emergency. Activate emergency response teams. Launch mass media awareness campaign.",
    priority: "medium",
    impact: "Improve public compliance by 85%",
  },
];

function getPriorityColor(priority: string): string {
  switch (priority) {
    case "high":
      return "text-red-700 border-red-200";
    case "medium":
      return "text-amber-700 border-amber-200";
    case "low":
      return "text-blue-700 border-blue-200";
    default:
      return "text-slate-700 border-slate-200";
  }
}

function getPriorityBg(priority: string): string {
  switch (priority) {
    case "high":
      return "bg-red-50";
    case "medium":
      return "bg-amber-50";
    case "low":
      return "bg-blue-50";
    default:
      return "bg-slate-50";
  }
}

function getPriorityIcon(priority: string) {
  switch (priority) {
    case "high":
      return <AlertTriangle className="w-4 h-4" />;
    case "medium":
      return <TrendingUp className="w-4 h-4" />;
    case "low":
      return <CheckCircle className="w-4 h-4" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
}

export default function AIRecommendations({
  isSimulating,
}: AIRecommendationsProps) {
  const [currentRecommendations, setCurrentRecommendations] =
    useState(aiRecommendations);

  useEffect(() => {
    if (isSimulating) {
      // During simulation, show outbreak-specific recommendations
      setCurrentRecommendations([
        ...outbreakRecommendations,
        ...aiRecommendations.slice(0, 2),
      ]);
    } else {
      // Normal mode, show regular recommendations
      setCurrentRecommendations(aiRecommendations);
    }
  }, [isSimulating]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#f3bdc8]/20 rounded-lg">
            <Brain className="w-5 h-5 text-[#758db9]" />
          </div>
          <div>
            <h2 className="text-base lg:text-lg font-semibold text-slate-800">
              AI Recommendations
            </h2>
            <p className="text-xs lg:text-sm text-slate-600">
              {isSimulating
                ? "Emergency outbreak response"
                : "Proactive health strategies"}
            </p>
          </div>
        </div>
        {isSimulating && (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium">
            <AlertTriangle className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Emergency Mode</span>
            <span className="sm:hidden">Emergency</span>
          </div>
        )}
      </div>

      {/* AI Recommendations */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {currentRecommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className={`
              p-3 lg:p-4 rounded-lg border transition-all duration-200 hover:shadow-md
              ${getPriorityColor(recommendation.priority)} ${getPriorityBg(
              recommendation.priority
            )}
            `}
          >
            <div className="flex items-start gap-2 lg:gap-3 mb-2 lg:mb-3">
              <div
                className={`
                p-1.5 lg:p-2 rounded-lg ${getPriorityBg(
                  recommendation.priority
                )}
              `}
              >
                {getPriorityIcon(recommendation.priority)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 lg:mb-2">
                  <h4 className="font-semibold text-slate-800 text-xs lg:text-sm">
                    {recommendation.title}
                  </h4>
                  <span
                    className={`
                    px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full text-xs font-medium uppercase border
                    ${getPriorityColor(
                      recommendation.priority
                    )} ${getPriorityBg(recommendation.priority)}
                  `}
                  >
                    {recommendation.priority}
                  </span>
                </div>
                <p className="text-xs lg:text-sm text-slate-600 leading-relaxed">
                  {recommendation.description}
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-2 lg:p-3 mb-2 lg:mb-3">
              <div className="text-xs lg:text-sm text-[#758db9] font-medium mb-1">
                Recommended Action:
              </div>
              <div className="text-xs lg:text-sm text-slate-700">
                {recommendation.action}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs lg:text-sm">
              <span className="text-slate-500">Predicted Impact:</span>
              <span className="text-green-600 font-medium">
                {recommendation.impact}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
