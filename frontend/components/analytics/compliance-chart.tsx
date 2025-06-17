"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { Repo } from "@/lib/types"

interface ComplianceChartProps {
  repos: Repo[]
  timeRange: string
}

export function ComplianceChart({ repos, timeRange }: ComplianceChartProps) {
  // Mock data for the chart
  const data = [
    { date: "May 1", score: 76 },
    { date: "May 8", score: 78 },
    { date: "May 15", score: 80 },
    { date: "May 22", score: 81 },
    { date: "May 29", score: 83 },
    { date: "Jun 5", score: 85 },
    { date: "Jun 12", score: 88 },
    { date: "Jun 17", score: 94 }, // latest
  ]

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Compliance Score Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#F9FAFB",
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#8B5CF6"
              strokeWidth={3}
              dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#8B5CF6", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
