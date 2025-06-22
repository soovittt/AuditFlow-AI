"use client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverviewTab } from "@/components/repo-detail/overview-tab"
import { ViolationsTab } from "@/components/repo-detail/violations-tab"
import { ReportsTab } from "@/components/repo-detail/reports-tab"
import { ScoringTab } from "@/components/repo-detail/scoring-tab"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Download, FileText, TrendingUp, Loader2 } from "lucide-react"
import { useSearchParams, useParams } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { BACKEND_BASE_URL } from "@/lib/config"
import { getToken } from "@/lib/auth"
import type { Repo, RepoComplianceSummary, ViolationsData, ScanUpdateMessage, Violation } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

export default function RepoDetailPage() {
  const params = useParams();
  const repoId = params?.id as string;
  const { toast } = useToast()
  
  const [summary, setSummary] = useState<RepoComplianceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState("");
  const [isRequestingScan, setIsRequestingScan] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [lastMessage, setLastMessage] = useState<ScanUpdateMessage | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingViolations, setIsLoadingViolations] = useState(false);
  const [repoName, setRepoName] = useState("Repository");

  const fetchSummaryData = useCallback(async () => {
    if (!repoId) return
    setIsLoadingSummary(true)
    try {
      const token = getToken()
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/repos/${repoId}/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      if (!response.ok) {
        throw new Error("Failed to fetch repository summary")
      }
      const data = await response.json()
      setSummary(data)
      setRepoName(data.repo_name || "Repository")
      if (data.active_scan_id) {
        setIsScanning(true);
        setScanStatus(data.status);
      }
    } catch (error: any) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not fetch repository summary.",
      })
      setError(error.message)
    } finally {
      setIsLoadingSummary(false)
    }
  }, [repoId, toast]);

  const fetchViolationsData = async () => {
    if (!repoId) return
    setIsLoadingViolations(true)
    try {
      const token = getToken()
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/repos/${repoId}/violations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      if (!response.ok) {
        throw new Error("Failed to fetch violations data")
      }
      const data = await response.json()
      // Handle violations data processing
    } catch (error: any) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not fetch violations data.",
      })
      setError(error.message)
    } finally {
      setIsLoadingViolations(false)
    }
  }

  useEffect(() => {
    if (repoId) {
      fetchSummaryData()
      // Initial fetch for violations tab if it's the active one
      if (activeTab === "violations") {
        fetchViolationsData()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repoId])

  // Refetch data when a new scan is completed
  useEffect(() => {
    if (lastMessage && lastMessage.type === "scan_completed") {
      toast({
        title: "Scan Complete",
        description: "Data has been updated.",
      })
      fetchSummaryData()
      if (activeTab === "violations") {
        fetchViolationsData()
      }
    }
  }, [lastMessage, activeTab]) // Re-run when activeTab changes as well

  useEffect(() => {
    if (!summary?.active_scan_id) {
      return;
    }

    const wsUrl = `${BACKEND_BASE_URL.replace(/^http/, 'ws')}/api/ws/${summary.active_scan_id}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsScanning(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if(data.progress !== undefined) setScanProgress(data.progress);
      if(data.summary) setScanStatus(data.summary);
      setLastMessage(data);

      if (data.status === 'completed' || data.status === 'failed') {
        setIsScanning(false);
        setScanProgress(100);
        toast({
          title: `Scan ${data.status}`,
          description: data.summary,
        })
        fetchSummaryData(); // Refetch data to get final results
        ws.close();
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setIsScanning(false);
      toast({
        title: "Connection Error",
        description: "Lost connection to the scan server.",
        variant: "destructive"
      })
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsScanning(false);
    };

    return () => {
      ws.close();
    };
  }, [summary?.active_scan_id, fetchSummaryData, toast]);


  const requestScan = async () => {
    setIsRequestingScan(true);
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Authentication required");
      }
      const response = await fetch(`${BACKEND_BASE_URL}/api/repos/${repoId}/scan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to start scan');
      }
      toast({
        title: "Scan Queued",
        description: "The repository scan has been successfully queued.",
      })
      // Refetch summary to get the active_scan_id and trigger WebSocket
      await fetchSummaryData();
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        toast({
          title: "Failed to Start Scan",
          description: errorMessage,
          variant: "destructive",
        })
    } finally {
        setIsRequestingScan(false);
    }
  };
  
  const downloadPDFReport = async () => {
    try {
      const token = getToken();
      if (!token) {
        alert("Authentication required");
        return;
      }

      const response = await fetch(`${BACKEND_BASE_URL}/api/repos/${repoId}/report`, {
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
      a.download = `compliance_report_${repoId}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to download PDF report: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (loading && !summary) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mb-4" />
          <h2 className="text-xl font-semibold text-white">Loading Repository Data</h2>
          <p className="text-gray-400">Please wait while we fetch the latest compliance details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center bg-red-900/20 p-8 rounded-lg">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Data</h2>
          <p className="text-gray-400">{error}</p>
          <Button onClick={fetchSummaryData} className="mt-4">
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!summary) {
    return (
        <DashboardLayout>
            <div className="text-center text-gray-400">No data available for this repository.</div>
        </DashboardLayout>
    )
  }

  const repoForTab: Repo = {
    id: String(summary.repo_id),
    name: summary.repo_name,
    complianceScore: summary.overall_score,
    status: summary.status as any,
    lastAudit: summary.last_scan_date || "N/A",
    violations: [],
  };

  const latestCompliance = summary.compliance_history?.[summary.compliance_history.length - 1];

  const violationsDataForTab: ViolationsData | null = summary ? {
    repo_id: summary.repo_id,
    scan_id: "N/A", 
    scan_date: summary.last_scan_date || new Date().toISOString(),
    violations: [], 
    summary: {
        total_violations: summary.open_violations_count,
        critical_count: summary.critical_violations_count,
        high_count: summary.high_violations_count,
        medium_count: summary.medium_violations_count,
        low_count: summary.low_violations_count,
    },
    scores: {
        overall_score: latestCompliance?.overall_score ?? summary.overall_score,
        security_score: latestCompliance?.security_score ?? 0,
        compliance_score: latestCompliance?.compliance_score ?? 0,
        quality_score: latestCompliance?.quality_score ?? 0,
    },
    violation_categories: {},
    priority_breakdown: {},
  } : null;

  const {
    repo_name,
    overall_score,
    grade,
    status,
    trend,
    open_violations_count,
    last_scan_date,
    compliance_history,
    violation_history,
  } = summary;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-white">{repo_name}</h1>
              <Badge variant="outline" className="text-orange-400 border-orange-400">
                <ExternalLink className="mr-1 h-3 w-3" />
                GitLab
              </Badge>
            </div>
            <p className="text-gray-400">Repository compliance monitoring and management</p>
          </div>
          <div className="flex space-x-3">
             <Button 
              onClick={requestScan}
              disabled={isScanning || isRequestingScan}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isRequestingScan ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <TrendingUp className="mr-2 h-4 w-4" />
              )}
              {isScanning ? 'Scan in Progress' : 'Start New Scan'}
            </Button>
            <Button 
              onClick={downloadPDFReport}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF Report
            </Button>
          </div>
        </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <span className="text-gray-400">Overall Score</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                {overall_score}%
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-400" />
                <span className="text-gray-400">Security</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {summary.compliance_history[summary.compliance_history.length -1]?.security_score ?? 0}%
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-purple-400" />
                <span className="text-gray-400">Compliance</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">
                 {summary.compliance_history[summary.compliance_history.length -1]?.compliance_score ?? 0}%
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-orange-400" />
                <span className="text-gray-400">Code Quality</span>
              </div>
              <div className="text-2xl font-bold text-orange-400">
                 {summary.compliance_history[summary.compliance_history.length -1]?.quality_score ?? 0}%
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="violations">Violations ({open_violations_count})</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="scoring">Scoring Details</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <OverviewTab 
                repo={repoForTab} 
                violationsData={violationsDataForTab}
                isScanning={isScanning}
                scanProgress={scanProgress}
                scanStatus={scanStatus}
             />
          </TabsContent>
          <TabsContent value="violations">
            <ViolationsTab repoId={repoId} />
          </TabsContent>
          <TabsContent value="reports">
            <ReportsTab repo={repoForTab} violationsData={violationsDataForTab} />
          </TabsContent>
          <TabsContent value="scoring">
            <ScoringTab summary={summary} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
