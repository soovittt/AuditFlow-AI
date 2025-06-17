"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, FileText, File } from "lucide-react"
import type { Repo } from "@/lib/types"

interface ReportsTabProps {
  repo: Repo
}

export function ReportsTab({ repo }: ReportsTabProps) {
  const reports = [
    {
      id: "1",
      date: "2024-01-15",
      format: "PDF",
      title: "Compliance Report - January 2024",
      preview: "Executive Summary: Repository compliance score improved to 89%...",
    },
    {
      id: "2",
      date: "2024-01-01",
      format: "Markdown",
      title: "Monthly Security Audit",
      preview: "# Security Audit Report\n\n## Overview\nThis report covers...",
    },
    {
      id: "3",
      date: "2023-12-15",
      format: "Google Doc",
      title: "Q4 Compliance Review",
      preview: "Quarterly review of compliance metrics and recommendations...",
    },
  ]

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
        return "bg-red-600"
      case "Markdown":
        return "bg-blue-600"
      case "Google Doc":
        return "bg-green-600"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Reports</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">Generate New Report</Button>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-white">{report.title}</h3>
                    <Badge className={`${getFormatColor(report.format)} text-white`}>
                      {getFormatIcon(report.format)}
                      <span className="ml-1">{report.format}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">Generated on {report.date}</p>
                  <p className="text-gray-300 text-sm bg-gray-700 p-3 rounded border-l-4 border-blue-500">
                    {report.preview}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button variant="outline" size="sm" className="border-gray-600">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
