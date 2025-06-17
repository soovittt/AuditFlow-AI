"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScoreGauge } from "@/components/score-gauge"
import { Eye, Play, GitBranch, Calendar, AlertTriangle } from "lucide-react"
import type { Repo } from "@/lib/types"
import { useState } from "react"
import { getToken } from "@/lib/auth"

interface RepoCardProps {
  repo: Repo
  variant?: "grid" | "list"
}

export function RepoCard({ repo, variant = "grid" }: RepoCardProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [status, setStatus] = useState(repo.status)

  const handleScan = async () => {
    setIsScanning(true)
    setStatus("scanning")
    const token = getToken()
    try {
      console.log(`Scan requested for repo: ${repo.id} (${repo.name})`)
      await fetch(`http://localhost:8080/api/repos/${repo.id}/scan`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      // Optionally show a toast here
    } catch (err) {
      // Optionally handle error
      setStatus(repo.status)
    } finally {
      setIsScanning(false)
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "healthy":
        return {
          color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
          icon: "✅",
          label: "Healthy",
        }
      case "at-risk":
        return {
          color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
          icon: "⚠️",
          label: "At Risk",
        }
      case "non-compliant":
        return {
          color: "bg-red-500/20 text-red-400 border-red-500/30",
          icon: "❌",
          label: "Non-Compliant",
        }
      case "scanning":
        return {
          color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
          icon: "⏳",
          label: "Scanning...",
        }
      default:
        return {
          color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
          icon: "⚪",
          label: "Unknown",
        }
    }
  }

  const statusConfig = getStatusConfig(status)
  const activeViolations = repo.violations.filter((v) => !v.resolved).length

  if (variant === "list") {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <ScoreGauge score={repo.complianceScore} size={60} />
                <div>
                  <h3 className="text-lg font-semibold text-white">{repo.name}</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <Badge className={statusConfig.color}>
                      {statusConfig.icon} {statusConfig.label}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-400">
                      <Calendar className="h-4 w-4 mr-1" />
                      {repo.lastAudit}
                    </div>
                    {activeViolations > 0 && (
                      <div className="flex items-center text-sm text-amber-400">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {activeViolations} violations
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button asChild variant="outline" size="sm" className="border-white/20 text-gray-300 hover:text-white">
                <Link href={`/repo/${repo.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                onClick={handleScan}
                disabled={isScanning}
              >
                {isScanning ? (
                  <span className="flex items-center"><span className="loader mr-2" />Scanning…</span>
                ) : (
                  <><Play className="mr-2 h-4 w-4" />Scan Now</>
                )}
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
            <CardTitle className="text-white text-xl font-semibold">{repo.name}</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <GitBranch className="h-4 w-4" />
              <span>main</span>
              <span>•</span>
              <Calendar className="h-4 w-4" />
              <span>{repo.lastAudit}</span>
            </div>
          </div>
          <Badge className={statusConfig.color}>
            {statusConfig.icon} {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center justify-center">
          <ScoreGauge score={repo.complianceScore} size={100} />
        </div>

        {activeViolations > 0 && (
          <div className="flex items-center justify-center space-x-2 text-amber-400 bg-amber-500/10 rounded-lg p-3">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">{activeViolations} active violations</span>
          </div>
        )}

        <div className="flex space-x-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 border-white/20 text-gray-300 hover:text-white hover:bg-white/10"
          >
            <Link href={`/repo/${repo.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Details
            </Link>
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 shadow-lg"
            onClick={handleScan}
            disabled={isScanning}
          >
            {isScanning ? (
              <span className="flex items-center"><span className="loader mr-2" />Scanning…</span>
            ) : (
              <><Play className="mr-2 h-4 w-4" />Scan</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
