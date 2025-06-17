"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Clock, TrendingDown } from "lucide-react"
import type { Repo } from "@/lib/types"

interface HighlightsPanelProps {
  repos: Repo[]
}

export function HighlightsPanel({ repos }: HighlightsPanelProps) {
  // Calculate highlights
  const allViolations = repos.flatMap((repo) => repo.violations)
  const violationTypes = allViolations.reduce(
    (acc, violation) => {
      acc[violation.type] = (acc[violation.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const mostViolatedPolicy = Object.entries(violationTypes).sort(([, a], [, b]) => b - a)[0]

  const highlights = [
    {
      title: "Most Violated Policy",
      value: mostViolatedPolicy?.[0] || "None",
      subtitle: `${mostViolatedPolicy?.[1] || 0} occurrences this month`,
      icon: AlertTriangle,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Average Resolution Time",
      value: "2.3 days",
      subtitle: "0.5 days faster than last month",
      icon: Clock,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Largest Score Drop",
      value: "mobile-app",
      subtitle: "-12% compliance score",
      icon: TrendingDown,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
  ]

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Key Highlights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {highlights.map((highlight, index) => (
          <div key={index} className={`p-4 rounded-lg ${highlight.bgColor} border border-white/10`}>
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg bg-white/10`}>
                <highlight.icon className={`h-4 w-4 ${highlight.color}`} />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-400">{highlight.title}</div>
                <div className="text-lg font-semibold text-white">{highlight.value}</div>
                <div className="text-xs text-gray-500">{highlight.subtitle}</div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
