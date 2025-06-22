"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ReportCard } from "@/components/reports/report-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, List, Grid3X3, Download, Frown, Loader2 } from "lucide-react"
import { ReportHistoryItem } from "@/lib/types"
import { getToken } from "@/lib/auth"
import { BACKEND_BASE_URL } from "@/lib/config"

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        const token = getToken()
        if (!token) {
          setError("Authentication token not found.")
          setLoading(false)
          return
        }

        const res = await fetch(`${BACKEND_BASE_URL}/api/reports/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error("Failed to fetch reports history")
        }

        const data: ReportHistoryItem[] = await res.json()
        setReports(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  const filteredReports = reports.filter((report) =>
    report.repo_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-12 text-red-500">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Frown className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium mb-2">Error loading reports</h3>
          <p>{error}</p>
        </div>
      )
    }

    if (filteredReports.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No reports found</h3>
          <p className="text-gray-400">
            It looks like no scans have been completed yet. Once a repository scan is finished, the report will appear here.
          </p>
        </div>
      )
    }
    
    if (viewMode === "grid") {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
                <ReportCard key={report.scan_id} report={report} />
            ))}
            </div>
        )
    }

    return (
        <div className="space-y-4">
        {filteredReports.map((report) => (
            <ReportCard key={report.scan_id} report={report} variant="list" />
        ))}
        </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Reports
            </h1>
            <p className="text-gray-400 text-lg">
              History of all generated compliance audit reports
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by repository name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="flex items-center bg-white/5 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="h-9 w-9"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="h-9 w-9"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Reports Grid/List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">
              All Reports ({filteredReports.length})
            </h2>
            <Button variant="outline" size="sm" className="border-white/10 text-gray-400" disabled>
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
          </div>
          {renderContent()}
        </div>
      </div>
    </DashboardLayout>
  )
}
