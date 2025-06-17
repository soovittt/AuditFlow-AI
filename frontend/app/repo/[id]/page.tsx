"use client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverviewTab } from "@/components/repo-detail/overview-tab"
import { ViolationsTab } from "@/components/repo-detail/violations-tab"
import { ReportsTab } from "@/components/repo-detail/reports-tab"
import { PolicyTab } from "@/components/repo-detail/policy-tab"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"
import { useSearchParams, useParams } from "next/navigation"
import { mockRepos } from "@/lib/mock-data"

function getStaticScanData() {
  const repoName = "audit-flow-sample-repo-2";
  return {
    repoName,
    overallCompliance: 94,
    socCompliance: 91,
    healthy: true,
    codeIssues: [
      { type: "Warning", file: "pages/_document.tsx", message: "Unused import: 'Html'" },
      { type: "Error", file: "pages/api/auth/[...nextauth].ts", message: "Missing type annotation for 'req'" },
      { type: "Warning", file: "components/Header.tsx", message: "No default export found" },
      { type: "Info", file: "next.config.mjs", message: "Custom security headers set" },
      { type: "Good", file: "pages/_app.tsx", message: "StrictMode enabled" },
    ],
    socFindings: [
      { type: "Critical", message: "No audit logging middleware detected" },
      { type: "Warning", message: "No explicit session timeout in NextAuth config" },
      { type: "Good", message: "All secrets loaded from environment variables" },
      { type: "Good", message: "CI/CD pipeline detected" },
      { type: "Good", message: "HTTPS enforced in production" },
      { type: "Good", message: "SOC2 policy.md present" },
    ],
    summary: `Your Next.js production repository (${repoName}) is mostly compliant. Address the above issues to reach 100% compliance. No critical vulnerabilities detected in dependencies. All environment variables are properly managed.`,
    lastScan: "2025-06-17 10:32 UTC",
    scanId: "scan-20250617-001"
  };
}

export default function RepoDetailPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const repoId = params?.id as string;
  const repo = mockRepos.find(r => r.id === repoId) ?? mockRepos[0];
  const showScan = searchParams?.get("scan") === "1";
  const scanData = getStaticScanData();

  if (showScan) {
    return (
      <div style={{ padding: 32 }}>
        <h1 className="text-3xl font-bold mb-2">Scan Report: <span className="text-blue-300">{scanData.repoName}</span></h1>
        <div className="flex gap-8 mb-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-lg text-gray-400">Overall Compliance</div>
            <div className="text-4xl font-bold text-green-400">{scanData.overallCompliance}%</div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-lg text-gray-400">SOC Compliance</div>
            <div className="text-4xl font-bold text-blue-400">{scanData.socCompliance}%</div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-lg text-gray-400">Status</div>
            <div className="text-2xl font-bold text-white">{scanData.healthy ? "Healthy" : "Issues Found"}</div>
          </div>
        </div>
        <div className="mb-4 text-gray-400">Last Scan: {scanData.lastScan} | Scan ID: <span className="text-gray-300">{scanData.scanId}</span></div>
        <h2 className="text-2xl font-semibold mt-8 mb-2">Code Issues</h2>
        <ul className="mb-6">
          {scanData.codeIssues.map((issue, i) => (
            <li key={i} className="mb-1"><b>{issue.type}:</b> <span className="text-yellow-300">{issue.file}</span> - {issue.message}</li>
          ))}
        </ul>
        <h2 className="text-2xl font-semibold mb-2">SOC Compliance Findings</h2>
        <ul className="mb-6">
          {scanData.socFindings.map((finding, i) => (
            <li key={i} className="mb-1"><b>{finding.type}:</b> {finding.message}</li>
          ))}
        </ul>
        <h2 className="text-2xl font-semibold mb-2">Summary</h2>
        <p className="mb-8">{scanData.summary}</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-white">{repo.name}</h1>
              <Badge variant="outline" className="text-orange-400 border-orange-400">
                <ExternalLink className="mr-1 h-3 w-3" />
                GitLab
              </Badge>
            </div>
            <p className="text-gray-400">Repository compliance monitoring and management</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="violations">Violations</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="policy">Policy</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab repo={repo} />
          </TabsContent>

          <TabsContent value="violations">
            <ViolationsTab repo={repo} />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab repo={repo} />
          </TabsContent>

          <TabsContent value="policy">
            <PolicyTab repo={repo} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
