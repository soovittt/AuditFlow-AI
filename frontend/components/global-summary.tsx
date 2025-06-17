"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, AlertTriangle, CheckCircle, GitBranch } from "lucide-react"
import type { Repo } from "@/lib/types"

interface GlobalSummaryProps {
  repos: Repo[]
}

export function GlobalSummary({ repos }: GlobalSummaryProps) {
  const overallScore = Math.round(repos.reduce((acc, repo) => acc + repo.complianceScore, 0) / repos.length)
  const activeViolations = repos.reduce((acc, repo) => acc + repo.violations.filter((v) => !v.resolved).length, 0)
  const healthyRepos = repos.filter((r) => r.status === "healthy").length

  const summaryCards = [
    {
      title: "Overall Compliance",
      value: `${overallScore}%`,
      description: "+2.5% from last week",
      icon: CheckCircle,
      iconColor: "text-emerald-400",
      trend: "up",
      bgGradient: "from-emerald-500/10 to-emerald-600/5",
    },
    {
      title: "Active Violations",
      value: activeViolations.toString(),
      description: "Across all repositories",
      icon: AlertTriangle,
      iconColor: "text-amber-400",
      trend: "down",
      bgGradient: "from-amber-500/10 to-amber-600/5",
    },
    {
      title: "Healthy Repositories",
      value: `${healthyRepos}/${repos.length}`,
      description: `${Math.round((healthyRepos / repos.length) * 100)}% compliance rate`,
      icon: GitBranch,
      iconColor: "text-blue-400",
      trend: "up",
      bgGradient: "from-blue-500/10 to-blue-600/5",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {summaryCards.map((card, index) => (
        <Card
          key={index}
          className={`bg-gradient-to-br ${card.bgGradient} backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-200`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-300">{card.title}</CardTitle>
            <card.icon className={`h-5 w-5 ${card.iconColor}`} />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-white">{card.value}</div>
            <div className="flex items-center space-x-2 text-sm">
              <TrendingUp className={`h-3 w-3 ${card.trend === "up" ? "text-emerald-400" : "text-red-400"}`} />
              <span className="text-gray-400">{card.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
