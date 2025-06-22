"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScoreGauge } from "@/components/score-gauge"
import { Play, Download, TrendingUp, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { Repo, ViolationsData } from "@/lib/types"
import { useRouter } from "next/navigation"

interface OverviewTabProps {
  repo: Repo;
  violationsData: ViolationsData | null;
  isScanning: boolean;
  scanProgress: number;
  scanStatus: string;
}

export function OverviewTab({ repo, violationsData, isScanning, scanProgress, scanStatus }: OverviewTabProps) {
  const router = useRouter();
  
  const handleScan = () => {
    // Simulate scan: just navigate to scan details page for this repo
    // (API call would go here)
    router.push(`/repo/${repo.id}?scan=1`);
  };

  const getStatusIcon = () => {
    if (!violationsData) return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
    if (violationsData.summary.total_violations === 0) return <CheckCircle className="h-5 w-5 text-green-400" />;
    if (violationsData.summary.critical_count > 0) return <AlertTriangle className="h-5 w-5 text-red-400" />;
    return <AlertTriangle className="h-5 w-5 text-orange-400" />;
  };

  const getStatusText = () => {
    if (!violationsData) return "No scan data";
    if (violationsData.summary.total_violations === 0) return "Compliant";
    if (violationsData.summary.critical_count > 0) return "Critical Issues";
    return "Issues Found";
  };

  const getStatusColor = () => {
    if (!violationsData) return "text-yellow-400";
    if (violationsData.summary.total_violations === 0) return "text-green-400";
    if (violationsData.summary.critical_count > 0) return "text-red-400";
    return "text-orange-400";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Current Score</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <ScoreGauge 
            score={violationsData?.scores.overall_score || repo.complianceScore} 
            size={120} 
          />
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">{isScanning ? 'Scan in Progress' : 'Last Scan'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isScanning ? (
            <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-3">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                    <p className="text-sm text-gray-300 font-medium">{scanStatus || 'Initializing...'}</p>
                </div>
                <Progress value={scanProgress} className="w-full" />
                <p className="text-right text-sm text-purple-300">{scanProgress}%</p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-2xl font-bold text-white">
                  {violationsData ? new Date(violationsData.scan_date).toLocaleDateString() : repo.lastAudit}
                </p>
                <p className="text-sm text-gray-400">
                  {violationsData ? new Date(violationsData.scan_date).toLocaleTimeString() : "N/A"}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  {getStatusIcon()}
                  <span className={`text-sm font-medium ${getStatusColor()}`}>
                    {getStatusText()}
                  </span>
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <Button variant="outline" className="w-full border-gray-600">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Score Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Security</span>
              <span className="text-blue-400 font-medium">
                {violationsData?.scores.security_score || 0}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Compliance</span>
              <span className="text-purple-400 font-medium">
                {violationsData?.scores.compliance_score || 0}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Code Quality</span>
              <span className="text-orange-400 font-medium">
                {violationsData?.scores.quality_score || 0}%
              </span>
            </div>
            <div className="border-t border-gray-600 pt-2 mt-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 font-medium">Overall</span>
                <span className="text-white font-bold">
                  {violationsData?.scores.overall_score || repo.complianceScore}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
