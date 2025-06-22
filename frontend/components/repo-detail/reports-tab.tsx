"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, FileText, File, TrendingUp, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import type { Repo, ViolationsData, ScanSummary } from "@/lib/types"
import { BACKEND_BASE_URL } from "@/lib/config"
import { getToken } from "@/lib/auth"
import { useState, useEffect } from "react"

interface ReportsTabProps {
  repo: Repo;
  violationsData: ViolationsData | null;
}

export function ReportsTab({ repo, violationsData }: ReportsTabProps) {
  const [scanHistory, setScanHistory] = useState<ScanSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScanHistory = async () => {
      if (!repo.id) return;
      setLoading(true);
      try {
        const token = getToken();
        if (!token) throw new Error("Authentication required.");
        const response = await fetch(`${BACKEND_BASE_URL}/api/repos/${repo.id}/scans`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch scan history.");
        const data = await response.json();
        setScanHistory(data);
      } catch (error) {
        console.error("Error fetching scan history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchScanHistory();
  }, [repo.id]);

  const latestScan = scanHistory?.[0];

  const downloadPDFReport = async () => {
    if (!latestScan?.scan_id) {
        alert("No scan available to generate a report.");
        return;
    }
    try {
      const token = getToken();
      if (!token) {
        alert("Authentication required");
        return;
      }

      const response = await fetch(`${BACKEND_BASE_URL}/api/repos/${repo.id}/report?scan_id=${latestScan.scan_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance_report_${repo.name}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to download PDF report: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 80) return "text-blue-400";
    if (score >= 70) return "text-yellow-400";
    if (score >= 60) return "text-orange-400";
    return "text-red-400";
  };

  const getGrade = (score: number) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
        <Button 
          className="bg-blue-600 hover:bg-blue-700" 
          onClick={downloadPDFReport}
          disabled={!latestScan}
        >
          <Download className="mr-2 h-4 w-4" />
          Generate PDF Report
        </Button>
      </div>

      {violationsData && (
        <>
          {/* Current Status Summary */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Current Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className={`text-3xl font-bold ${getScoreColor(violationsData.scores.overall_score)}`}>
                    {violationsData.scores.overall_score}%
                  </div>
                  <div className="text-sm text-gray-400">Overall Score</div>
                  <div className="text-xs text-gray-500">Grade: {getGrade(violationsData.scores.overall_score)}</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className={`text-3xl font-bold ${getScoreColor(violationsData.scores.security_score)}`}>
                    {violationsData.scores.security_score}%
                  </div>
                  <div className="text-sm text-gray-400">Security</div>
                  <div className="text-xs text-gray-500">Grade: {getGrade(violationsData.scores.security_score)}</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className={`text-3xl font-bold ${getScoreColor(violationsData.scores.compliance_score)}`}>
                    {violationsData.scores.compliance_score}%
                  </div>
                  <div className="text-sm text-gray-400">Compliance</div>
                  <div className="text-xs text-gray-500">Grade: {getGrade(violationsData.scores.compliance_score)}</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className={`text-3xl font-bold ${getScoreColor(violationsData.scores.quality_score)}`}>
                    {violationsData.scores.quality_score}%
                  </div>
                  <div className="text-sm text-gray-400">Code Quality</div>
                  <div className="text-xs text-gray-500">Grade: {getGrade(violationsData.scores.quality_score)}</div>
                </div>
              </div>

              {/* Violations Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                  <div className="text-xl font-bold text-red-400">{violationsData.summary.critical_count}</div>
                  <div className="text-xs text-gray-400">Critical Issues</div>
                </div>
                <div className="text-center p-3 bg-orange-900/20 rounded-lg border border-orange-500/30">
                  <div className="text-xl font-bold text-orange-400">{violationsData.summary.high_count}</div>
                  <div className="text-xs text-gray-400">High Priority</div>
                </div>
                <div className="text-center p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                  <div className="text-xl font-bold text-yellow-400">{violationsData.summary.medium_count}</div>
                  <div className="text-xs text-gray-400">Medium Priority</div>
                </div>
                <div className="text-center p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                  <div className="text-xl font-bold text-blue-400">{violationsData.summary.low_count}</div>
                  <div className="text-xs text-gray-400">Low Priority</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-400" />
                  Compliance Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">
                  Comprehensive PDF report with detailed analysis, scores, and recommendations.
                </p>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Executive Summary</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Detailed Violations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Compliance Standards</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Recommendations</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700" 
                  onClick={downloadPDFReport}
                  disabled={!latestScan}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-green-400" />
                  Analytics Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">
                  Interactive dashboard with trends, metrics, and compliance tracking.
                </p>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Score Trends</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Violation Patterns</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Compliance Tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Progress Metrics</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4 bg-green-600 hover:bg-green-700"
                  disabled
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Scan Information */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Latest Scan Information</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                 <div className="flex justify-center items-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                 </div>
              ) : latestScan ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Scan ID</label>
                    <p className="text-white font-mono text-sm">{latestScan.scan_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Scan Date</label>
                    <p className="text-white">{new Date(latestScan.scan_date).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Total Violations</label>
                    <p className="text-white">{latestScan.total_violations}</p>
                  </div>
      </div>
              ) : (
                <p className="text-gray-400 text-center">No scan history found.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!violationsData && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No scan data available for this repository.</p>
            <p className="text-sm text-gray-500">Run a compliance scan to generate reports.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
