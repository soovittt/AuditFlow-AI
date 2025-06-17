"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Eye,
  Download,
  Link,
  Share,
  FileText,
  File,
  Calendar,
  GitBranch,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react"
import type { Report } from "@/lib/types"

interface ReportCardProps {
  report: Report
  variant?: "grid" | "list"
  onPreview: (report: Report) => void
}

export function ReportCard({ report, variant = "grid", onPreview }: ReportCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
          icon: CheckCircle,
          label: "Completed",
        }
      case "in-progress":
        return {
          color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
          icon: Clock,
          label: "In Progress",
        }
      case "failed":
        return {
          color: "bg-red-500/20 text-red-400 border-red-500/30",
          icon: XCircle,
          label: "Failed",
        }
      default:
        return {
          color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
          icon: Clock,
          label: "Unknown",
        }
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "PDF":
        return <FileText className="h-4 w-4" />
      case "Markdown":
        return <File className="h-4 w-4" />
      case "Google Doc":
        return <FileText className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const getFormatColor = (format: string) => {
    switch (format) {
      case "PDF":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "Markdown":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Google Doc":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const statusConfig = getStatusConfig(report.status)

  if (variant === "list") {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 flex-1">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white">{report.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center">
                      <GitBranch className="h-4 w-4 mr-1" />
                      {report.repository}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {report.generatedDate}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Badge className={statusConfig.color}>
                  <statusConfig.icon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">{report.framework}</Badge>
                <div className="flex space-x-1">
                  {report.formats.map((format) => (
                    <Badge key={format} className={getFormatColor(format)}>
                      {getFormatIcon(format)}
                      <span className="ml-1">{format}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-gray-300 hover:text-white"
                onClick={() => onPreview(report)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="border-white/20 text-gray-300 hover:text-white">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="border-white/20 text-gray-300 hover:text-white">
                <Link className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
              >
                <Share className="h-4 w-4" />
              </Button>
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
            <CardTitle className="text-white text-lg font-semibold">{report.title}</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <GitBranch className="h-4 w-4" />
              <span>{report.repository}</span>
              <span>•</span>
              <Calendar className="h-4 w-4" />
              <span>{report.generatedDate}</span>
            </div>
          </div>
          <Badge className={statusConfig.color}>
            <statusConfig.icon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">{report.framework}</Badge>

          <div className="flex flex-wrap gap-2">
            {report.formats.map((format) => (
              <Badge key={format} className={getFormatColor(format)}>
                {getFormatIcon(format)}
                <span className="ml-1">{format}</span>
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-gray-300 hover:text-white hover:bg-white/10"
            onClick={() => onPreview(report)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-gray-300 hover:text-white hover:bg-white/10"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-white/20 text-gray-300 hover:text-white hover:bg-white/10"
          >
            <Link className="mr-2 h-4 w-4" />
            Copy Link
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
          >
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
