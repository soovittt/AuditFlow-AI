"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ReportCard } from "@/components/reports/report-card"
import { GenerateReportModal } from "@/components/reports/generate-report-modal"
import { ReportPreviewModal } from "@/components/reports/report-preview-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Plus, Search, Grid3X3, List, Download } from "lucide-react"
import { mockReports } from "@/lib/mock-data"
import type { Report } from "@/lib/types"

export default function ReportsPage() {
  const [reports] = useState(mockReports)
  const [searchQuery, setSearchQuery] = useState("")
  const [frameworkFilter, setFrameworkFilter] = useState<string>("all")
  const [repoFilter, setRepoFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [previewReport, setPreviewReport] = useState<Report | null>(null)

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.repository.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFramework = frameworkFilter === "all" || report.framework === frameworkFilter
    const matchesRepo = repoFilter === "all" || report.repository === repoFilter

    return matchesSearch && matchesFramework && matchesRepo
  })

  const uniqueRepos = Array.from(new Set(reports.map((r) => r.repository)))
  const frameworks = ["SOC2", "HIPAA", "ISO27001", "Custom"]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Reports
            </h1>
            <p className="text-gray-400 text-lg">Generate and manage compliance audit reports</p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowGenerateModal(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Generate New Report
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reports or repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

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

            <Select value={repoFilter} onValueChange={setRepoFilter}>
              <SelectTrigger className="w-full lg:w-48 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Repository" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="all">All Repositories</SelectItem>
                {uniqueRepos.map((repo) => (
                  <SelectItem key={repo} value={repo}>
                    {repo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DatePickerWithRange />

            <div className="flex items-center bg-white/5 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Reports Grid/List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Reports ({filteredReports.length})</h2>
            <Button variant="outline" size="sm" className="border-white/10 text-gray-400">
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredReports.map((report) => (
                <ReportCard key={report.id} report={report} onPreview={setPreviewReport} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <ReportCard key={report.id} report={report} variant="list" onPreview={setPreviewReport} />
              ))}
            </div>
          )}

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No reports found</h3>
              <p className="text-gray-400">Try adjusting your search criteria or generate a new report</p>
            </div>
          )}
        </div>
      </div>

      <GenerateReportModal open={showGenerateModal} onOpenChange={setShowGenerateModal} />

      <ReportPreviewModal report={previewReport} onClose={() => setPreviewReport(null)} />
    </DashboardLayout>
  )
}
