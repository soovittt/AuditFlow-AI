"use client"

import { useState, useEffect } from "react"
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
import { getToken } from "@/lib/auth"
import { BACKEND_BASE_URL } from "@/lib/config"
import { AnalyticsSummary } from "@/lib/types"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRepo, setSelectedRepo] = useState<string>("all")
  const [timeRange, setTimeRange] = useState<string>("30d")
  const [frameworkFilter, setFrameworkFilter] = useState<string>("all")

  const frameworks = ["SOC2", "HIPAA", "ISO27001", "Custom"] // For filter dropdown

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const token = getToken()
        const res = await fetch(`${BACKEND_BASE_URL}/api/analytics/summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) {
          throw new Error("Failed to fetch analytics data")
        }
        const data: AnalyticsSummary = await res.json()
        setAnalyticsData(data)
      } catch (error) {
        console.error(error)
        toast.error("Could not load analytics summary.")
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  const analyticsCards = analyticsData
    ? [
        {
          title: "Average Compliance Score",
          value: `${analyticsData.average_compliance_score}%`,
          change: "+2.5%", // Placeholder
          trend: "up" as const,
          icon: Target,
          color: "emerald",
        },
        {
          title: "Active Violations",
          value: analyticsData.active_violations.toString(),
          change: "-12%", // Placeholder
          trend: "down" as const,
          icon: AlertTriangle,
          color: "amber",
        },
        {
          title: "Avg. Resolution Time",
          value: "3.1 days", // Placeholder
          change: "-0.5 days", // Placeholder
          trend: "down" as const,
          icon: Clock,
          color: "blue",
        },
        {
          title: "Compliance Trend",
          value: "+5.2%", // Placeholder
          change: "This month",
          trend: "up" as const,
          icon: TrendingUp,
          color: "purple",
        },
      ]
    : []

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

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
                {/* Repo list can be populated from a future API call */}
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
        {analyticsData && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ComplianceChart data={analyticsData.compliance_trend} />
            <ViolationsChart data={analyticsData.top_violation_categories} />
          </div>
        )}

        {/* Heatmap and Highlights - To be implemented */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Activity Overview</h3>
            <p className="text-gray-400">Violation heatmap and key highlights will be implemented in a future step.</p>
        </div>

        {/* Repo-Level Summary */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Repository Summary</h3>
          <p className="text-gray-400">Repository-level summary will be implemented in a future step.</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
