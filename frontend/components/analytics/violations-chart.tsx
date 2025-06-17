"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { Repo } from "@/lib/types"

interface ViolationsChartProps {
  repos: Repo[]
}

export function ViolationsChart({ repos }: ViolationsChartProps) {
  // Calculate violation categories
  const violationTypes = repos.reduce(
    (acc, repo) => {
      repo.violations.forEach((violation) => {
        const type = violation.type.split(" ")[0] // Get first word
        acc[type] = (acc[type] || 0) + 1
      })
      return acc
    },
    {} as Record<string, number>,
  )

  const data = Object.entries(violationTypes).map(([type, count]) => ({
    type,
    count,
  }))

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Top Violation Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="type" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#F9FAFB",
              }}
            />
            <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
