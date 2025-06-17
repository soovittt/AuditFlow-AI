"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScoreGauge } from "@/components/score-gauge"
import { Play, Download, TrendingUp } from "lucide-react"
import type { Repo } from "@/lib/types"
import { useRouter } from "next/navigation"

interface OverviewTabProps {
  repo: Repo
}

export function OverviewTab({ repo }: OverviewTabProps) {
  const router = useRouter();
  const handleScan = () => {
    // Simulate scan: just navigate to scan details page for this repo
    // (API call would go here)
    router.push(`/repo/${repo.id}?scan=1`);
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Current Score</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <ScoreGauge score={repo.complianceScore} size={120} />
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Last Scan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-2xl font-bold text-white">{repo.lastAudit}</p>
            <p className="text-sm text-gray-400">2 hours ago</p>
          </div>
          <div className="space-y-2">
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleScan}>
              <Play className="mr-2 h-4 w-4" />
              Trigger Scan
            </Button>
            <Button variant="outline" className="w-full border-gray-600">
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Score History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">7 days ago</span>
              <span className="text-white">82%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">5 days ago</span>
              <span className="text-white">85%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">3 days ago</span>
              <span className="text-white">87%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Today</span>
              <span className="text-white font-bold">{repo.complianceScore}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
