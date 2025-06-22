"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExternalLink, Search, Filter, AlertTriangle, Clock, CheckCircle, Loader2 } from "lucide-react"
import type { Repo, Violation } from "@/lib/types"
import { BACKEND_BASE_URL } from "@/lib/config"
import { getToken } from "@/lib/auth"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ViolationsTabProps {
  repoId: string;
}

export function ViolationsTab({ repoId }: ViolationsTabProps) {
  const [violations, setViolations] = useState<Violation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (repoId) {
      fetchViolations()
    }
  }, [repoId])

  const fetchViolations = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = getToken()
      if (!token) throw new Error("Authentication token not found.")

      const response = await fetch(`${BACKEND_BASE_URL}/api/repos/${repoId}/violations`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to fetch violations.")
      }

      const data = await response.json()
      setViolations(data.violations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.")
    } finally {
      setLoading(false)
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>
      case "high":
        return <Badge className="bg-orange-500">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-500">Medium</Badge>
      case "low":
        return <Badge className="bg-blue-500">Low</Badge>
      default:
        return <Badge variant="secondary">{severity}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-400 text-center py-10">{error}</div>
  }

  return (
    <Card className="mt-6 bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle>Open Violations</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Severity</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>File</TableHead>
              <TableHead>Discovered</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {violations && violations.length > 0 ? (
              violations.map((v) => (
                <TableRow key={v.violation_id}>
                  <TableCell>{getSeverityBadge(v.severity)}</TableCell>
                  <TableCell>{v.description}</TableCell>
                  <TableCell className="font-mono">{v.location}</TableCell>
                  <TableCell>{new Date(v.discovered_date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-gray-400">
                  No open violations found. Great job!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
