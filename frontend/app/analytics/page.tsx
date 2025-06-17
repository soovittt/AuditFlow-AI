"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AnalyticsCard } from "@/components/analytics/analytics-card"
import { ComplianceChart } from "@/components/analytics/compliance-chart"
import { ViolationsChart } from "@/components/analytics/violations-chart"
import { ComplianceHeatmap } from "@/components/analytics/compliance-heatmap"
import { HighlightsPanel } from "@/components/analytics/highlights-panel"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Download, TrendingUp, AlertTriangle, Clock, Target } from "lucide-react"
import { mockRepos } from "@/lib/mock-data"

export default function AnalyticsPage() {
  const [selectedRepo, setSelectedRepo] = useState<string>("all")
  const [timeRange, setTimeRange] = useState<string>("30d")
  const [frameworkFilter, setFrameworkFilter] = useState<string>("all")

  const repos = mockRepos
  const frameworks = ["SOC2", "HIPAA", "ISO27001", "Custom"]

  // Calculate analytics data
  const totalViolations = repos.reduce((acc, repo) => acc + repo.violations.length, 0)
  const activeViolations = repos.reduce((acc, repo) => acc + repo.violations.filter((v) => !v.resolved).length, 0)
  const avgScore = Math.round(repos.reduce((acc, repo) => acc + repo.complianceScore, 0) / repos.length)
  const healthyRepos = repos.filter((r) => r.status === "healthy").length

  const analyticsCards = [
    {
      title: "Average Compliance Score",
      value: `${avgScore}%`,
      change: "+2.5%",
      trend: "up" as const,
      icon: Target,
      color: "emerald",
    },
    {
      title: "Active Violations",
      value: activeViolations.toString(),
      change: "-12%",
      trend: "down" as const,
      icon: AlertTriangle,
      color: "amber",
    },
    {
      title: "Avg. Resolution Time",
      value: "2.3 days",
      change: "-0.5 days",
      trend: "down" as const,
      icon: Clock,
      color: "blue",
    },
    {
      title: "Compliance Trend",
      value: "+5.2%",
      change: "This month",
      trend: "up" as const,
      icon: TrendingUp,
      color: "purple",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Analytics
            </h1>
            <p className="text-gray-400 text-lg">Compliance trends and insights across your repositories</p>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" className="border-white/10 text-gray-400">
              <Download className="mr-2 h-4 w-4" />
              Export Analytics
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <Select value={selectedRepo} onValueChange={setSelectedRepo}>
              <SelectTrigger className="w-full lg:w-48 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Repository" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="all">All Repositories</SelectItem>
                {repos.map((repo) => (
                  <SelectItem key={repo.id} value={repo.id}>
                    {repo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full lg:w-48 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
              <SelectTrigger className="w-full lg:w-48 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Framework" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="all">All Frameworks</SelectItem>
                {frameworks.map((framework) => (
                  <SelectItem key={framework} value={framework}>
                    {framework}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DatePickerWithRange />
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {analyticsCards.map((card, index) => (
            <AnalyticsCard key={index} {...card} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ComplianceChart repos={repos} timeRange={timeRange} />
          <ViolationsChart repos={repos} />
        </div>

        {/* Heatmap and Highlights */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <ComplianceHeatmap repos={repos} />
          </div>
          <HighlightsPanel repos={repos} />
        </div>

        {/* Repo-Level Summary */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Repository Summary</h3>
          <div className="space-y-4">
            {repos.map((repo) => (
              <div key={repo.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{repo.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{repo.name}</h4>
                    <p className="text-sm text-gray-400">
                      {repo.violations.filter((v) => !v.resolved).length} active violations
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{repo.complianceScore}%</div>
                  <div className="text-sm text-emerald-400">+2.1% this month</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
