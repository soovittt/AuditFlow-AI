"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  Link,
  FileText,
  Calendar,
  GitBranch,
  CheckCircle,
  TrendingUp,
  Loader2,
} from "lucide-react"
import { ReportHistoryItem } from "@/lib/types"
import { getToken } from "@/lib/auth"
import { BACKEND_BASE_URL } from "@/lib/config"

interface ReportCardProps {
  report: ReportHistoryItem
  variant?: "grid" | "list"
}

export function ReportCard({ report, variant = "grid" }: ReportCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const token = getToken()
      if (!token) {
        throw new Error("Authentication token not found.")
      }
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/repos/${report.repo_id}/report?scan_id=${report.scan_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to download report: ${response.statusText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `AuditFlow_Report_${report.repo_name}_${new Date(report.scan_date).toLocaleDateString()}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download failed", error)
      // You could show a toast notification here
    } finally {
      setIsDownloading(false)
    }
  }

  const getGradeColor = (grade: string) => {
    if (grade === "A") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    if (grade === "B") return "bg-green-500/20 text-green-400 border-green-500/30"
    if (grade === "C") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    if (grade === "D") return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    return "bg-red-500/20 text-red-400 border-red-500/30"
  }

  const commonContent = (
    <>
      <div className="flex items-center space-x-2">
        <Badge className={getGradeColor(report.grade)}>Grade: {report.grade}</Badge>
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 flex items-center">
          <TrendingUp className="h-3 w-3 mr-1" />
          Score: {report.overall_score.toFixed(1)}
        </Badge>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full border-white/20 text-gray-300 hover:text-white hover:bg-white/10"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download PDF
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="border-white/20 text-gray-300 hover:text-white hover:bg-white/10"
          disabled
        >
          <Link className="h-4 w-4" />
        </Button>
      </div>
    </>
  )

  if (variant === "list") {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-4 flex-1">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-md font-semibold text-white">{report.repo_name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1.5" />
                            {new Date(report.scan_date).toLocaleDateString()}
                        </div>
                         <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1.5 text-emerald-400" />
                            {report.status}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
              {commonContent}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/10">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-white text-lg font-semibold">{report.repo_name}</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <GitBranch className="h-4 w-4" />
              <span>ID: {report.repo_id}</span>
              <span>•</span>
              <Calendar className="h-4 w-4" />
              <span>{new Date(report.scan_date).toLocaleDateString()}</span>
            </div>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            {report.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {commonContent}
      </CardContent>
    </Card>
  )
}
