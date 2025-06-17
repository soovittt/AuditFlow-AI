"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface AnalyticsCardProps {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: LucideIcon
  color: "emerald" | "amber" | "blue" | "purple"
}

export function AnalyticsCard({ title, value, change, trend, icon: Icon, color }: AnalyticsCardProps) {
  const colorClasses = {
    emerald: "from-emerald-500/10 to-emerald-600/5 text-emerald-400",
    amber: "from-amber-500/10 to-amber-600/5 text-amber-400",
    blue: "from-blue-500/10 to-blue-600/5 text-blue-400",
    purple: "from-purple-500/10 to-purple-600/5 text-purple-400",
  }

  const trendColor = trend === "up" ? "text-emerald-400" : "text-red-400"
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown

  return (
    <Card
      className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-200`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${colorClasses[color].split(" ")[2]}`} />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-3xl font-bold text-white">{value}</div>
        <div className="flex items-center space-x-2 text-sm">
          <TrendIcon className={`h-3 w-3 ${trendColor}`} />
          <span className="text-gray-400">{change}</span>
        </div>
      </CardContent>
    </Card>
  )
}
