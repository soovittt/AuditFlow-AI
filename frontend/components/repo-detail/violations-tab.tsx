"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExternalLink, Search, Filter } from "lucide-react"
import type { Repo } from "@/lib/types"

interface ViolationsTabProps {
  repo: Repo
}

export function ViolationsTab({ repo }: ViolationsTabProps) {
  const [filter, setFilter] = useState<string>("all")
  const [search, setSearch] = useState("")

  const filteredViolations = repo.violations.filter((violation) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "resolved" && violation.resolved) ||
      (filter === "unresolved" && !violation.resolved) ||
      violation.severity === filter

    const matchesSearch =
      violation.type.toLowerCase().includes(search.toLowerCase()) ||
      violation.description.toLowerCase().includes(search.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-600"
      case "medium":
        return "bg-yellow-600"
      case "low":
        return "bg-blue-600"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search violations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-gray-700 border-gray-600 text-white">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all">All Violations</SelectItem>
                <SelectItem value="unresolved">Unresolved</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="high">High Severity</SelectItem>
                <SelectItem value="medium">Medium Severity</SelectItem>
                <SelectItem value="low">Low Severity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredViolations.map((violation) => (
          <Card key={violation.id} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-white">{violation.type}</h3>
                    <Badge className={`${getSeverityColor(violation.severity)} text-white`}>
                      {violation.severity.toUpperCase()}
                    </Badge>
                    {violation.resolved && <Badge className="bg-green-600 text-white">RESOLVED</Badge>}
                  </div>
                  <p className="text-gray-300">{violation.description}</p>
                  <p className="text-sm text-blue-400">{violation.suggestedFix}</p>
                  <p className="text-xs text-gray-500">Found on {violation.date}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="border-gray-600">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  {!violation.resolved && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredViolations.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <p className="text-gray-400">No violations found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
