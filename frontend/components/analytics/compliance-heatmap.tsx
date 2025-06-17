"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Repo } from "@/lib/types"

interface ComplianceHeatmapProps {
  repos: Repo[]
}

export function ComplianceHeatmap({ repos }: ComplianceHeatmapProps) {
  // Generate mock heatmap data for the last 7 weeks
  const weeks = 7
  const days = 7
  const heatmapData = Array.from({ length: weeks }, (_, weekIndex) =>
    Array.from({ length: days }, (_, dayIndex) => ({
      week: weekIndex,
      day: dayIndex,
      violations: Math.floor(Math.random() * 5),
      date: new Date(
        Date.now() - (weeks - weekIndex - 1) * 7 * 24 * 60 * 60 * 1000 - (days - dayIndex - 1) * 24 * 60 * 60 * 1000,
      ),
    })),
  ).flat()

  const getIntensity = (violations: number) => {
    if (violations === 0) return "bg-gray-700"
    if (violations <= 1) return "bg-green-500/30"
    if (violations <= 2) return "bg-yellow-500/50"
    if (violations <= 3) return "bg-orange-500/70"
    return "bg-red-500/90"
  }

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Violation Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-1 text-xs text-gray-400">
            {dayLabels.map((day) => (
              <div key={day} className="text-center">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {heatmapData.map((cell, index) => (
              <div
                key={index}
                className={`aspect-square rounded ${getIntensity(cell.violations)} border border-white/10`}
                title={`${cell.violations} violations on ${cell.date.toLocaleDateString()}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Less</span>
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-gray-700 rounded" />
              <div className="w-3 h-3 bg-green-500/30 rounded" />
              <div className="w-3 h-3 bg-yellow-500/50 rounded" />
              <div className="w-3 h-3 bg-orange-500/70 rounded" />
              <div className="w-3 h-3 bg-red-500/90 rounded" />
            </div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
